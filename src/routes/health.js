const express = require('express')
const { env } = require('../config/env')

const router = express.Router()

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'pdmrevolve-api',
    databaseConfigured: Boolean(env.databaseUrl),
    timestamp: new Date().toISOString(),
  })
})

module.exports = router
