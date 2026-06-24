-- V1__initial_schema.sql

-- Create ENUM types
CREATE TYPE inventory_types AS ENUM ('unit', 'count');
CREATE TYPE unit_metrics AS ENUM ('kg', 'l');
CREATE TYPE transaction_purposes AS ENUM ('expense_payment', 'sale_payment', 'loan_payment');
CREATE TYPE payment_channels AS ENUM ('pochi', 'paybill', 'till', 'bank_transfer');
CREATE TYPE transaction_types AS ENUM ('credit', 'debit');
CREATE TYPE transaction_statuses AS ENUM ('initiated', 'success', 'failed');
CREATE TYPE transaction_methods AS ENUM ('stk_push', 'b2c', 'c2b', 'b2b', 'cash');
CREATE TYPE institution_types AS ENUM ('chama', 'bank', 'sacco', 'loan_apps', 'others');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business table
CREATE TABLE business (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product categories
CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    photo_url TEXT,
    description TEXT,
    product_category_id UUID REFERENCES product_categories(id),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory table
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity FLOAT NOT NULL DEFAULT 0,
    inventory_type VARCHAR(50) NOT NULL,
    unit_metric VARCHAR(50),
    unit_purchase_price FLOAT NOT NULL,
    unit_sale_price DECIMAL(10,2) NOT NULL,
    price_includes_tax BOOLEAN DEFAULT FALSE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales table
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sub_total DECIMAL(10,2) NOT NULL,
    tax_total DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    transaction_id UUID,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales details table
CREATE TABLE sales_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    quantity FLOAT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_tax DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,
    inventory_id UUID NOT NULL REFERENCES inventory(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expense types
CREATE TABLE expense_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expenses table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_type_id UUID NOT NULL REFERENCES expense_types(id),
    other_name VARCHAR(100),
    expense_amount DECIMAL(10,2) NOT NULL,
    transaction_id UUID,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transaction table
CREATE TABLE transaction (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_type VARCHAR(50) NOT NULL,
    transaction_method VARCHAR(50) NOT NULL,
    transaction_purpose VARCHAR(50) NOT NULL,
    confirmation_code VARCHAR(50),
    transaction_amount DECIMAL(10,2) NOT NULL,
    payment_channel VARCHAR(50) NOT NULL,
    receiver_number VARCHAR(20),
    receiver_account VARCHAR(50),
    transaction_status VARCHAR(50) NOT NULL DEFAULT 'initiated',
    transaction_status_details TEXT,
    sender_number VARCHAR(20),
    reconciliation_id VARCHAR(100),
    callback_resp JSONB,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Other loans table
CREATE TABLE other_loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_name VARCHAR(100) NOT NULL,
    institution_type VARCHAR(50) NOT NULL,
    loan_balance DECIMAL(10,2) NOT NULL,
    monthly_repayment_amount DECIMAL(10,2) NOT NULL,
    end_date DATE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System loan table
CREATE TABLE system_loan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_name VARCHAR(100) NOT NULL,
    institution_type VARCHAR(50) NOT NULL,
    loan_balance DECIMAL(10,2) NOT NULL,
    monthly_repayment_amount DECIMAL(10,2) NOT NULL,
    end_date DATE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_business_user_id ON business(user_id);
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_category_id ON products(product_category_id);
CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_inventory_user_id ON inventory(user_id);
CREATE INDEX idx_sales_user_id ON sales(user_id);
CREATE INDEX idx_sales_transaction_id ON sales(transaction_id);
CREATE INDEX idx_sales_details_sale_id ON sales_details(sale_id);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_transaction_id ON expenses(transaction_id);
CREATE INDEX idx_transaction_user_id ON transaction(user_id);
CREATE INDEX idx_transaction_reconciliation_id ON transaction(reconciliation_id);

-- Insert default data
INSERT INTO expense_types (id, name) VALUES
    (gen_random_uuid(), 'Rent'),
    (gen_random_uuid(), 'Utilities'),
    (gen_random_uuid(), 'Salaries'),
    (gen_random_uuid(), 'Transport'),
    (gen_random_uuid(), 'Marketing'),
    (gen_random_uuid(), 'Supplies'),
    (gen_random_uuid(), 'Maintenance'),
    (gen_random_uuid(), 'Other');

INSERT INTO product_categories (id, name) VALUES
    (gen_random_uuid(), 'Beverages'),
    (gen_random_uuid(), 'Food'),
    (gen_random_uuid(), 'Electronics'),
    (gen_random_uuid(), 'Clothing'),
    (gen_random_uuid(), 'Hardware');