ALTER TABLE expenses ADD COLUMN location_id UUID REFERENCES locations(id) ON DELETE SET NULL;
ALTER TABLE inventory ADD COLUMN location_id UUID REFERENCES locations(id) ON DELETE SET NULL;
ALTER TABLE inventory ADD COLUMN business_id UUID REFERENCES business(id);

CREATE INDEX idx_expenses_location_id ON expenses(location_id);
CREATE INDEX idx_inventory_location_id ON inventory(location_id);
CREATE INDEX idx_inventory_business_id ON inventory(business_id);
