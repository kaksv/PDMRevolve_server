const { app } = require('./app')
const { env } = require('./config/env')
const { getPool } = require('./db/pool')

const server = app.listen(env.port, async () => {
  const pool = getPool()
  if (pool) {
    try {
      await pool.query('SELECT 1')
      console.log(`API running on port ${env.port} with PostgreSQL connected`)
    } catch (error) {
      console.warn(`API running on port ${env.port}; PostgreSQL is unreachable`)
      console.warn(error.message)
    }
  } else {
    console.log(`API running on port ${env.port} in mock-data mode (no DATABASE_URL set)`)
  }
})

process.on('SIGTERM', async () => {
  server.close(async () => {
    const pool = getPool()
    if (pool) await pool.end()
    process.exit(0)
  })
})
