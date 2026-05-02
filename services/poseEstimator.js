import fs from 'fs-extra'
import fetch from 'node-fetch'

const HF_API_BASE_URL = 'https://api-inference.huggingface.co/models'
const FRAME_TIMEOUT_MS = 30_000
const MODEL_LOAD_RETRY_DELAY_MS = 10_000
const PRIMARY_MODEL = 'lllyasviel/control_v11p_sd15_openpose'
const FALLBACK_MODEL = 'nicehuster/vitpose'

const REQUESTED_KEYPOINTS = [
  'nose',
  'left_eye',
  'right_eye',
  'left_shoulder',
  'right_shoulder',
  'left_elbow',
  'right_elbow',
  'left_wrist',
  'right_wrist',
  'left_hip',
  'right_hip',
  'left_knee',
  'right_knee',
  'left_ankle',
  'right_ankle',
]

const COCO_KEYPOINT_ORDER = [
  'nose',
  'left_eye',
  'right_eye',
  'left_ear',
  'right_ear',
  'left_shoulder',
  'right_shoulder',
  'left_elbow',
  'right_elbow',
  'left_wrist',
  'right_wrist',
  'left_hip',
  'right_hip',
  'left_knee',
  'right_knee',
  'left_ankle',
  'right_ankle',
]

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isNumeric(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

function toPoint(candidate) {
  if (!candidate) return null

  if (Array.isArray(candidate)) {
    const [x, y, confidence = 0] = candidate
    if (isNumeric(x) && isNumeric(y)) {
      return { x, y, confidence: isNumeric(confidence) ? confidence : 0 }
    }
    return null
  }

  if (typeof candidate === 'object') {
    const x = candidate.x ?? candidate[0]
    const y = candidate.y ?? candidate[1]
    const confidence = candidate.confidence ?? candidate.score ?? candidate.probability ?? candidate[2] ?? 0

    if (isNumeric(x) && isNumeric(y)) {
      return { x, y, confidence: isNumeric(confidence) ? confidence : 0 }
    }
  }

  return null
}

function averageConfidence(keypoints) {
  const confidences = Object.values(keypoints)
    .map((point) => point?.confidence ?? 0)
    .filter((confidence) => isNumeric(confidence))

  if (confidences.length === 0) {
    return 0
  }

  return confidences.reduce((sum, value) => sum + value, 0) / confidences.length
}

function hasRequestedKeypoints(keypoints) {
  return REQUESTED_KEYPOINTS.every((key) => key in keypoints)
}

function mapArrayKeypoints(points) {
  const mapped = {}

  COCO_KEYPOINT_ORDER.forEach((name, index) => {
    const point = toPoint(points[index])
    if (point && REQUESTED_KEYPOINTS.includes(name)) {
      mapped[name] = point
    }
  })

  return hasRequestedKeypoints(mapped) ? mapped : null
}

function mapNamedKeypoints(entries) {
  const mapped = {}

  entries.forEach((entry) => {
    if (!entry || typeof entry !== 'object') return

    const name = entry.name ?? entry.label ?? entry.part ?? entry.key ?? entry.id
    if (!REQUESTED_KEYPOINTS.includes(name)) return

    const point = toPoint(entry)
    if (point) {
      mapped[name] = point
    }
  })

  return hasRequestedKeypoints(mapped) ? mapped : null
}

function mapObjectKeypoints(candidate) {
  const mapped = {}

  REQUESTED_KEYPOINTS.forEach((name) => {
    const point = toPoint(candidate[name])
    if (point) {
      mapped[name] = point
    }
  })

  return hasRequestedKeypoints(mapped) ? mapped : null
}

function normalizePoseCandidate(candidate) {
  if (!candidate) return null

  if (Array.isArray(candidate)) {
    if (candidate.length >= COCO_KEYPOINT_ORDER.length) {
      return mapArrayKeypoints(candidate)
    }

    return mapNamedKeypoints(candidate)
  }

  if (typeof candidate === 'object') {
    if (candidate.keypoints) {
      return normalizePoseCandidate(candidate.keypoints)
    }

    if (candidate.pose) {
      return normalizePoseCandidate(candidate.pose)
    }

    const mappedObject = mapObjectKeypoints(candidate)
    if (mappedObject) {
      return mappedObject
    }
  }

  return null
}

function collectCandidates(payload) {
  if (!payload) return []

  if (Array.isArray(payload)) {
    const directCandidate = normalizePoseCandidate(payload)
    const nestedCandidates = payload.flatMap((item) => collectCandidates(item))
    return directCandidate ? [payload, ...nestedCandidates] : nestedCandidates
  }

  if (typeof payload !== 'object') {
    return []
  }

  const candidates = []
  const nestedKeys = ['predictions', 'outputs', 'poses', 'people', 'result', 'instances', 'data', 'body_pose']

  const directCandidate = normalizePoseCandidate(payload)
  if (directCandidate) {
    candidates.push(payload)
  }

  nestedKeys.forEach((key) => {
    if (key in payload) {
      candidates.push(...collectCandidates(payload[key]))
    }
  })

  return candidates
}

function extractKeypoints(payload) {
  const direct = normalizePoseCandidate(payload)
  if (direct) {
    return direct
  }

  const candidates = collectCandidates(payload)
    .map((candidate) => normalizePoseCandidate(candidate))
    .filter(Boolean)

  if (candidates.length === 0) {
    return null
  }

  return candidates.sort((left, right) => averageConfidence(right) - averageConfidence(left))[0]
}

async function callHuggingFaceModel(model, imageBase64, attempt = 0) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FRAME_TIMEOUT_MS)

  try {
    const response = await fetch(`${HF_API_BASE_URL}/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        'Content-Type': 'image/jpeg',
        Accept: 'application/json',
      },
      body: Buffer.from(imageBase64, 'base64'),
      signal: controller.signal,
    })

    if (response.status === 503 && attempt === 0) {
      console.warn(`[POSE] ${model} is loading, retrying once in 10s`)
      await sleep(MODEL_LOAD_RETRY_DELAY_MS)
      return callHuggingFaceModel(model, imageBase64, 1)
    }

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`${response.status} ${response.statusText}: ${errorText.slice(0, 200)}`)
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      throw new Error(`Unexpected content type from ${model}: ${contentType}`)
    }

    return response.json()
  } finally {
    clearTimeout(timeoutId)
  }
}

async function estimateSingleFrame(framePath, modelState) {
  const imageBuffer = await fs.readFile(framePath)
  const imageBase64 = imageBuffer.toString('base64')
  const models = modelState.primaryDisabled ? [FALLBACK_MODEL] : [PRIMARY_MODEL, FALLBACK_MODEL]

  let lastError = null

  for (const model of models) {
    try {
      const payload = await callHuggingFaceModel(model, imageBase64)
      const keypoints = extractKeypoints(payload)

      if (!keypoints) {
        throw new Error('The model response did not contain recognized pose keypoints.')
      }

      return { model, keypoints }
    } catch (error) {
      lastError = error

      if (model === PRIMARY_MODEL) {
        modelState.primaryDisabled = true
        console.warn(`[POSE] ${PRIMARY_MODEL} did not return usable keypoints, falling back to ${FALLBACK_MODEL}`)
      }
    }
  }

  throw lastError || new Error('No pose estimation model produced usable keypoints.')
}

export async function estimatePoses(framePaths) {
  if (!process.env.HF_TOKEN) {
    throw new Error('HF_TOKEN is missing. Set it before running pose estimation.')
  }

  const processedFrames = []
  const modelState = { primaryDisabled: false }

  for (const [index, framePath] of framePaths.entries()) {
    try {
      const result = await estimateSingleFrame(framePath, modelState)
      processedFrames.push({
        frameIndex: index,
        framePath,
        model: result.model,
        keypoints: result.keypoints,
      })
    } catch (error) {
      console.warn(`[POSE] skipped frame ${index + 1}/${framePaths.length}: ${error.message}`)
    }
  }

  if (processedFrames.length === 0) {
    throw new Error('Pose estimation failed for every extracted frame.')
  }

  console.log(`[POSE] processed ${processedFrames.length}/${framePaths.length} frames`)
  return processedFrames
}
