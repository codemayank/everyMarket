const express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  user = mongoose.model('User'),
  product = mongoose.model('Product'),
  Cart = require('../models/cart'),
  middleware = require('./../../middlewares/middleware'),
  appResponse = require('./../../middlewares/responsegen');


module.exports.controller = function(app) {

  //route to add a product to cart.
  router.get("/add-to-cart/:id", function(req, res) {
    let productId = {
      '_id': req.params.id
    };

    let cart = new Cart(req.session.cart ? req.session.cart : {});
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      product.findById(productId, function(err, product) {
        if (err) {
          return res.redirect('/');
        }
        cart.add(product, req.params.id);
        req.session.cart = cart;
        res.redirect('/products');
      });
    } else {
      res.send('Invalid Id');
    }
  });

  //route to remove product from Cart
  router.get("/remove-from-cart/:id", function(req, res) {
    let productId = req.params.id;
    let cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.removeItem(productId);
    req.session.cart = cart;
    res.redirect('/cart/show-cart');
  });

  //route to remove single entry of product from Cart
  router.get("/reduce-in-cart/:id", function(req, res) {
    let productId = req.params.id;
    let cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect("/cart/show-cart");
  });

  //route to remove single entry of product from Cart
  router.get("/increase-in-cart/:id", function(req, res) {
    let productId = req.params.id;
    let cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.increaseByOne(productId);
    req.session.cart = cart;
    res.redirect("/cart/show-cart");
  });



  // route to show the items from cart
  router.get('/show-cart', function(req, res) {
    console.log(req.session.cart);
    res.render('products/cart', {
      cart: req.session.cart
    });
  });

  router.get('/checkout', middleware.isLoggedIn, function(req, res) {
    let cart = new Cart(req.session.cart ? req.session.cart : {});
    cart.checkOut();
    req.session.cart = cart;
    res.redirect('/products');
  });

  app.use('/cart', router);

}
