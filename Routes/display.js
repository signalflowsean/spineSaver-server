'use strict'; 
const express = require('express');
const moment = require('moment'); 
const mongoose = require('mongoose'); 

const router = express.Router(); 

const Slouch = require('../models/slouch'); 
const User = require('../models/user'); 

router.get('/:id', (req, res, next) => {  
  const { id } = req.params; 
  //console.log(id); 
  const userId = req.user.id; 

  if(!mongoose.Types.ObjectId.isValid(id)) { 
    const err = new Error('The `id` is not valid'); 
    err.status = 400; 
    return next(err); 
  }

  let timeElapsed, slouchElapsed, improvement;  

  let prevTimeMin = moment().subtract(10, 'minutes')._d; 
  let prevTimeMax = moment().subtract(8, 'minutes')._d; 

  let presTimeMin = moment().subtract(4, 'minutes')._d; 
  let presTimeMax = moment().subtract(0, 'minutes')._d; 

  User
    .findById(id)
    .populate('Slouch')
    .then(poseData => {  
      console.log(JSON.stringify(poseData, null, 4)); 
      //console.log(poseData.slouch); 
      //console.log('posedata', poseData); 
      timeElapsed = toTime(poseData.length); 
      console.log(timeElapsed); 
      slouchElapsed = getTimeSlouching(poseData);
      
      const prevTimePromise = Slouch.find( {created: {
        $gte: prevTimeMin,
        $lt: prevTimeMax
      }});
      
      const presTimePromise = Slouch.find( { created : { 
        $gte: presTimeMin, 
        $lt: presTimeMax
      }}); 

      const findUsernamePromise = User.find( {_id: id, userId} ); 
      
      return Promise.all([prevTimePromise, presTimePromise, findUsernamePromise]); 
    })
    .then(data => {  
      const prevTime = getTimeSlouching(data[0]); 
      const presTime = getTimeSlouching(data[1]); 
      const username = data[2].username; 

      improvement = (presTime/prevTime); 
      console.log(timeElapsed, slouchElapsed, improvement); 
      res.json({timeElapsed, slouchElapsed, improvement, username}); 
    })
    .catch(error => { 
      next(error); 
    }); 
}); 

function toTime(length){ 
  const sampleSize = 10; 
  const frameRate = 50; 
  return ((length*frameRate*sampleSize)/60000).toFixed(2); 
}
function getTimeSlouching (data){ 
  const poseData = []; 
  const thresh = 0.5; 
  
  data.forEach((d) => d.slouch.forEach(p => poseData.push(p))); 
  const slouchData = poseData.filter(pose => (pose > thresh)); 

  //NOT * 10 broke out of array
  const time = ((slouchData.length*50)/60000).toFixed(2); 

  return time; 
}

module.exports = router; 