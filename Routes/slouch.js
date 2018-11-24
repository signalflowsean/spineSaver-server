'use strict'; 
const express = require('express'); 
const moment = require('moment'); 
const bodyParser = require('body-parser'); 
const jsonParser = bodyParser.json(); 

const Slouch = require('../models/slouch'); 

const router = express.Router(); 

//TESTING ENDPOINT
// router.get('/hi', (req, res) => { 
//   res.send('hi'); 
// }); 

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


module.exports = router; 