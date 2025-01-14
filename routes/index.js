var express = require('express');
var db = require('../db');
var path = require('path');

var router = express.Router();

// TEST USING insomnia

router.get('/', function(req, res, next) {
  if (!req.user) { 
    return res.render('home'); 
  }
  res.send(req.user);
});

router.get('/products', (req, res, next) => {
  // Wrap the db.all in a new Promise object and use .then and .catch to handle it
  new Promise((resolve, reject) => {
    db.all('SELECT * FROM products', function(err, rows) {
      if (err) {
        reject(err);  
      } else {
        resolve(rows);
      }
    });
  })
  .then((products) => {
    res.json(products);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error getting products');
  });
});


router.get('/products/:id', (req, res, next) => {
  const productId = req.params.id;

  new Promise((resolve, reject) => {
    db.get('SELECT * FROM products WHERE id = ?', [productId], function(err, row) {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  })
  .then((product) => {
    if (product) {
      res.json(product);
    } else {
      res.status(404).send('Product not found');
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error getting product');
  });
});



/*
example input
{
	"name":"pie",
	"desc":"paste in bread/crust",
	"price":13
}
*/

router.post('/products', (req, res, next)=>{
  if (req.body.title !== '') { return next(); }
  return res.redirect('/products' + (req.body.filter || ''));
}, function(req, res,next){
  db.run('INSERT INTO products (name, description, price) VALUES (?, ?, ?)', [
    req.body.name,
    req.body.desc,
    req.body.price
  ], function(err) {
    if (err) { return next(err); }
    res.status(200).send('product added');
  });
});

router.put('/products/:id', (req, res, next) => {
  if (req.body.title !== '') { return next(); }
  return res.redirect('/products' + (req.body.filter || ''));
}, function(req, res,next){
  const id = req.params.id;

  db.run(`UPDATE products
  SET name = ?,  
      description = ?,
      price = ?
  WHERE id = ?;
`, [
    req.body.name,
    req.body.desc,
    req.body.price,
    id
  ], function(err) {
    if (err) { return next(err); }
    res.status(200).send('product edited');
  });
});

router.delete('/products/:id', (req, res, next)=>{
  if (req.body.title !==''){
    return next();
  }
  return res.redirect('/products' + (req.body.filter || ''));
}, function(req, res, next){
  const id =req.params.id;

  db.run(`DELETE FROM products
  WHERE id = ?;`, [
    id
  ], function(err) {
    if (err) { return next(err); }
    res.status(200).send('product deleted');
  });
});

router.get('/cart', function(req, res, next) {
  if (!req.user) { 
    return res.render('home'); 
  }
  next();
}, function(req,res,next){
  new Promise((resolve, reject) => {
    db.all('SELECT productId, quantity FROM cartItems WHERE userId = ?;',[
      req.user["id"]
    ], function(err, rows) {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  })
  .then((products) => {
    res.json(products);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error getting products');
  });
});

//should be post and /cart
router.post('/cart/:id/:quantity',function(req, res, next) {
    if (!req.user) { 
    return res.render('home'); 
  }
  next();
}, async function(req,res,next){
  let userId=req.user["id"];
  let productId=req.params.id;
  let quantity = req.params.id;
  console.log(userId,productId,quantity);

  try {
    let exists = await new Promise((resolve, reject) => {
      db.get(`SELECT 1 FROM cartItems WHERE userId = ? AND productId = ?`, [userId, productId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });

    console.log(exists);

    if (exists) {
      // Product exists in cart, update quantity
      db.run(`UPDATE cartItems SET quantity = quantity + ? WHERE userId = ? AND productId = ?`, [quantity, userId, productId],
        function(err) {
          if (err) { return next(err); }
          res.status(200).send('Product quantity updated in cart');
        }
      ); 
    } else {
      // Product does not exist in cart, insert new
      db.run(`INSERT INTO cartItems (userId, productId, quantity) VALUES (?, ?, ?)`, [userId, productId, quantity], function(err) {
        if (err) { return next(err); }
        console.log("New product added to cart");
        res.status(200).send('Product added to cart');
      });
    }
  } catch (err) {
    return next(err);
  }
})


router.delete('/cart/:id',function(req,res,next){
  if (!req.user) { 
  return res.render('home'); 
}
next();
}, function(req,res,next){
  db.run(`DELETE FROM cartItems WHERE userId= ? and productId=?`,[
    req.user["id"],
    req.params.id
  ], function(err){
    if (err) { return next(err); }
      res.status(200).send('deleted');
  });
})


module.exports = router;