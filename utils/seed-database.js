'use strict'; 
const mongoose = require('mongoose');
const moment = require('moment'); 

const { DATABASE_URL } = require('../config');
const Slouch = require('../models/slouch');
const generateData = require('../db/generate-data'); 

mongoose.connect( DATABASE_URL, { useNewUrlParser:true })
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => Slouch.insertMany(generateData())
    .then(results => { 
      const updatedResults = results.map((result, index) => { 
        return { 
          slouch : result.slouch, 
          _id : result._id, 
          __v : result.__v, 
          createdAt : moment().subtract(index, 'hours')._d, 
          updatedAt : moment().subtract(index, 'hours')._d
        }; 
      });  
      return Slouch.updateMany(updatedResults); 
    })
    .then(results => { 
      return Slouch.find(); 
    })
    .then(results => { 
      console.log(results); 
    })
    .then(() => mongoose.disconnect())
    .catch(err => console.error(err))); 