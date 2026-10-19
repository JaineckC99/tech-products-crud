require('dotenv').config();
const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const db = new DatabaseSync(process.env.DB_FILE || './products.db');

const exists = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='products'")
  .get();

if (!exists) {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema);
  console.log('Database created with sample data');
}

module.exports = db;