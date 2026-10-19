require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// GET all
app.get('/api/products', (req, res) => {
  res.json(db.prepare('SELECT * FROM products ORDER BY id').all());
});

// GET one
app.get('/api/products/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// POST create
app.post('/api/products', (req, res) => {
  const { product_name, brand, category, price, stock_quantity, description } = req.body;
  if (!product_name) return res.status(400).json({ error: 'product_name is required' });

  const result = db.prepare(
    `INSERT INTO products (product_name, brand, category, price, stock_quantity, description)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(product_name, brand ?? null, category ?? null, price ?? null, stock_quantity ?? 0, description ?? null);

  res.status(201).json(db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid));
});

// PUT update
app.put('/api/products/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });

  const b = req.body;
  const p = {
    product_name: b.product_name ?? existing.product_name,
    brand: b.brand ?? existing.brand,
    category: b.category ?? existing.category,
    price: b.price ?? existing.price,
    stock_quantity: b.stock_quantity ?? existing.stock_quantity,
    description: b.description ?? existing.description,
  };
  if (!p.product_name) return res.status(400).json({ error: 'product_name is required' });

  db.prepare(
    `UPDATE products SET product_name=?, brand=?, category=?, price=?, stock_quantity=?,
     description=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`
  ).run(p.product_name, p.brand, p.category, p.price, p.stock_quantity, p.description, req.params.id);

  res.json(db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id));
});

// DELETE
app.delete('/api/products/:id', (req, res) => {
  const result = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Product not found' });
  res.json({ message: 'Product deleted', id: Number(req.params.id) });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});