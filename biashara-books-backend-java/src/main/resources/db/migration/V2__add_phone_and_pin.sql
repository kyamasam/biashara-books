-- V2__add_phone_and_pin.sql

ALTER TABLE users
    ADD COLUMN phone_code VARCHAR(10),
    ADD COLUMN phone_number VARCHAR(20),
    ADD COLUMN pin_hash VARCHAR(255);

CREATE UNIQUE INDEX idx_users_phone_number ON users(phone_number) WHERE phone_number IS NOT NULL;
