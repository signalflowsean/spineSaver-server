'use strict'; 
const mongoose = require('mongoose'); 

const displaySchema = mongoose.Schema({ 
  name : {type : String, required: true}, 
  loggedTime : {type : Number, required : true}, 
  slouchedTime : {type : Number, required : true}, 
  improvement : {type : Number, required : true}
}); 


const Display = mongoose.model('Display', displaySchema); 

module.exports = Display; 