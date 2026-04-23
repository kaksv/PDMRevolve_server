const fs = require('fs/promises')
const path = require('path')
const { getPool } = require('../db/pool')

async function run() {
  const pool = getPool()
  if (!pool) {
    throw new Error('DATABASE_URL is required for migrations.')
  }

  const sqlPath = path.join(__dirname, '../../db/migrations/001_init.sql')
  const sql = await fs.readFile(sqlPath, 'utf8')

  await pool.query('BEGIN')
  try {
    await pool.query(sql)
    await pool.query('COMMIT')
    console.log('Migration applied successfully.')
  } catch (error) {
    await pool.query('ROLLBACK')
    throw error
  } finally {
    await pool.end()
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
