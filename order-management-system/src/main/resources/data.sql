-- Seed data for Food Supply Chain Order Management System

-- Suppliers
INSERT INTO suppliers (name, contact_person, email, phone, address, city, state, zip_code, country, tax_id, payment_terms, active, created_at, updated_at)
VALUES ('Fresh Farms Co.', 'John Smith', 'john@freshfarms.com', '555-0101', '100 Farm Road', 'Sacramento', 'CA', '95814', 'USA', 'TAX-FF001', 'Net 30', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO suppliers (name, contact_person, email, phone, address, city, state, zip_code, country, tax_id, payment_terms, active, created_at, updated_at)
VALUES ('Ocean Harvest Seafood', 'Maria Garcia', 'maria@oceanharvest.com', '555-0102', '200 Harbor Drive', 'San Francisco', 'CA', '94102', 'USA', 'TAX-OH002', 'Net 15', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO suppliers (name, contact_person, email, phone, address, city, state, zip_code, country, tax_id, payment_terms, active, created_at, updated_at)
VALUES ('Golden Grain Mills', 'Robert Lee', 'robert@goldengrain.com', '555-0103', '300 Mill Avenue', 'Portland', 'OR', '97201', 'USA', 'TAX-GG003', 'Net 45', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Customers
INSERT INTO customers (name, email, phone, address, city, state, zip_code, country, business_name, tax_id, credit_limit, active, created_at, updated_at)
VALUES ('Metro Restaurant Group', 'orders@metrorestaurant.com', '555-0201', '500 Main Street', 'New York', 'NY', '10001', 'USA', 'Metro Restaurant Group LLC', 'TAX-MR001', 50000.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO customers (name, email, phone, address, city, state, zip_code, country, business_name, tax_id, credit_limit, active, created_at, updated_at)
VALUES ('City Grocery Chain', 'purchasing@citygrocery.com', '555-0202', '600 Market Blvd', 'Chicago', 'IL', '60601', 'USA', 'City Grocery Inc.', 'TAX-CG002', 100000.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO customers (name, email, phone, address, city, state, zip_code, country, business_name, tax_id, credit_limit, active, created_at, updated_at)
VALUES ('Harbor Catering Services', 'info@harborcatering.com', '555-0203', '700 Coast Highway', 'Los Angeles', 'CA', '90001', 'USA', 'Harbor Catering LLC', 'TAX-HC003', 25000.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Products
INSERT INTO products (name, description, sku, category, price, unit, shelf_life_days, storage_temperature, created_at, updated_at)
VALUES ('Organic Tomatoes', 'Fresh organic vine-ripened tomatoes', 'PROD-VEG-001', 'VEGETABLES', 3.99, 'kg', 7, '2-4C', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO products (name, description, sku, category, price, unit, shelf_life_days, storage_temperature, created_at, updated_at)
VALUES ('Atlantic Salmon Fillet', 'Premium wild-caught Atlantic salmon', 'PROD-SEA-001', 'SEAFOOD', 24.99, 'kg', 3, '0-2C', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO products (name, description, sku, category, price, unit, shelf_life_days, storage_temperature, created_at, updated_at)
VALUES ('Whole Grain Flour', 'Stone-ground whole wheat flour', 'PROD-GRN-001', 'GRAINS', 5.49, 'kg', 180, 'Room Temp', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO products (name, description, sku, category, price, unit, shelf_life_days, storage_temperature, created_at, updated_at)
VALUES ('Free Range Chicken Breast', 'Boneless skinless free-range chicken breast', 'PROD-MET-001', 'MEAT', 12.99, 'kg', 5, '0-4C', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO products (name, description, sku, category, price, unit, shelf_life_days, storage_temperature, created_at, updated_at)
VALUES ('Organic Whole Milk', 'Fresh organic whole milk from pasture-raised cows', 'PROD-DRY-001', 'DAIRY', 4.49, 'liter', 14, '2-4C', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO products (name, description, sku, category, price, unit, shelf_life_days, storage_temperature, created_at, updated_at)
VALUES ('Seasonal Fruit Mix', 'Assorted seasonal fresh fruits', 'PROD-FRT-001', 'FRUITS', 8.99, 'kg', 5, '4-8C', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Inventory
INSERT INTO inventory (product_id, quantity_on_hand, reorder_level, reorder_quantity, warehouse_location, last_restocked_at, created_at, updated_at)
VALUES (1, 500, 100, 200, 'Warehouse A - Section 3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO inventory (product_id, quantity_on_hand, reorder_level, reorder_quantity, warehouse_location, last_restocked_at, created_at, updated_at)
VALUES (2, 80, 30, 50, 'Cold Storage B - Section 1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO inventory (product_id, quantity_on_hand, reorder_level, reorder_quantity, warehouse_location, last_restocked_at, created_at, updated_at)
VALUES (3, 1000, 200, 500, 'Warehouse C - Section 5', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO inventory (product_id, quantity_on_hand, reorder_level, reorder_quantity, warehouse_location, last_restocked_at, created_at, updated_at)
VALUES (4, 150, 50, 100, 'Cold Storage B - Section 2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO inventory (product_id, quantity_on_hand, reorder_level, reorder_quantity, warehouse_location, last_restocked_at, created_at, updated_at)
VALUES (5, 300, 100, 200, 'Cold Storage A - Section 1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO inventory (product_id, quantity_on_hand, reorder_level, reorder_quantity, warehouse_location, last_restocked_at, created_at, updated_at)
VALUES (6, 25, 50, 100, 'Cold Storage A - Section 2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
