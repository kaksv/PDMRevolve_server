const fs = require('fs/promises')
const path = require('path')
const { getPool } = require('../db/pool')

async function run() {
  const pool = getPool()
  if (!pool) {
    throw new Error('DATABASE_URL is required for migrations.')
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      filename TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `)

  const migrationsDir = path.join(__dirname, '../../db/migrations')
  const files = (await fs.readdir(migrationsDir))
    .filter((file) => file.endsWith('.sql'))
    .sort()

  for (const file of files) {
    const alreadyAppliedResult = await pool.query(
      `
      SELECT 1
      FROM schema_migrations
      WHERE filename = $1
      LIMIT 1
      `,
      [file],
    )

    if (alreadyAppliedResult.rowCount > 0) {
      console.log(`Migration skipped (already applied): ${file}`)
      continue
    }

    const sqlPath = path.join(migrationsDir, file)
    const sql = await fs.readFile(sqlPath, 'utf8')

    await pool.query('BEGIN')
    try {
      await pool.query(sql)
      await pool.query(
        `
        INSERT INTO schema_migrations (filename)
        VALUES ($1)
        `,
        [file],
      )
      await pool.query('COMMIT')
      console.log(`Migration applied: ${file}`)
    } catch (error) {
      await pool.query('ROLLBACK')
      throw error
    }
  }

  await pool.end()
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
