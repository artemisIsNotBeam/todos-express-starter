var sqlite3 = require('sqlite3');
var mkdirp = require('mkdirp');
var crypto = require('crypto');

mkdirp.sync('var/db');

var db = new sqlite3.Database('var/db/database.db');

db.serialize(function() {

  db.run("CREATE TABLE IF NOT EXISTS users ( \
    id INTEGER PRIMARY KEY, \
    username TEXT UNIQUE, \
    hashed_password BLOB, \
    salt BLOB, \
    name TEXT, \
    email TEXT UNIQUE, \
    email_verified INTEGER \
  )");

  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    name VARCHAR(50), 
    description VARCHAR(200), 
    price DECIMAL(10,2)
  );`);


  db.run(`CREATE TABLE IF NOT EXISTS cartItems (
    userId INTEGER,
    productId INTEGER,
    quantity INTEGER,
    PRIMARY KEY (userId, productId),
    FOREIGN KEY(userId) REFERENCES users(id),
    FOREIGN KEY(productId) REFERENCES products(id)
  );`);  // Corrected table structure

  
  //db.run("DELETE FROM products WHERE id != 1;");
  

  var salt = crypto.randomBytes(16);
  db.run('INSERT OR IGNORE INTO users (username, hashed_password, salt) VALUES (?, ?, ?)', [
    'alice',
    crypto.pbkdf2Sync('letmein', salt, 310000, 32, 'sha256'),
    salt
  ]);
  
});

module.exports = db;
