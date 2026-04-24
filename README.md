# PDMRevolve Server

Express + PostgreSQL API for `PDMRevolve`.

## Features in this starter

- REST endpoints:
  - `GET /api/health`
  - `GET /api/dashboard`
  - `GET /api/repayments`
  - `GET /api/education/modules`
  - `POST /api/integrations/wendi/webhook`
- PostgreSQL integration using `pg`
- SQL migration script runner
- Safe mock-data mode when `DATABASE_URL` is missing

## Tech stack

- Node.js + Express
- PostgreSQL (`pg`)
- `dotenv`, `helmet`, `cors`, `morgan`

## Environment variables

Create `.env` from the example:

```bash
cp .env.example .env
```

Required/used:

- `NODE_ENV` (development/production)
- `PORT` (default `4000`)
- `DATABASE_URL` (Render Internal DB URL in production)
- `CORS_ORIGIN` (single origin or comma-separated list, e.g. Vercel + mapped domain)
- `WENDI_WEBHOOK_SECRET` (optional HMAC secret for webhook verification)
- `ENABLE_TEST_SIGNATURE_ENDPOINT` (`true` to enable signature helper endpoint in production)

## Local development

```bash
npm install
npm run dev
```

Server runs on `http://localhost:4000`.

## Database migration

```bash
npm run db:migrate
```

This runs `src/scripts/runMigration.js`, applying all SQL files in `db/migrations` in filename order.

## Render deployment

Recommended:

- **Build Command**: `npm install`
- **Start Command**: `npm start`

If you need migration without Render shell access, temporary option:

- **Start Command**: `npm run db:migrate && npm start`

After first successful migration, set it back to:

- `npm start`

## Common issues

- **`run: command not found` during deploy**  
  Use `npm run db:migrate`, not `run db:migrate`.
- **Migration fails with missing DB URL**  
  Ensure `DATABASE_URL` is set in Render env vars.
- **Frontend blocked by CORS**  
  Set `CORS_ORIGIN` to your exact frontend URL (e.g. `https://app.vercel.app`).

## Wendi webhook quick setup

1. Set env vars in Render:
   - `WENDI_WEBHOOK_SECRET=<shared-secret>`
   - `ENABLE_TEST_SIGNATURE_ENDPOINT=true` (temporary, for team testing)
2. Configure webhook URL in Wendi dashboard or support ticket:
   - `https://<your-render-api>/api/integrations/wendi/webhook`
3. Ask Wendi to send `x-wendi-signature` header (HMAC SHA-256 of raw JSON payload).
4. Test quickly using:
   - `POST /api/integrations/wendi/test-signature` (generate signature)
   - `POST /api/integrations/wendi/webhook` (send signed payload)
5. Disable helper in production after testing:
   - `ENABLE_TEST_SIGNATURE_ENDPOINT=false`
