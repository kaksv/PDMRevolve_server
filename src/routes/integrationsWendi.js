const crypto = require('crypto')
const express = require('express')
const { z } = require('zod')
const { env } = require('../config/env')
const { saveWendiWebhookEvent } = require('../repositories/wendiWebhookRepository')

const router = express.Router()

const webhookSchema = z.object({
  eventType: z.string().min(1),
  transactionId: z.string().min(1),
  status: z.enum(['success', 'failed', 'reversed']),
  amount: z.coerce.number().positive(),
  payerPhone: z.string().min(7),
  timestamp: z.string().datetime(),
})

function createSignature(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

function isValidSignature(payload, signature, secret) {
  const expected = createSignature(payload, secret)
  if (signature.length !== expected.length) return false
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

router.post('/webhook', async (req, res, next) => {
  try {
    const signature = req.get('x-wendi-signature')
    const secret = env.wendiWebhookSecret

    if (secret) {
      if (!signature) {
        return res.status(401).json({ error: 'Missing webhook signature.' })
      }

      const bodyRaw = JSON.stringify(req.body)
      const safeCompare = isValidSignature(bodyRaw, signature, secret)

      if (!safeCompare) {
        return res.status(401).json({ error: 'Invalid webhook signature.' })
      }
    }

    const parsed = webhookSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid webhook payload.',
        details: parsed.error.flatten(),
      })
    }

    const data = parsed.data
    const result = await saveWendiWebhookEvent({
      providerTransactionId: data.transactionId,
      eventType: data.eventType,
      status: data.status,
      amount: data.amount,
      beneficiaryPhone: data.payerPhone,
      transactionTime: new Date(data.timestamp).toISOString(),
      rawPayload: req.body,
    })

    return res.status(200).json({
      received: true,
      alreadyProcessed: result.alreadyProcessed,
    })
  } catch (error) {
    next(error)
  }
})

router.post('/test-signature', (req, res) => {
  if (env.nodeEnv === 'production' && !env.enableTestSignatureEndpoint) {
    return res.status(404).json({ error: 'Not found.' })
  }

  if (!env.wendiWebhookSecret) {
    return res
      .status(400)
      .json({ error: 'WENDI_WEBHOOK_SECRET is required to generate signatures.' })
  }

  const payload = JSON.stringify(req.body || {})
  const signature = createSignature(payload, env.wendiWebhookSecret)
  return res.json({ signature, payload })
})

module.exports = router
