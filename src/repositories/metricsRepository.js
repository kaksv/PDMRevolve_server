const { getPool } = require('../db/pool')
const { dashboard, repayments, educationModules } = require('../db/mockData')

function dashboardMeta(generatedAt, dataAsOf) {
  return {
    generatedAt,
    dataAsOf: dataAsOf || null,
  }
}

async function getDashboard() {
  const generatedAt = new Date().toISOString()
  const pool = getPool()
  if (!pool) {
    return {
      ...dashboard,
      meta: dashboardMeta(generatedAt, null),
    }
  }

  const [metricsResult, parishResult, dataAsOfResult] = await Promise.all([
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
    pool.query(
      `
      SELECT GREATEST(
        COALESCE((SELECT MAX(created_at) FROM dashboard_metrics), TIMESTAMPTZ '1970-01-01'),
        COALESCE((SELECT MAX(created_at) FROM top_parishes), TIMESTAMPTZ '1970-01-01'),
        COALESCE((SELECT MAX(created_at) FROM repayment_transactions), TIMESTAMPTZ '1970-01-01')
      ) AS data_as_of
      `,
    ),
  ])

  const m = metricsResult.rows[0] || {}
  const rawAsOf = dataAsOfResult.rows[0]?.data_as_of
  const epoch = new Date('1970-01-01T00:00:00.000Z').getTime()
  const dataAsOfIso =
    rawAsOf && new Date(rawAsOf).getTime() > epoch ? new Date(rawAsOf).toISOString() : null

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
    meta: dashboardMeta(generatedAt, dataAsOfIso),
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
    SELECT code, title, language_code, channel_type, summary, content_uri, estimated_minutes, video_url, text_content, default_format, estimated_minutes_video, estimated_minutes_text
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
    contentUri: row.content_uri || null,
    videoUrl: row.video_url || null,
    textContent: row.text_content || null,
    defaultFormat: row.default_format || null,
    estimatedMinutesVideo: row.estimated_minutes_video != null ? Number(row.estimated_minutes_video) : null,
    estimatedMinutesText: row.estimated_minutes_text != null ? Number(row.estimated_minutes_text) : null,
    estimatedMinutes: row.estimated_minutes != null ? Number(row.estimated_minutes) : null,
  }))
}

async function getEducationModuleByCode(code) {
  const pool = getPool()
  if (!pool) {
    const row = educationModules.find((m) => m.code === code)
    if (!row) return null
    return {
      ...row,
      contentUri: row.contentUri ?? null,
      videoUrl: row.videoUrl ?? null,
      textContent: row.textContent ?? null,
      defaultFormat: row.defaultFormat ?? null,
      estimatedMinutesVideo: row.estimatedMinutesVideo ?? null,
      estimatedMinutesText: row.estimatedMinutesText ?? null,
      estimatedMinutes: row.estimatedMinutes ?? null,
      createdAt: null,
    }
  }

  const result = await pool.query(
    `
    SELECT code, title, language_code, channel_type, summary, content_uri, estimated_minutes, video_url, text_content, default_format, estimated_minutes_video, estimated_minutes_text, created_at
    FROM education_modules
    WHERE code = $1 AND is_active = TRUE
    LIMIT 1
    `,
    [code],
  )

  if (result.rowCount === 0) return null

  const row = result.rows[0]
  return {
    code: row.code,
    title: row.title,
    languageCode: row.language_code,
    channelType: row.channel_type,
    summary: row.summary,
    contentUri: row.content_uri || null,
    videoUrl: row.video_url || null,
    textContent: row.text_content || null,
    defaultFormat: row.default_format || null,
    estimatedMinutesVideo: row.estimated_minutes_video != null ? Number(row.estimated_minutes_video) : null,
    estimatedMinutesText: row.estimated_minutes_text != null ? Number(row.estimated_minutes_text) : null,
    estimatedMinutes: row.estimated_minutes != null ? Number(row.estimated_minutes) : null,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
  }
}

async function updateEducationModuleByCode(code, payload) {
  const pool = getPool()
  if (!pool) {
    const idx = educationModules.findIndex((m) => m.code === code)
    if (idx === -1) return null
    const prev = educationModules[idx]
    educationModules[idx] = {
      ...prev,
      videoUrl: payload.videoUrl,
      textContent: payload.textContent,
      defaultFormat: payload.defaultFormat,
      estimatedMinutesVideo: payload.estimatedMinutesVideo,
      estimatedMinutesText: payload.estimatedMinutesText,
      estimatedMinutes:
        payload.defaultFormat === 'video'
          ? payload.estimatedMinutesVideo ?? prev.estimatedMinutes ?? null
          : payload.estimatedMinutesText ?? prev.estimatedMinutes ?? null,
    }
    return educationModules[idx]
  }

  const result = await pool.query(
    `
    UPDATE education_modules
    SET
      video_url = $2,
      text_content = $3,
      default_format = $4,
      estimated_minutes_video = $5,
      estimated_minutes_text = $6
    WHERE code = $1 AND is_active = TRUE
    RETURNING code, title, language_code, channel_type, summary, content_uri, estimated_minutes, video_url, text_content, default_format, estimated_minutes_video, estimated_minutes_text, created_at
    `,
    [
      code,
      payload.videoUrl,
      payload.textContent,
      payload.defaultFormat,
      payload.estimatedMinutesVideo,
      payload.estimatedMinutesText,
    ],
  )

  if (result.rowCount === 0) return null
  const row = result.rows[0]
  return {
    code: row.code,
    title: row.title,
    languageCode: row.language_code,
    channelType: row.channel_type,
    summary: row.summary,
    contentUri: row.content_uri || null,
    videoUrl: row.video_url || null,
    textContent: row.text_content || null,
    defaultFormat: row.default_format || null,
    estimatedMinutesVideo: row.estimated_minutes_video != null ? Number(row.estimated_minutes_video) : null,
    estimatedMinutesText: row.estimated_minutes_text != null ? Number(row.estimated_minutes_text) : null,
    estimatedMinutes: row.estimated_minutes != null ? Number(row.estimated_minutes) : null,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
  }
}

module.exports = { getDashboard, getRepayments, getEducationModules, getEducationModuleByCode, updateEducationModuleByCode }
