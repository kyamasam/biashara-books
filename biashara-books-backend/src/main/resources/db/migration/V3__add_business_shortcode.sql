CREATE TYPE shortcode_types AS ENUM ('till', 'paybill');

ALTER TABLE business
    ADD COLUMN short_code VARCHAR(20),
    ADD COLUMN short_code_type VARCHAR(10) NOT NULL DEFAULT 'paybill';
