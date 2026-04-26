ALTER TABLE education_modules
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS text_content TEXT,
  ADD COLUMN IF NOT EXISTS default_format TEXT CHECK (default_format IN ('video', 'text')),
  ADD COLUMN IF NOT EXISTS estimated_minutes_video INTEGER,
  ADD COLUMN IF NOT EXISTS estimated_minutes_text INTEGER;

UPDATE education_modules
SET
  text_content = 'Repayment is your pathway to bigger capital. Keep records of each payment, track due dates, and share progress with your SACCO group leaders.',
  default_format = 'text',
  estimated_minutes_text = COALESCE(estimated_minutes_text, estimated_minutes, 5)
WHERE code = 'REPAY-101';

UPDATE education_modules
SET
  text_content = 'Write down all your daily sales and expenses in one notebook. At week end, compare totals and plan next week''s buying carefully.',
  default_format = 'text',
  estimated_minutes_text = COALESCE(estimated_minutes_text, estimated_minutes, 5)
WHERE code = 'SAVE-201';
