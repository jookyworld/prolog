ALTER TABLE users
    ADD COLUMN marketing_consented_at DATETIME NULL;

UPDATE users
SET marketing_consented_at = created_at
WHERE marketing_consent = TRUE;

ALTER TABLE users
    DROP COLUMN marketing_consent;
