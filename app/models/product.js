const mongoose = require('mongoose');

let ProductSchema = new mongoose.Schema({
  name : {type : String, required : true},
  price : {type : Number, required : true},
  description : String,
  seller : {
    id : {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'User'
    },
    username : String
  },
  make : String,
  weight : Number,
  volume : Number,
  image : String,
});


module.exports = mongoose.model("Product", ProductSchema);
