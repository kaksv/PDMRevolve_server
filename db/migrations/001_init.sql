CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS dashboard_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  on_time_repayment_rate NUMERIC(5,2) NOT NULL,
  full_repayment_rate NUMERIC(5,2) NOT NULL,
  education_completion_rate NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS top_parishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_name TEXT NOT NULL UNIQUE,
  households INTEGER NOT NULL,
  repayment_rate NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS repayment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_transaction_id TEXT NOT NULL UNIQUE,
  beneficiary_phone TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  status TEXT NOT NULL,
  transaction_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS education_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  language_code TEXT NOT NULL,
  channel_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO dashboard_metrics (on_time_repayment_rate, full_repayment_rate, education_completion_rate)
SELECT 82, 74, 68
WHERE NOT EXISTS (SELECT 1 FROM dashboard_metrics);

INSERT INTO top_parishes (parish_name, households, repayment_rate)
SELECT * FROM (
  VALUES
    ('Kiboga Central', 134, 91),
    ('Nakasozi', 102, 87),
    ('Bukunja', 88, 84)
) AS seed(parish_name, households, repayment_rate)
WHERE NOT EXISTS (SELECT 1 FROM top_parishes);

INSERT INTO repayment_transactions (provider_transaction_id, beneficiary_phone, amount, status, transaction_time)
SELECT * FROM (
  VALUES
    ('WENDI-000921', '+256701000111', 120000, 'success', '2026-04-20T08:16:00.000Z'::timestamptz),
    ('WENDI-000922', '+256702000222', 95000, 'success', '2026-04-20T09:10:00.000Z'::timestamptz)
) AS seed(provider_transaction_id, beneficiary_phone, amount, status, transaction_time)
WHERE NOT EXISTS (SELECT 1 FROM repayment_transactions);

INSERT INTO education_modules (code, title, language_code, channel_type, summary)
SELECT * FROM (
  VALUES
    ('REPAY-101', 'Why Full Repayment Unlocks More Capital', 'en', 'sms', 'Build trust with SACCOs and qualify faster for next-cycle loans.'),
    ('SAVE-201', 'Daily Record Keeping for Small Enterprises', 'lg', 'ussd', 'Track expenses and sales to avoid cash flow shocks.')
) AS seed(code, title, language_code, channel_type, summary)
WHERE NOT EXISTS (SELECT 1 FROM education_modules);
