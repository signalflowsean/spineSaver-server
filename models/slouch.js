'use strict'; 

const mongoose = require('mongoose'); 

const slouchSchema = mongoose.Schema({ 
  slouch: {type: [Number], required: true}
}); 

slouchSchema.set('toJSON', { 
  virtuals: true, 
  transform: (doc, ret) => { 
    delete ret.__id; 
    delete ret.__id; 
  }
}); 

const Slouch = mongoose.model('Slouch', slouchSchema); 

module.exports = Slouch; 