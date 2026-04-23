const express = require('express')
const { getDashboard } = require('../repositories/metricsRepository')

const router = express.Router()

router.get('/', async (_req, res, next) => {
  try {
    const data = await getDashboard()
    res.json(data)
  } catch (error) {
    next(error)
  }
})

module.exports = router
