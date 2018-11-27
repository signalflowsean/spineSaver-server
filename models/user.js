'use strict'; 

const bcrypt = require('bcryptjs'); 
const mongoose = require('mongoose'); 

const userSchema = new mongoose.Schema({ 
  fullname : { type: String, default: '', required: true}, 
  username: { type: String, require: true, unique: true},
  password: { type: String, required: true}, 
  calibrateValue: { type: Number, default: 0}, 
  slouch : {type : mongoose.Types.ObjectId, ref : 'Slouch'}
}); 

userSchema.set('toJSON',  { 
  virtuals: true, 
  transform: (doc, result) => { 
    delete result._id; 
    delete result.__v; 
    delete result.password; 
  }
}); 

userSchema.methods.validatePassword = function (incomingPassword) { 
  const user = this; 
  return bcrypt.compare(incomingPassword, user.password); 
}; 

userSchema.statics.hashPassword = function (incomingPassword) { 
  return bcrypt.hash(incomingPassword, 10); 
}; 

module.exports = mongoose.model('User', userSchema); 