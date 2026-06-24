ALTER TABLE transaction ADD COLUMN business_id UUID REFERENCES business(id) ON DELETE SET NULL;

UPDATE transaction t
SET business_id = u.current_business_id
FROM users u
WHERE t.user_id = u.id
  AND u.current_business_id IS NOT NULL;

CREATE INDEX idx_transaction_business_id ON transaction(business_id);
