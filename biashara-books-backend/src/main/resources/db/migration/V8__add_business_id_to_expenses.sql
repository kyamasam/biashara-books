ALTER TABLE expenses ADD COLUMN business_id UUID NOT NULL DEFAULT gen_random_uuid();
CREATE INDEX idx_expenses_business_id ON expenses(business_id);
