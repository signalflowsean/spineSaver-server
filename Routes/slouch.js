'use strict'; 
const express = require('express'); 
const moment = require('moment'); 
const bodyParser = require('body-parser'); 
const jsonParser = bodyParser.json(); 

const Slouch = require('../models/slouch'); 
const User = require('../models/user'); 

const router = express.Router(); 

router.post('/:id', (req, res, next) => { 

  const {id} = req.params; 
  const {slouch} = req.body; 

  let slouched; 

  Slouch
    .create({ slouch, created : moment() })
    .then(_slouch => { 
      //console.log(_slouch); 
      //console.log('_slouch', _slouch); 
      slouched = _slouch; 
      
      return User.findByIdAndUpdate(id, 
        { $push: {slouches: _slouch._id} }, {new : true}); 
    })
    .then((user) => { 
      //console.log('user', user);

      res
        .status(201)
        .json({slouch}); 
    }) 
    .catch(error => {
      //console.log('Error with posting slouch data', error); 
      next(error); 
    }); 
}); 

router.get('/calibration/:id', (req, res, next) => { 
 
  const {id} = req.params; 
  
  User.findById(id)
    .then(data => { 
      const calibrationValue = data.calibrateValue; 
      res.json({calibrationValue});   
    })
    .catch(err => { 
      console.error('Error receiving calibration info for user', err); 
    }); 
}); 

router.post('/calibration/:id', (req, res, next) => { 
  
  const {id} = req.params; 
  const {calibrateVal} = req.body;  

  console.log(`Adding calibration data to user ${id}`);
  console.log(`With a calibration value of ${calibrateVal}`);   

  User.findByIdAndUpdate({_id: id}, {calibrateValue: calibrateVal})
    .then(user => { 
      res.json({message: 'Calibration Value has been added'}); 
      console.log('Calibration value has been added to user'); 
    })
    .catch(err => { 
      console.error(err); 
    }); 
}); 

module.exports = router; 