const express = require('express')
const { getRepayments } = require('../repositories/metricsRepository')

const router = express.Router()

router.get('/', async (_req, res, next) => {
  try {
    const rows = await getRepayments()
    res.json(rows)
  } catch (error) {
    next(error)
  }
})

module.exports = router
