ALTER TABLE sales
    ADD COLUMN sale_status        VARCHAR(20)  NOT NULL DEFAULT 'completed',
    ADD COLUMN payment_method     VARCHAR(20),
    ADD COLUMN stk_idempotency_key VARCHAR(255);
