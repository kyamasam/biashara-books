CREATE TABLE industries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE business ADD COLUMN industry_id UUID REFERENCES industries(id) ON DELETE SET NULL;
