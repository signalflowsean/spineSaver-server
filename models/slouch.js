'use strict'; 

const mongoose = require('mongoose'); 

const slouchSchema = mongoose.Schema({ 
  slouch: {type: [Number], required: true}, 
  created: {type: Date}
}, {timestamps: true}); 

slouchSchema.set('toJSON', { 
  virtuals: true, 
  transform: (doc, ret) => { 
    delete ret.__id; 
    delete ret.__v; 
  }
}); 

module.exports = mongoose.model('Slouch', slouchSchema); 