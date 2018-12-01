'use strict'; 
const express = require('express');
const moment = require('moment'); 
const mongoose = require('mongoose'); 

const router = express.Router(); 

const Slouch = require('../models/slouch'); 
const User = require('../models/user'); 

router.get('/:id', (req, res, next) => {  

  const { id } = req.params; 
 
  if(!mongoose.Types.ObjectId.isValid(id)) { 
    const err = new Error('The `id` is not valid'); 
    err.status = 400; 
    return next(err); 
  }

  let timeElapsed, slouchElapsed, improvement;  

  let prevTimeMin = moment().subtract(3, 'minutes')._d; 
  let prevTimeMax = moment().subtract(2, 'minutes')._d; 

  let presTimeMin = moment().subtract(1, 'minutes')._d; 
  let presTimeMax = moment().subtract(0, 'minutes')._d; 

  User
    .findById(id)
    .populate('slouches')
    .then(poseData => {

      const newSlouches = poseData.slouches.reduce((arr, slouch) => { 
        return [...arr, ...slouch.slouch];  
      }, [] ); 

      timeElapsed = toTime(newSlouches.length); 
      slouchElapsed = getTimeSlouching(newSlouches);
      
      const prevTimePromise = Slouch.find( {created: {
        $gte: prevTimeMin,
        $lt: prevTimeMax
      }, _id : id});
      
      const presTimePromise = Slouch.find( { created : { 
        $gte: presTimeMin, 
        $lt: presTimeMax
      }, _id : id}); 

      return Promise.all([prevTimePromise, presTimePromise]); 
    })
    .then(data => {
      const newSlouchesPrev = data[0].reduce((arr, slouch) => { 
        return [...arr, ...slouch.slouch];  
      }, [] ); 

      const newSlouchPost = data[1].reduce((arr, slouch) => { 
        return [...arr, ...slouch.slouch];  
      }, [] ); 
    
      const prevTime = getTimeSlouching(newSlouchesPrev); 
      const presTime = getTimeSlouching(newSlouchPost); 

      //console.log('prevTime', prevTime); 
      //console.log('postTime', presTime); 

      //NOTE IMPROVEMENT IS NOT WORKING
      improvement = (presTime/prevTime); 

      res.json({timeElapsed, slouchElapsed, improvement: 11}); 
    })
    .catch(error => { 
      console.log('Error getting display data: ', error); 
      next(error); 
    }); 
}); 

function toTime(length){ 
  const sampleSize = 10; 
  const frameRate = 50; 
  return ((length*frameRate*sampleSize)/60000).toFixed(3); 
}
function getTimeSlouching (data){ 
  const thresh = 0.3; 

  const slouchData = data.filter(pose => (pose > thresh)); 

  const time = ((slouchData.length*50)/60000).toFixed(3); 

  return time; 
}

module.exports = router; 