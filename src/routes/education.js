const express = require('express')
const { getEducationModules, getEducationModuleByCode } = require('../repositories/metricsRepository')

const router = express.Router()

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
