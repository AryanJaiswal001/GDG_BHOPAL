import os from 'node:os'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'

import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs-extra'
import fetch from 'node-fetch'

ffmpeg.setFfmpegPath(ffmpegInstaller.path)

const TMP_ROOT = path.join(os.tmpdir(), 'criccoach')
const FRAME_ROOT = path.join(TMP_ROOT, 'frames')

function sanitizeVideoId(videoId) {
  return String(videoId || 'video')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_')
}

function getFrameDirectory(videoId) {
  return path.join(FRAME_ROOT, sanitizeVideoId(videoId))
}

async function downloadVideo(videoUrl, outputPath) {
  const response = await fetch(videoUrl)

  if (!response.ok || !response.body) {
    throw new Error(`Failed to download video: ${response.status} ${response.statusText}`)
  }

  await pipeline(response.body, fs.createWriteStream(outputPath))
}

function runFrameExtraction(videoPath, frameDirectory, intervalSeconds) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .output(path.join(frameDirectory, 'frame_%03d.jpg'))
      .outputOptions(['-vf', `fps=${1 / intervalSeconds}`, '-qscale:v', '2'])
      .on('end', resolve)
      .on('error', (error) => reject(new Error(`ffmpeg frame extraction failed: ${error.message}`)))
      .run()
  })
}

export async function extractFrames({ videoUrl, videoId, intervalSeconds = 0.5 }) {
  const safeVideoId = sanitizeVideoId(videoId)
  const tempVideoPath = path.join(TMP_ROOT, `criccoach_${safeVideoId}.mp4`)
  const frameDirectory = getFrameDirectory(safeVideoId)

  await fs.ensureDir(TMP_ROOT)
  await fs.emptyDir(frameDirectory)

  try {
    await downloadVideo(videoUrl, tempVideoPath)
    await runFrameExtraction(tempVideoPath, frameDirectory, intervalSeconds)

    const frameFileNames = (await fs.readdir(frameDirectory))
      .filter((fileName) => fileName.toLowerCase().endsWith('.jpg'))
      .sort()

    const framePaths = frameFileNames.map((fileName) => path.join(frameDirectory, fileName))

    if (framePaths.length === 0) {
      throw new Error('No frames were extracted from the video.')
    }

    console.log(`[FRAMES] extracted ${framePaths.length} frames`)
    return framePaths
  } finally {
    await fs.remove(tempVideoPath)
  }
}

export async function cleanupFrames(videoId) {
  await fs.remove(getFrameDirectory(videoId))
}

export function getFramesDirectory(videoId) {
  return getFrameDirectory(videoId)
}
