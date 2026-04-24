const { getPool } = require('../db/pool')

const mockProcessedTransactions = new Set()

async function saveWendiWebhookEvent(event) {
  const pool = getPool()

  if (!pool) {
    const alreadyProcessed = mockProcessedTransactions.has(event.providerTransactionId)
    if (!alreadyProcessed && event.status === 'success') {
      mockProcessedTransactions.add(event.providerTransactionId)
    }
    return {
      alreadyProcessed,
      persisted: !alreadyProcessed,
    }
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const insertEventResult = await client.query(
      `
      INSERT INTO wendi_webhook_events (
        provider_transaction_id,
        event_type,
        payload
      )
      VALUES ($1, $2, $3::jsonb)
      ON CONFLICT (provider_transaction_id) DO NOTHING
      RETURNING id
      `,
      [event.providerTransactionId, event.eventType, JSON.stringify(event.rawPayload)],
    )

    const alreadyProcessed = insertEventResult.rowCount === 0

    if (!alreadyProcessed && event.status === 'success') {
      await client.query(
        `
        INSERT INTO repayment_transactions (
          provider_transaction_id,
          beneficiary_phone,
          amount,
          status,
          transaction_time
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (provider_transaction_id) DO NOTHING
        `,
        [
          event.providerTransactionId,
          event.beneficiaryPhone,
          event.amount,
          event.status,
          event.transactionTime,
        ],
      )
    }

    await client.query(
      `
      INSERT INTO audit_logs (
        actor_role,
        action,
        entity_type,
        metadata
      )
      VALUES ($1, $2, $3, $4::jsonb)
      `,
      [
        'wendi_webhook',
        alreadyProcessed ? 'duplicate_ignored' : 'event_ingested',
        'repayment_transaction',
        JSON.stringify({
          providerTransactionId: event.providerTransactionId,
          amount: event.amount,
          status: event.status,
        }),
      ],
    )

    await client.query('COMMIT')
    return {
      alreadyProcessed,
      persisted: !alreadyProcessed,
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

module.exports = { saveWendiWebhookEvent }
