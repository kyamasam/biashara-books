ALTER TABLE business_user
    ADD COLUMN current_location_id UUID REFERENCES locations(id) ON DELETE SET NULL;
