ALTER TABLE system_loan ADD COLUMN business_id UUID REFERENCES business(id) ON DELETE SET NULL;

UPDATE system_loan sl
SET business_id = u.current_business_id
FROM users u
WHERE sl.user_id = u.id
  AND u.current_business_id IS NOT NULL;

CREATE INDEX idx_system_loan_business_id ON system_loan(business_id);
