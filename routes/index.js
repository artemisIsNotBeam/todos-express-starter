var express = require('express');
var db = require('../db');

var router = express.Router();

// TEST USING insomnia

router.get('/', function(req, res, next) {
  if (!req.user) { 
    return res.render('home'); 
  }
  next();
}, function(req, res, next) {
  res.send("hi now");
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
    return res.redirect('/' + (req.body.filter || ''));
  });

  res.status(200).send('product added');
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
    return res.redirect('/' + (req.body.filter || ''));
  });

  res.status(200).send('product edited');
});

module.exports = router;