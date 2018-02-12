const mongoose = require('mongoose'),
      user = mongoose.model('User'),
      product = mongoose.model('Product'),
      middlewareObj = {},
      response = require('../middlewares/responsegen');

middlewareObj.isLoggedIn = function(req, res, next){
  console.log(req.user);
  if(req.isAuthenticated()){
    return next;
  }else{
    req.flash("error", "You Need to be logged in to do that.");
    return res.redirect('/login');
  }
};

middlewareObj.isSeller = function(req, res, next) {
  if(req.isAuthenticated()){
    if(req.user.isSeller){
      next();
    }
    else{
      let appResponse = response.generateResponse(true, 'You do not have authorisation to access this page', 500, null);
      res.render('error', {
        message : appResponse.message,
        error : appResponse.data
      });
    }
  }else{
    req.flash("error", "You need to be logged in to do that.");
  }
};

middlewareObj.checkProductOwnership = function(req, res, next){
  if(req.isAuthenticated()){
    product.findById(req.params.id, function(err, foundProduct){
      if(err || !foundProduct){
        req.flash("error", "Product Not Found");
        res.redirect("back");
      }else{
        if(foundProduct.seller.id.equals(req.user.id)){
          next();
        }else{
          req.flash("error", "You Don't have permission to do that!");
          redirect("back");
        }
      }
    });
  }else{
    req.flash("error", "You Need to be logged in to do that");
    res.redirect("back");
  }
}

module.exports = middlewareObj;
