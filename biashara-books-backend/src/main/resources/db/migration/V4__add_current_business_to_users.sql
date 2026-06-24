ALTER TABLE users
    ADD COLUMN current_business_id UUID REFERENCES business(id) ON DELETE SET NULL;
