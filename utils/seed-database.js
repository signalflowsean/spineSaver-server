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
      //console.log(results[1].createdAt); 
      let updatedResults = results.map((result, index) => { 
        //console.log(moment().subtract(index, 'hours')._d); 
        return { 
          slouch : result.slouch, 
          _id : result._id, 
          __v : result.__v, 
          created: moment().subtract(index, 'hours')._d
        }; 
      });
     
      const promises = updatedResults.map(result => { 
        return Slouch.findByIdAndUpdate(result._id, {created : result.created}, {new : true}); 
      }); 
      return Promise.all(promises); 
    })
    .then((result) => { 
      console.log(result[0], result[result.length-1]); 
    })
    .then(() => mongoose.disconnect())
    .catch(err => console.error(err))); 