const express = require('express')
const { getEducationModules } = require('../repositories/metricsRepository')

const router = express.Router()

router.get('/modules', async (_req, res, next) => {
  try {
    const rows = await getEducationModules()
    res.json(rows)
  } catch (error) {
    next(error)
  }
})

module.exports = router
