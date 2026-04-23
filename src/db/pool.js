const { Pool } = require('pg')
const { env } = require('../config/env')

let pool = null

function getPool() {
  if (!env.databaseUrl) return null
  if (!pool) {
    pool = new Pool({
      connectionString: env.databaseUrl,
      ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
    })
  }
  return pool
}

module.exports = { getPool }
