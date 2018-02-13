const express = require('express'),
      cookieParser = require('cookie-parser'),
      mongoose = require('mongoose'),
      bodyParser = require('body-parser'),
      session = require('express-session'),
      passport = require('passport'),
      methodOverride = require('method-override'),
      logger = require('morgan'),
      fs = require('fs'),
      mongoStore = require('connect-mongo')(session),
      path = require('path'),
      flash = require('connect-flash'),
      LocalStrategy = require('passport-local'),
      validator = require('express-validator'),
      helmet = require('helmet'),
      app = express();

app.use(helmet());

fs.readdirSync('./app/models').forEach(function(element){
        if(element.indexOf('.js')){
          require('./app/models/'+element);
        }
});

user = mongoose.model('User');

mongoose.connect("mongodb://localhost/market_app");
app.set('views', path.join(__dirname+'/app/views'));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(validator());

app.use(methodOverride("_method"));
app.use(flash());
app.use(logger('dev'));

app.use(cookieParser());
//passport configuration
app.use(session({
  secret : "Famous Sentence",
  resave : false,
  saveUninitialized : false,
  store : new mongoStore({ mongooseConnection : mongoose.connection}),
  cookie: {maxAge : 120 * 60 * 1000 }
}));

//initialize passportJS

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(function(username, password, done){
  user.findOne({username: username}, function(err, user){
    if(err) return done(err);
    if(!user) return done(null, false, {message : 'Incorrect username.'});
    user.comparePassword(password, function(err, isMatch){
      if(isMatch){
        return done(null, user);
      }else{
        return done(null, false, {message : 'Incorrect Password.'});
      }
    });
  });
}));

passport.serializeUser(function(user, done){
  done(null, user.id);
});

passport.deserializeUser(function(id, done){
  user.findById(id, function(err, user){
    done(err, user);
  });
});


app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.session = req.session;
  next();
});

//read model and controller files
fs.readdirSync('./app/controllers').forEach(function(element){
        if(element.indexOf('.js')){
          let route = require('./app/controllers/'+element);

          route.controller(app);
        }
});

app.listen(3000, function(){
  console.log('The server is now running.');
});
