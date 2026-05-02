import { performance } from 'node:perf_hooks'

import { aggregatePoseParameters } from './parameterAggregator.js'
import { cleanupFrames, extractFrames } from './extractFrames.js'
import { estimatePoses } from './poseEstimator.js'

export async function analysisPipeline({ videoUrl, videoId, shotType }) {
  const startedAt = performance.now()
  let framePaths

  try {
    try {
      framePaths = await extractFrames({ videoUrl, videoId })
    } catch (error) {
      throw new Error(`[PIPELINE] frame extraction failed: ${error.message}`, { cause: error })
    }

    let frameKeypoints = []
    try {
      frameKeypoints = await estimatePoses(framePaths)
    } catch (error) {
      throw new Error(`[PIPELINE] pose estimation failed: ${error.message}`, { cause: error })
    }

    try {
      const aggregated = aggregatePoseParameters({ frameKeypoints, shotType })
      const durationSeconds = ((performance.now() - startedAt) / 1000).toFixed(1)
      console.log(`[DONE] pipeline complete in ${durationSeconds}s`)
      return aggregated
    } catch (error) {
      throw new Error(`[PIPELINE] parameter aggregation failed: ${error.message}`, { cause: error })
    }
  } finally {
    await cleanupFrames(videoId)
  }
}
