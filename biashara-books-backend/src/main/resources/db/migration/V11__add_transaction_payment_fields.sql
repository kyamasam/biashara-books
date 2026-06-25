-- V11__add_transaction_payment_fields.sql

ALTER TABLE transaction
ADD COLUMN IF NOT EXISTS idempotency_key UUID,
ADD COLUMN IF NOT EXISTS transaction_confirmation_number VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_transaction_idempotency_key ON transaction(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_transaction_confirmation_number ON transaction(transaction_confirmation_number);