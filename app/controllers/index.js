const express = require('express'),
  router = express.Router(),
  passport = require('passport'),
  mongoose = require('mongoose'),
  LocalStrategy = require('passport-local'),
  product = mongoose.model('Product'),
  user = mongoose.model('User'),
  async = require('async'),
  crypto = require('crypto'),
  bcrypt = require('bcryptjs'),
  nodemailer = require('nodemailer'),
  middleware = require('./../../middlewares/middleware'),
  moment = require('moment'),
  appResponse = require('./../../middlewares/responsegen');


module.exports.controller = function(app) {

  router.get('/', function(req, res) {
    product.find({}, function(err, allProducts) {
      if (err) {
        let response = appResponse.generateResponse(true, 'We could not get the products at this moment please try again', 500, null);
        res.render('error', {
          message: response.message,
          error: response.data
        });
      } else {
        res.render("products/index", {
          products: allProducts,
          currentUser: req.user
        });
      }
    });
  });

  router.get('/user-profile', function(req, res) {
    if (req.user === undefined || req.user === null) {
      let response = appResponse.generateResponse(true, 'You need to be logged in to view user profile', 401, null);
      res.render('error', {
        message: response.message,
        error: response.data
      });
    } else {
      res.render('userprofile', {
        currentUser: req.user
      });
    }

  });

  router.get('/register/user', function(req, res) {
    if (req.user != undefined || req.user != null) {
      let response = appResponse.generateResponse(true, 'You are already registered', 401, null);
      res.render('error', {
        message: response.message,
        error: response.data
      });
    } else {
      res.render('userregister');
    }

  });

  router.get('/register/seller', function(req, res) {
    if (req.user != undefined || req.user != null) {
      let response = appResponse.generateResponse(true, 'You are already registered', 401, null);
      res.render('error', {
        message: response.message,
        error: response.data
      });
    } else {
      res.render('register');
    }

  });

  router.get('/login', function(req, res) {
    if (req.user != undefined || req.user != null) {
      let response = appResponse.generateResponse(true, 'You are already logged in', 401, null);
      res.render('error', {
        message: response.message,
        error: response.data
      });
    } else {
      res.render('login');
    }

  });
  //signup logic
  router.post("/register/user", function(req, res) {
    if (req.user != undefined || req.user != null) {
      let response = appResponse.generateResponse(true, 'You are already registered', 401, null);
      res.render('error', {
        message: response.message,
        error: response.data
      });
    } else {
      if (req.body.username &&
        req.body.firstName &&
        req.body.lastName &&
        req.body.password &&
        req.body.email &&
        req.body.dob &&
        req.body.phone
      ) {

        let newUser = new user({
          username: req.body.username,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          dob: req.body.dob,
          password: req.body.password,
          phone: req.body.phone,
          isSeller: false

        }); //newUser Done
        newUser.save(function(err) {
          req.logIn(newUser, function(err) {
            res.redirect('/');
          });
        });

      } else {
        res.send('some parameter is missing');
      }
    }

  });

  router.post('/register/seller', function(req, res) {
    if (req.body.username &&
      req.body.firstName &&
      req.body.lastName &&
      req.body.password &&
      req.body.email &&
      req.body.dob &&
      req.body.phone &&
      req.body.gstn
    ) {

      let newUser = new user({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        dob: req.body.dob,
        password: req.body.password,
        phone: req.body.phone,
        isSeller: true,
        gstin: req.body.gstn

      }); //newUser Done
      newUser.save(function(err) {
        req.logIn(newUser, function(err) {
          res.redirect('/home');
        });
      });
    } else {
      res.send('some parameter is missing');
    }
  });

  //login logic
  router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) return next(err);
      if (!user) {
        return res.send('User with that crendentials does not exist.');
      }
      req.logIn(user, function(err) {
        if (err) return next(err);
        return res.redirect('/');
      });
    })(req, res, next);
  });

  router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  })

  //----------------------Delete User Logic--------------------------
  router.delete('/delete', middleware.isLoggedIn, function(req, res) {
    user.findByIdAndRemove(req.user._id, function(err) {
      if (err) {
        let response = appResponse.generateResponse(true, "we could not delete the product at this moment.. please try again", 500, null);
        res.render('error', {
          message: response.message,
          error: response.status
        });
      } else {
        res.redirect('/');
      }
    });
  });

  //------------------get edit user form---------------------
  router.get('/edit-profile', middleware.isLoggedIn, function(req, res) {
    res.render('edit-user', {
      currentUser: req.user,
      moment: moment
    });
  });

  //---------------------------edit user logic----------------
  router.put('/edit-profile', middleware.isLoggedIn, function(req, res) {
    user.findOne({
      _id: req.user._id
    }, function(err, foundUser) {
      if (!foundUser) {
        res.send('you do not have permission to do that!');
      }
      console.log(foundUser);
      foundUser.username = req.body.username;
      foundUser.firstName = req.body.firstName;
      foundUser.lastName = req.body.lastName;
      foundUser.password = req.body.password;
      foundUser.email = req.body.email;
      foundUser.dob = req.body.dob;
      foundUser.phone = req.body.phone;
      if (foundUser.isSeller) {
        foundUser.gstn = req.body.gstn;
      }
      console.log(foundUser);
      foundUser.save(function(err) {
        console.log(foundUser);
        res.redirect('/');
      });
    });
  });

  //----------------------------forgot password logic------------
  router.get('/forgot', function(req, res) {
    res.render('forgot');
  });

  router.post('/forgot', function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        })
      },
      function(token, done) {
        user.findOne({
          email: req.body.email
        }, function(err, user) {
          if (!user) {
            res.send('no such user with that e-mail exists.');
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000;

          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        let smtpTransport = nodemailer.createTransport({
          service: 'SendGrid',
          auth: {
            user: 'myan123',
            pass: '$~f).Vv$36\'6dApF'
          }
        });
        let mailOptions = {
          to: user.email,
          from: 'passwordreset@demo.com',
          subject: 'Password reset',
          text: 'Password Reset Mail \n\n' + 'Click on the below link to reset your password\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          res.render('email-sent', {
            email: user.email
          });
          done(err, 'done');
        });
      }
    ], function(err) {
      if (err) return next(err);
      res.redirect('/forgot');
    });
  });

  app.get('/reset/:token', function(req, res) {
    user.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: {
        $gt: Date.now()
      }
    }, function(err, user) {
      if (!user) {
        res.send('error', 'Password reset token is invalid or has expired');
      }
      res.render('newpassword', {
        user: req.user,
        token: req.params.token
      });
    });
  });

  app.post('/reset/:token', function(req, res) {
    async.waterfall([
      function(done) {
        user.findOne({
          resetPasswordToken: req.params.token,
          resetPasswordExpires: {
            $gt: Date.now()
          }
        }, function(err, user) {
          if (!user) {
            res.send('the password reset token is invalid or has expired');
          }

          user.password = req.body.password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

          user.save(function(err) {
            req.logIn(user, function(err) {
              done(err, user);
            });
          });
        });
      },
      function(user, done) {
        let smtpTransport = nodemailer.createTransport({
          service: 'SendGrid',
          auth: {
            user: 'myan123',
            pass: '$~f).Vv$36\'6dApF'
          }
        });
        let mailOptions = {
          to: user.email,
          from: 'passwordreset@demo.com',
          subject: 'Your Password has been changed',
          text: 'Password Changed successfully!'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          res.redirect('/');
          done(err);
        })
      }
    ], function(err) {
      res.redirect('/');
    })
  })

  //-------------------------------forgot password logic ends-----------

  app.use(router);
}