export const SUPPORTED_SHOT_TYPES = [
  'cover_drive',
  'pull_shot',
  'straight_drive',
  'cut_shot',
  'bowling_action',
  'footwork',
]

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function average(values) {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function variance(values) {
  if (values.length <= 1) return 0
  const mean = average(values)
  return average(values.map((value) => (value - mean) ** 2))
}

function pointFor(frame, key) {
  return frame?.keypoints?.[key] || null
}

function hasPoints(frame, keys) {
  return keys.every((key) => pointFor(frame, key))
}

function midpoint(left, right) {
  if (!left || !right) return null

  return {
    x: (left.x + right.x) / 2,
    y: (left.y + right.y) / 2,
    confidence: average([left.confidence ?? 0, right.confidence ?? 0]),
  }
}

function distance(a, b) {
  if (!a || !b) return null
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function vectorAngle(from, to) {
  if (!from || !to) return null
  return Math.abs((Math.atan2(from.y - to.y, to.x - from.x) * 180) / Math.PI)
}

function angleAt(vertexA, vertexB, vertexC) {
  if (!vertexA || !vertexB || !vertexC) return null

  const ab = Math.hypot(vertexA.x - vertexB.x, vertexA.y - vertexB.y)
  const cb = Math.hypot(vertexC.x - vertexB.x, vertexC.y - vertexB.y)
  const ac = Math.hypot(vertexA.x - vertexC.x, vertexA.y - vertexC.y)

  if (ab === 0 || cb === 0) return null

  const cosine = clamp((ab ** 2 + cb ** 2 - ac ** 2) / (2 * ab * cb), -1, 1)
  return (Math.acos(cosine) * 180) / Math.PI
}

function axisSpread(frames) {
  const allPoints = frames.flatMap((frame) => Object.values(frame.keypoints))
  const xs = allPoints.map((point) => point.x)
  const ys = allPoints.map((point) => point.y)

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  }
}

function bodyScale(frames) {
  const scales = frames
    .map((frame) => {
      const shoulderWidth = distance(pointFor(frame, 'left_shoulder'), pointFor(frame, 'right_shoulder'))
      const torsoHeight = distance(
        midpoint(pointFor(frame, 'left_shoulder'), pointFor(frame, 'right_shoulder')),
        midpoint(pointFor(frame, 'left_hip'), pointFor(frame, 'right_hip')),
      )

      return average([shoulderWidth || 0, torsoHeight || 0])
    })
    .filter((value) => value > 0)

  return average(scales) || 1
}

function toScore(value, min, max) {
  if (value == null) return null
  return clamp(((value - min) / Math.max(max - min, 1)) * 100, 0, 100)
}

function toInverseScore(value, min, max) {
  if (value == null) return null
  return clamp(100 - ((value - min) / Math.max(max - min, 1)) * 100, 0, 100)
}

function makeMetric(raw, normalized, unit, frameIndex = null) {
  return {
    raw,
    normalized: normalized == null ? null : Number(normalized.toFixed(2)),
    unit,
    frame_index: frameIndex,
  }
}

function dominantSide(frames) {
  const leftHeights = frames
    .map((frame) => pointFor(frame, 'left_wrist')?.y)
    .filter((value) => value != null)
  const rightHeights = frames
    .map((frame) => pointFor(frame, 'right_wrist')?.y)
    .filter((value) => value != null)

  const leftRange = leftHeights.length ? Math.max(...leftHeights) - Math.min(...leftHeights) : 0
  const rightRange = rightHeights.length ? Math.max(...rightHeights) - Math.min(...rightHeights) : 0

  return rightRange >= leftRange ? 'right' : 'left'
}

function selectPeakBackliftFrame(frames, side) {
  const wristKey = `${side}_wrist`

  return frames.reduce(
    (best, frame) => {
      const wrist = pointFor(frame, wristKey)
      if (!wrist) return best
      if (!best || wrist.y < best.wrist.y) {
        return { frame, wrist }
      }
      return best
    },
    null,
  )?.frame
}

function selectContactFrame(frames, side, peakBackliftIndex) {
  const wristKey = `${side}_wrist`
  const validFrames = frames.filter((frame) => pointFor(frame, wristKey))
  const peakFrame = validFrames.find((frame) => frame.frameIndex === peakBackliftIndex) || validFrames[0]

  if (!peakFrame) return frames[frames.length - 1]

  const finalFrame = validFrames[validFrames.length - 1]
  const peakWrist = pointFor(peakFrame, wristKey)
  const finalWrist = pointFor(finalFrame, wristKey)
  const direction = finalWrist.x >= peakWrist.x ? 1 : -1

  const candidates = validFrames.filter((frame) => frame.frameIndex >= peakBackliftIndex)

  return candidates.reduce((best, frame) => {
    const wrist = pointFor(frame, wristKey)
    if (!best) return frame

    const bestWrist = pointFor(best, wristKey)
    if (direction > 0) {
      return wrist.x > bestWrist.x ? frame : best
    }

    return wrist.x < bestWrist.x ? frame : best
  }, null)
}

function selectReleaseFrame(frames, side) {
  const wristKey = `${side}_wrist`

  return frames.reduce((best, frame) => {
    const wrist = pointFor(frame, wristKey)
    if (!wrist) return best
    if (!best || wrist.y < pointFor(best, wristKey).y) {
      return frame
    }
    return best
  }, null)
}

function aggregateBattingParameters(frames) {
  const side = dominantSide(frames)
  const wristKey = `${side}_wrist`
  const shoulderKey = `${side}_shoulder`
  const elbowKey = `${side}_elbow`
  const shoulderWidths = frames
    .map((frame) => distance(pointFor(frame, 'left_shoulder'), pointFor(frame, 'right_shoulder')))
    .filter(Boolean)
  const scale = average(shoulderWidths) || bodyScale(frames)

  const peakBackliftFrame = selectPeakBackliftFrame(frames, side)
  const contactFrame = peakBackliftFrame ? selectContactFrame(frames, side, peakBackliftFrame.frameIndex) : frames[frames.length - 1]
  const firstFrame = frames[0]
  const finalFrame = frames[frames.length - 1]

  const peakBackliftAngle = vectorAngle(pointFor(peakBackliftFrame, shoulderKey), pointFor(peakBackliftFrame, wristKey))
  const contactElbowAngle = angleAt(
    pointFor(contactFrame, shoulderKey),
    pointFor(contactFrame, elbowKey),
    pointFor(contactFrame, wristKey),
  )

  const leftFrontFootShift =
    (pointFor(contactFrame, 'left_ankle')?.x ?? 0) - (pointFor(firstFrame, 'left_ankle')?.x ?? 0)
  const rightFrontFootShift =
    (pointFor(contactFrame, 'right_ankle')?.x ?? 0) - (pointFor(firstFrame, 'right_ankle')?.x ?? 0)

  const frontFootShift = Math.abs(leftFrontFootShift) >= Math.abs(rightFrontFootShift) ? leftFrontFootShift : rightFrontFootShift

  const noseXs = frames.map((frame) => pointFor(frame, 'nose')?.x).filter((value) => value != null)
  const noseYs = frames.map((frame) => pointFor(frame, 'nose')?.y).filter((value) => value != null)
  const headVariance = variance(noseXs) + variance(noseYs)

  const hipCenters = frames
    .map((frame) => midpoint(pointFor(frame, 'left_hip'), pointFor(frame, 'right_hip')))
    .filter(Boolean)
  const firstHip = hipCenters[0]
  const finalHip = hipCenters[hipCenters.length - 1]
  const totalHipShift = finalHip && firstHip ? finalHip.x - firstHip.x : 0
  const weightTransferFrame =
    frames.find((frame) => {
      const hipCenter = midpoint(pointFor(frame, 'left_hip'), pointFor(frame, 'right_hip'))
      if (!hipCenter || !firstHip) return false
      if (totalHipShift >= 0) {
        return hipCenter.x >= firstHip.x + totalHipShift * 0.35
      }
      return hipCenter.x <= firstHip.x + totalHipShift * 0.35
    }) || contactFrame

  const peakShoulderLift = (pointFor(peakBackliftFrame, shoulderKey)?.y ?? 0) - (pointFor(peakBackliftFrame, wristKey)?.y ?? 0)
  const finalShoulderLift = (pointFor(finalFrame, shoulderKey)?.y ?? 0) - (pointFor(finalFrame, wristKey)?.y ?? 0)
  const followThroughRatio = peakShoulderLift > 0 ? finalShoulderLift / peakShoulderLift : null

  return {
    keyframes: [
      { label: 'peak_backlift', frameIndex: peakBackliftFrame?.frameIndex ?? null, framePath: peakBackliftFrame?.framePath ?? null },
      { label: 'contact', frameIndex: contactFrame?.frameIndex ?? null, framePath: contactFrame?.framePath ?? null },
      { label: 'weight_transfer', frameIndex: weightTransferFrame?.frameIndex ?? null, framePath: weightTransferFrame?.framePath ?? null },
    ],
    parameters: {
      backlift_angle: makeMetric(peakBackliftAngle, toScore(peakBackliftAngle, 20, 160), 'deg', peakBackliftFrame?.frameIndex ?? null),
      front_foot_position: makeMetric(frontFootShift, toScore(Math.abs(frontFootShift) / Math.max(scale, 1), 0, 1.5), 'px', contactFrame?.frameIndex ?? null),
      head_position_consistency: makeMetric(headVariance, toInverseScore(headVariance, 0, scale ** 2), 'variance', null),
      weight_transfer_timing: makeMetric(
        weightTransferFrame?.frameIndex ?? null,
        weightTransferFrame ? toScore(weightTransferFrame.frameIndex, 0, Math.max(frames.length - 1, 1)) : null,
        'frame_index',
        weightTransferFrame?.frameIndex ?? null,
      ),
      follow_through_completion: makeMetric(followThroughRatio, followThroughRatio == null ? null : clamp(followThroughRatio * 100, 0, 100), 'ratio', finalFrame?.frameIndex ?? null),
      elbow_bend_angle: makeMetric(contactElbowAngle, toScore(contactElbowAngle, 40, 180), 'deg', contactFrame?.frameIndex ?? null),
    },
  }
}

function aggregateBowlingParameters(frames) {
  const deliverySide = dominantSide(frames)
  const deliveryWristKey = `${deliverySide}_wrist`
  const deliveryShoulderKey = `${deliverySide}_shoulder`
  const releaseFrame = selectReleaseFrame(frames, deliverySide) || frames[Math.floor(frames.length / 2)]
  const releaseIndex = releaseFrame?.frameIndex ?? 0
  const runUpFrames = frames.filter((frame) => frame.frameIndex <= releaseIndex)
  const postReleaseFrames = frames.filter((frame) => frame.frameIndex >= releaseIndex)
  const bounds = axisSpread(frames)
  const scale = bodyScale(frames)

  const ankleCenters = runUpFrames
    .map((frame) => midpoint(pointFor(frame, 'left_ankle'), pointFor(frame, 'right_ankle')))
    .filter(Boolean)
  const strideLengths = ankleCenters.slice(1).map((center, index) => Math.abs(center.x - ankleCenters[index].x))
  const strideVariance = variance(strideLengths)

  const releaseWrist = pointFor(releaseFrame, deliveryWristKey)
  const releaseShoulder = pointFor(releaseFrame, deliveryShoulderKey)
  const releaseWristAngle = vectorAngle(releaseShoulder, releaseWrist)

  const leftShoulder = pointFor(releaseFrame, 'left_shoulder')
  const leftWrist = pointFor(releaseFrame, 'left_wrist')
  const frontArmAngle = leftShoulder && leftWrist ? Math.abs(90 - vectorAngle(leftShoulder, leftWrist)) : null

  const followThroughFrame = postReleaseFrames[postReleaseFrames.length - 1]
  const shoulderCenter = midpoint(pointFor(followThroughFrame, 'left_shoulder'), pointFor(followThroughFrame, 'right_shoulder'))
  const hipCenter = midpoint(pointFor(followThroughFrame, 'left_hip'), pointFor(followThroughFrame, 'right_hip'))
  const followThroughLean = shoulderCenter && hipCenter ? Math.abs(90 - vectorAngle(hipCenter, shoulderCenter)) : null

  return {
    keyframes: [
      { label: 'release', frameIndex: releaseFrame?.frameIndex ?? null, framePath: releaseFrame?.framePath ?? null },
      { label: 'follow_through', frameIndex: followThroughFrame?.frameIndex ?? null, framePath: followThroughFrame?.framePath ?? null },
    ],
    parameters: {
      run_up_consistency: makeMetric(strideVariance, toInverseScore(strideVariance, 0, scale ** 2), 'variance', null),
      release_point_height: makeMetric(
        releaseWrist?.y ?? null,
        releaseWrist ? toInverseScore(releaseWrist.y, bounds.minY, bounds.maxY) : null,
        'px',
        releaseFrame?.frameIndex ?? null,
      ),
      front_arm_usage: makeMetric(frontArmAngle, toInverseScore(frontArmAngle, 0, 90), 'deg', releaseFrame?.frameIndex ?? null),
      follow_through_direction: makeMetric(followThroughLean, toInverseScore(followThroughLean, 0, 45), 'deg', followThroughFrame?.frameIndex ?? null),
      wrist_position_at_release: makeMetric(releaseWristAngle, toScore(releaseWristAngle, 20, 160), 'deg', releaseFrame?.frameIndex ?? null),
    },
  }
}

export function aggregatePoseParameters({ frameKeypoints, shotType }) {
  if (!SUPPORTED_SHOT_TYPES.includes(shotType)) {
    throw new Error(`Unsupported shot type "${shotType}".`)
  }

  const frames = frameKeypoints
    .filter((frame) =>
      hasPoints(frame, [
        'nose',
        'left_shoulder',
        'right_shoulder',
        'left_hip',
        'right_hip',
        'left_wrist',
        'right_wrist',
        'left_ankle',
        'right_ankle',
      ]),
    )
    .sort((left, right) => left.frameIndex - right.frameIndex)

  if (frames.length === 0) {
    throw new Error('No frames contained the minimum pose keypoints required for aggregation.')
  }

  const batting = aggregateBattingParameters(frames)
  const bowling = aggregateBowlingParameters(frames)
  const isBowling = shotType === 'bowling_action'
  const selected = isBowling ? bowling : batting

  console.log(`[PARAMS] aggregated ${isBowling ? 'bowling' : 'batting'} parameters`)

  return {
    shot_type: shotType,
    frame_count: frames.length,
    parameters: isBowling
      ? {
          backlift_angle: null,
          front_foot_position: null,
          head_position_consistency: null,
          weight_transfer_timing: null,
          follow_through_completion: null,
          elbow_bend_angle: null,
          ...bowling.parameters,
        }
      : {
          ...batting.parameters,
          run_up_consistency: null,
          release_point_height: null,
          front_arm_usage: null,
          follow_through_direction: null,
          wrist_position_at_release: null,
        },
    raw_keyframes: selected.keyframes,
  }
}
