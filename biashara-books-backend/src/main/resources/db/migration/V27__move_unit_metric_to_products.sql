ALTER TABLE products ADD COLUMN unit_metric VARCHAR(10);

UPDATE products p
SET unit_metric = (
    SELECT i.unit_metric FROM inventory i
    WHERE i.product_id = p.id LIMIT 1
);

ALTER TABLE inventory DROP COLUMN unit_metric;
