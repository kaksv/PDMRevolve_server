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

function isValidSignature(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
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
      const safeCompare =
        signature.length === 64 && isValidSignature(bodyRaw, signature, secret)

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

module.exports = router
