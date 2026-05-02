import 'dotenv/config'

import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'

import { pool as defaultPool } from '../db/pool.js'
import { analysisPipeline } from '../services/analysisPipeline.js'
import { SUPPORTED_SHOT_TYPES } from '../services/parameterAggregator.js'

function mapVideoRow(row) {
  return {
    video_id: row.id,
    video_url: row.video_url,
    analysis_data: row.analysis_data,
  }
}

async function persistVideoAnalysis(db, { videoId, videoUrl, shotType, analysisData }) {
  const updateResult = await db.query(
    `
      UPDATE videos
      SET video_url = $2,
          shot_type = $3,
          analysis_data = $4
      WHERE id = $1
      RETURNING id, video_url, analysis_data
    `,
    [videoId, videoUrl, shotType, analysisData],
  )

  if (updateResult.rows[0]) {
    return mapVideoRow(updateResult.rows[0])
  }

  const insertResult = await db.query(
    `
      INSERT INTO videos (id, video_url, shot_type, analysis_data)
      VALUES ($1, $2, $3, $4)
      RETURNING id, video_url, analysis_data
    `,
    [videoId, videoUrl, shotType, analysisData],
  )

  return mapVideoRow(insertResult.rows[0])
}

export function createVideoRouter({ db = defaultPool } = {}) {
  const router = Router()

  router.post('/upload/complete', async (req, res) => {
    const videoUrl = req.body?.videoUrl || req.body?.video_url
    const shotType = req.body?.shotType || req.body?.shot_type
    const videoId = req.body?.videoId || req.body?.video_id || uuidv4()

    if (!videoUrl) {
      return res.status(400).json({ success: false, error: 'videoUrl is required.' })
    }

    if (!shotType) {
      return res.status(400).json({ success: false, error: 'shotType is required.' })
    }

    if (!SUPPORTED_SHOT_TYPES.includes(shotType)) {
      return res.status(400).json({
        success: false,
        error: `shotType must be one of: ${SUPPORTED_SHOT_TYPES.join(', ')}`,
      })
    }

    try {
      const analysisData = await analysisPipeline({
        videoUrl,
        videoId,
        shotType,
      })

      const savedVideo = await persistVideoAnalysis(db, {
        videoId,
        videoUrl,
        shotType,
        analysisData,
      })

      return res.json({
        success: true,
        video_url: savedVideo.video_url,
        analysis_data: savedVideo.analysis_data,
        video_id: savedVideo.video_id,
      })
    } catch (error) {
      console.error(`[VIDEO] analysis pipeline failed for ${videoId}: ${error.message}`)
      return res.status(500).json({
        success: false,
        error: error.message,
      })
    }
  })

  return router
}

export default createVideoRouter()
