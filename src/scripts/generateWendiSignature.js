const crypto = require('crypto')

const secret = process.env.WENDI_WEBHOOK_SECRET
const payloadArg = process.argv[2]

if (!secret) {
  console.error('Missing WENDI_WEBHOOK_SECRET environment variable.')
  process.exit(1)
}

if (!payloadArg) {
  console.error('Usage: node src/scripts/generateWendiSignature.js \'{"eventType":"payment.success",...}\'')
  process.exit(1)
}

let payload
try {
  payload = JSON.stringify(JSON.parse(payloadArg))
} catch (_error) {
  console.error('Payload must be valid JSON.')
  process.exit(1)
}

const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex')
console.log(signature)
