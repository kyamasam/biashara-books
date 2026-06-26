-- Demo data: add three high-value inventory products for the first business.
-- Run against the biashara_book database.

WITH selected_business AS (
    SELECT id AS business_id, user_id
    FROM business
    ORDER BY created_at
    LIMIT 1
),
category AS (
    SELECT id
    FROM product_categories
    WHERE name = 'High Value Goods'

    UNION ALL

    SELECT gen_random_uuid()
    WHERE NOT EXISTS (
        SELECT 1
        FROM product_categories
        WHERE name = 'High Value Goods'
    )
),
insert_category AS (
    INSERT INTO product_categories (id, name)
    SELECT id, 'High Value Goods'
    FROM category
    WHERE NOT EXISTS (
        SELECT 1
        FROM product_categories
        WHERE name = 'High Value Goods'
    )
    RETURNING id
),
selected_category AS (
    SELECT id FROM insert_category
    UNION ALL
    SELECT id
    FROM product_categories
    WHERE name = 'High Value Goods'
    LIMIT 1
),
product_data AS (
    SELECT *
    FROM (
        VALUES
            (
                'Commercial Espresso Machine',
                'Premium commercial espresso machine for busy cafes.',
                'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80',
                3.0::float,
                6200.00::float,
                9200.00::decimal(10,2)
            ),
            (
                'Industrial Generator',
                'Heavy-duty backup generator for shops and small factories.',
                'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=600&q=80',
                2.0::float,
                5800.00::float,
                8500.00::decimal(10,2)
            ),
            (
                'Walk-In Cold Room',
                'Large walk-in cold storage unit for perishable stock.',
                'https://images.unsplash.com/photo-1581091215367-59ab6b1f8891?auto=format&fit=crop&w=600&q=80',
                1.0::float,
                7100.00::float,
                9800.00::decimal(10,2)
            )
    ) AS item(name, description, photo_url, quantity, unit_purchase_price, unit_sale_price)
),
insert_products AS (
    INSERT INTO products (
        name,
        photo_url,
        description,
        product_category_id,
        user_id,
        business_id
    )
    SELECT
        product_data.name,
        product_data.photo_url,
        product_data.description,
        selected_category.id,
        selected_business.user_id,
        selected_business.business_id
    FROM product_data
    CROSS JOIN selected_business
    CROSS JOIN selected_category
    WHERE NOT EXISTS (
        SELECT 1
        FROM products
        WHERE products.business_id = selected_business.business_id
          AND products.name = product_data.name
    )
    RETURNING id, name, user_id
),
selected_products AS (
    SELECT id, name, user_id FROM insert_products

    UNION ALL

    SELECT products.id, products.name, products.user_id
    FROM products
    CROSS JOIN selected_business
    WHERE products.business_id = selected_business.business_id
      AND products.name IN (
          'Commercial Espresso Machine',
          'Industrial Generator',
          'Walk-In Cold Room'
      )
)
INSERT INTO inventory (
    product_id,
    quantity,
    inventory_type,
    unit_metric,
    unit_purchase_price,
    unit_sale_price,
    price_includes_tax,
    user_id
)
SELECT
    selected_products.id,
    product_data.quantity,
    'count',
    NULL,
    product_data.unit_purchase_price,
    product_data.unit_sale_price,
    FALSE,
    selected_products.user_id
FROM selected_products
JOIN product_data ON product_data.name = selected_products.name
WHERE NOT EXISTS (
    SELECT 1
    FROM inventory
    WHERE inventory.product_id = selected_products.id
      AND inventory.user_id = selected_products.user_id
);
