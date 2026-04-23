const { getPool } = require('../db/pool')
const { dashboard, repayments, educationModules } = require('../db/mockData')

async function getDashboard() {
  const pool = getPool()
  if (!pool) return dashboard

  const [metricsResult, parishResult] = await Promise.all([
    pool.query(
      `
      SELECT
        ROUND(AVG(on_time_repayment_rate)::numeric, 2) AS on_time_repayment_rate,
        ROUND(AVG(full_repayment_rate)::numeric, 2) AS full_repayment_rate,
        ROUND(AVG(education_completion_rate)::numeric, 2) AS education_completion_rate
      FROM dashboard_metrics
      `,
    ),
    pool.query(
      `
      SELECT parish_name, households, repayment_rate
      FROM top_parishes
      ORDER BY repayment_rate DESC
      LIMIT 5
      `,
    ),
  ])

  const m = metricsResult.rows[0] || {}
  return {
    metrics: {
      onTimeRepaymentRate: Number(m.on_time_repayment_rate || 0),
      fullRepaymentRate: Number(m.full_repayment_rate || 0),
      educationCompletionRate: Number(m.education_completion_rate || 0),
    },
    topParishes: parishResult.rows.map((row) => ({
      parishName: row.parish_name,
      households: Number(row.households),
      repaymentRate: Number(row.repayment_rate),
    })),
  }
}

async function getRepayments() {
  const pool = getPool()
  if (!pool) return repayments

  const result = await pool.query(
    `
    SELECT provider_transaction_id, beneficiary_phone, amount, status, transaction_time
    FROM repayment_transactions
    ORDER BY transaction_time DESC
    LIMIT 25
    `,
  )

  return result.rows.map((row) => ({
    providerTransactionId: row.provider_transaction_id,
    beneficiaryPhone: row.beneficiary_phone,
    amount: Number(row.amount),
    status: row.status,
    transactionTime: row.transaction_time,
  }))
}

async function getEducationModules() {
  const pool = getPool()
  if (!pool) return educationModules

  const result = await pool.query(
    `
    SELECT code, title, language_code, channel_type, summary
    FROM education_modules
    WHERE is_active = TRUE
    ORDER BY created_at DESC
    LIMIT 25
    `,
  )

  return result.rows.map((row) => ({
    code: row.code,
    title: row.title,
    languageCode: row.language_code,
    channelType: row.channel_type,
    summary: row.summary,
  }))
}

module.exports = { getDashboard, getRepayments, getEducationModules }
