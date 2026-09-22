ALTER TABLE inventory
    ADD COLUMN inventory_category VARCHAR(20);

UPDATE inventory SET inventory_category = 'physical' WHERE inventory_category IS NULL;

ALTER TABLE inventory
    ALTER COLUMN inventory_category SET NOT NULL;
