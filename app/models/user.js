const mongoose = require('mongoose'),
  bcrypt = require('bcryptjs');


var UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  firstName: String,
  lastName: String,
  password: String,
  email: {
    type: String,
    required: true,
    unique: true
  },

  dob: Date,
  phone: Number,
  isSeller: false,
  resetPasswordToken: String,
  resetPasswordExpires : Date,
  gstn: Number,


});

UserSchema.pre('save', function(next){
  let user = this;
  if(!user.isModified('password')) return next();

  bcrypt.genSalt(10, function(err, salt){
    if(err) return next(err);
    bcrypt.hash(user.password, salt, function(err, hash){
      if(err) return next(err);
      user.password = hash;
      next();
    });
  });
});


UserSchema.methods.comparePassword = function(userPassword, cb){
  bcrypt.compare(userPassword, this.password, function(err, isMatch){
    if(err) return cb(err);
    cb(null, isMatch);
  });
};

mongoose.model("User", UserSchema);
