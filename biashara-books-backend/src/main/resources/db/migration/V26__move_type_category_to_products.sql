ALTER TABLE products ADD COLUMN inventory_type VARCHAR(20);
ALTER TABLE products ADD COLUMN inventory_category VARCHAR(20);

UPDATE products p
SET inventory_type = (
    SELECT i.inventory_type FROM inventory i
    WHERE i.product_id = p.id LIMIT 1
),
inventory_category = (
    SELECT i.inventory_category FROM inventory i
    WHERE i.product_id = p.id LIMIT 1
);

ALTER TABLE products ALTER COLUMN inventory_type SET DEFAULT 'count';
ALTER TABLE products ALTER COLUMN inventory_category SET DEFAULT 'physical';
UPDATE products SET inventory_type = 'count' WHERE inventory_type IS NULL;
UPDATE products SET inventory_category = 'physical' WHERE inventory_category IS NULL;
ALTER TABLE products ALTER COLUMN inventory_type SET NOT NULL;
ALTER TABLE products ALTER COLUMN inventory_category SET NOT NULL;

ALTER TABLE inventory DROP COLUMN inventory_type;
ALTER TABLE inventory DROP COLUMN inventory_category;
