const express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  user = mongoose.model('User'),
  product = mongoose.model('Product'),
  middleware = require('./../../middlewares/middleware'),
  appResponse = require('./../../middlewares/responsegen');

module.exports.controller = function(app){

  //route to list all products
  router.get('/', function(req, res) {
    product.find({}, function(err, allProducts){
        if(err){
          let response = appResponse.generateResponse(true, 'We could not get the products at this moment please try again', 500, null);
          res.render('error', {
            message : response.message,
            error : response.status
          });
        }else{
          res.render("products/index", {products : allProducts, currentUser : req.user});
        }
    });
  });

  // route to list all products from a particular seller
  router.get('/seller-product', middleware.isSeller, function(req, res){
    product.find({"seller.username" : req.user.username}, function(err, foundProducts){
      if(err){
        let response = appResponse.generateResponse(true, 'We could not get the products at this moment please try again', 500, null);
        res.render('error', {
          message : response.message,
          error : response.status
        });
      }else{
        res.render("products/index", {products : foundProducts, currentUser : req.user});
      }
    });
  });

  //route to add new product
  router.post('/add-product', middleware.isSeller, function(req, res){
    let newProduct = new product({
      name : req.body.name,
      price : req.body.price,
      description : req.body.description,
      seller : {id : req.user._id, username : req.user.username},
      make : req.body.make,
      weight : req.body.weight,
      volume : req.body.volume,
      image : req.body.image
    })

    newProduct.save(function(err, product){
      if(err){
        let response = appResponse.generateResponse(true, 'We Could Not add your product at this moment..please try again',500,null);
        res.render('error', {
          message : response.message,
          error : response.status
        });
      }else{
        res.redirect('/');
      }
    });
  });

  //route to show the add new product form
  router.get("/add-product", middleware.isSeller, function(req, res){
    res.render("products/add-new-product");
  });

  //route to show the product details
  router.get("/show-product/:id", function(req, res){
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    product.findById(req.params.id, function(err, foundProduct){
      if(err || !foundProduct){
        let response = appResponse.generateResponse(true, "We could not find the product at this moment.. please try again", 500, null);
        res.render('error', {
          message : response.message,
          error : response.status
        });
      }else if(!foundProduct){
        let response = appResponse.generateResponse(true, "No product with that product id exists please enter valid product id.", 404, null);
        res.render('error', {
          message : response.message,
          error : response.status
        });

      }else{
        res.render('products/show-product', {product: foundProduct});
      }
    });
  }else{
    let response = appResponse.generateResponse(true, "Invalid product id please enter correct product id", 404, null);
    res.render('error', {
      message : response.message,
      error : response.status
    });
  }
  });


  //route to show edit product form
  router.get("/update-product/:id", middleware.checkProductOwnership, function(req, res){
    product.findById(req.params.id, function(err, foundProduct){
      if(err){
        let response = appResponse.generateResponse(true, "We could not find the product at this moment.. please try again", 500, null);
        res.render('error', {
          message : response.message,
          error : response.status
        });
      }
      res.render("products/edit", {product : foundProduct});
    });
  });
  //route to update a product
  router.put('/update-product/:id', middleware.checkProductOwnership, function(req, res){
    product.findByIdAndUpdate(req.params.id, req.body.product, function(err, updatedProduct){
      if(err){
        let response = appResponse.generateResponse(true, 'We Could Not update your product at this moment.. please try again', 500, null);
        res.render('error', {
          message : response.message,
          error : response.status
        });
      }else{
        res.redirect("/");
      }
    });
  })

  //route to delete a product
  router.delete("/:id", middleware.checkProductOwnership, function(req, res){
    product.findByIdAndRemove(req.params.id, function(err){
      if(err){
        let response = appResponse.generateResponse(true, "we could not delete the product at this moment.. please try again", 500, null);
        res.render('error', {
          message : response.message,
          error : response.status
        });
      }else{
        res.redirect('/');
      }
    });
  });



  app.use('/products', router);

};
