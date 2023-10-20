var sqlite3 = require('sqlite3');
var mkdirp = require('mkdirp');
var crypto = require('crypto');

mkdirp.sync('var/db');

var db = new sqlite3.Database('var/db/database.db');

db.serialize(function() {

  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    name VARCHAR(50), 
    description VARCHAR(200), 
    price DECIMAL(10,2)
  );`);

  db.run(`CREATE TABLE IF NOT EXISTS carts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner INTEGER,
    FOREIGN KEY(owner) REFERENCES users(id)
  );`);  // Corrected FOREIGN KEY syntax and removed trailing comma


  db.run(`CREATE TABLE IF NOT EXISTS cartItems (
    cartId INTEGER,
    productId INTEGER,
    quantity INTEGER,
    PRIMARY KEY (cartId, productId),
    FOREIGN KEY(cartId) REFERENCES carts(id),
    FOREIGN KEY(productId) REFERENCES products(id)
  );`);  // Corrected table structure

    /*
  db.run('INSERT OR IGNORE INTO products (name, description, price) VALUES (?, ?, ?);', [
    'milk',
    'it comes from cows, is rich in calcium',
    10.50
  ]);
  */
});

module.exports = db;
