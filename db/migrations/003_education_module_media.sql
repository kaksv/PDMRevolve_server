ALTER TABLE education_modules
  ADD COLUMN IF NOT EXISTS content_uri TEXT,
  ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER;

UPDATE education_modules
SET estimated_minutes = 8
WHERE code = 'REPAY-101';

UPDATE education_modules
SET estimated_minutes = 5
WHERE code = 'SAVE-201';
