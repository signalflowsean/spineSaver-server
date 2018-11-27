'use strict'; 
const express = require('express'); 
const moment = require('moment'); 
const bodyParser = require('body-parser'); 
const jsonParser = bodyParser.json(); 

const Slouch = require('../models/slouch'); 
const User = require('../models/user'); 

const router = express.Router(); 

router.post('/', (req, res, next) => { 
  const {slouchData} = req.body; 

  Slouch
    .create({ slouch : slouchData, created : moment() })
    .then(slouch => { 
      res
        .status(201)
        .json({slouchData: slouch}); 
    })
    .catch(error => {
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
      console.error('error', err); 
    }); 
}); 

router.post('/calibration/:id', (req, res, next) => { 
  const {id} = req.params; 
  const {calibrateVal} = req.body;  

  User.findByIdAndUpdate({_id: id}, {calibrateValue: calibrateVal})
    .then(user => { 
      res.json({message: 'Calibration Value has been added'}); 
      console.log(user); 
    })
    .catch(err => { 
      console.error(err); 
    }); 
}); 


module.exports = router; 