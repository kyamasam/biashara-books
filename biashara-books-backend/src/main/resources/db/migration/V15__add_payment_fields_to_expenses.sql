ALTER TABLE expenses
    ADD COLUMN payment_method      VARCHAR(20),
    ADD COLUMN expense_status      VARCHAR(20) NOT NULL DEFAULT 'completed',
    ADD COLUMN b2b_conversation_id VARCHAR(255);

CREATE INDEX idx_expenses_b2b_conversation_id ON expenses(b2b_conversation_id);
