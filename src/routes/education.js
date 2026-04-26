const express = require('express')
const { z } = require('zod')
const { getEducationModules, getEducationModuleByCode, updateEducationModuleByCode } = require('../repositories/metricsRepository')

const router = express.Router()

const updateModuleSchema = z
  .object({
    videoUrl: z.string().trim().url().nullable(),
    textContent: z.string().trim().max(20000).nullable(),
    defaultFormat: z.enum(['video', 'text']),
    estimatedMinutesVideo: z.coerce.number().int().positive().max(180).nullable(),
    estimatedMinutesText: z.coerce.number().int().positive().max(180).nullable(),
  })
  .refine((data) => data.videoUrl || data.textContent, {
    message: 'At least one content format is required (video or text).',
    path: ['videoUrl'],
  })

router.put('/modules/:code', async (req, res, next) => {
  try {
    const parsed = updateModuleSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid education module payload.',
        details: parsed.error.flatten(),
      })
    }

    const updated = await updateEducationModuleByCode(req.params.code, parsed.data)
    if (!updated) {
      return res.status(404).json({ error: 'Module not found.' })
    }
    return res.json(updated)
  } catch (error) {
    return next(error)
  }
})

router.get('/modules/:code', async (req, res, next) => {
  try {
    const module = await getEducationModuleByCode(req.params.code)
    if (!module) {
      return res.status(404).json({ error: 'Module not found.' })
    }
    return res.json(module)
  } catch (error) {
    return next(error)
  }
})

router.get('/modules', async (_req, res, next) => {
  try {
    const rows = await getEducationModules()
    res.json(rows)
  } catch (error) {
    next(error)
  }
})

module.exports = router
