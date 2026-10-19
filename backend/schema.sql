CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  price REAL,
  stock_quantity INTEGER DEFAULT 0,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO products (product_name, brand, category, price, stock_quantity, description) VALUES
('iPhone 15', 'Apple', 'Smartphone', 799.99, 25, '6.1-inch display with A16 chip'),
('Galaxy S24', 'Samsung', 'Smartphone', 749.99, 30, 'AMOLED display with AI features'),
('MacBook Air M2', 'Apple', 'Laptop', 1099.00, 12, 'Thin and light laptop with M2 chip'),
('ThinkPad X1 Carbon', 'Lenovo', 'Laptop', 1399.00, 8, 'Business ultrabook with long battery life'),
('AirPods Pro 2', 'Apple', 'Audio', 249.00, 40, 'Wireless earbuds with noise cancellation'),
('WH-1000XM5', 'Sony', 'Audio', 399.99, 15, 'Over-ear noise cancelling headphones'),
('iPad 10th Gen', 'Apple', 'Tablet', 449.00, 18, '10.9-inch tablet for work and study'),
('Galaxy Watch 6', 'Samsung', 'Wearable', 299.99, 22, 'Smartwatch with health tracking'),
('Logitech MX Master 3S', 'Logitech', 'Accessory', 99.99, 50, 'Wireless ergonomic mouse'),
('PlayStation 5', 'Sony', 'Gaming', 499.99, 10, 'Gaming console with 4K support');