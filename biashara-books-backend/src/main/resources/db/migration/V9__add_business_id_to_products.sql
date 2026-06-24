ALTER TABLE products ADD COLUMN business_id UUID;
CREATE INDEX idx_products_business_id ON products(business_id);
