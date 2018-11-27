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
  res.json({slouchData}); 

  Slouch
    .create({ slouch : slouchData, created : moment() })
    .then(slouch => { 
      res.status(201);
    })
    .catch(error => {
      next(error); 
    }); 
}); 

router.get('/calibration/:id', (req, res, next) => { 
  const {id} = req.params; 

  User.find({_id: id})
    .then(res => { 
      // eslint-disable-next-line no-console
      res.json(res); 
      //console.log('calibrateValue', res.calibrateValue); 
    })
    .catch(err => { 
      console.error('error', err); 
    }); 

}); 


router.post('/calibration/:id', (req, res, next) => { 
  const {id} = req.params; 
  const {calibrateValue} = req.body;  

  User.findByIdAndUpdate({_id: id}, {calibrateValue})
    .then(res => { 
      console.log(res); 
    })
    .catch(err => { 
      console.error(err); 
    }); 
}); 




module.exports = router; 