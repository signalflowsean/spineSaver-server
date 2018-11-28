'use strict'; 
const express = require('express');
const moment = require('moment'); 
const mongoose = require('mongoose'); 

const router = express.Router(); 

const Slouch = require('../models/slouch'); 
const User = require('../models/user'); 

router.get('/:id', (req, res, next) => {  
  //console.log('Getting display info'); 
  const { id } = req.params; 
  //console.log('id', id); 
  //const userId = req.user.id; 
 
  if(!mongoose.Types.ObjectId.isValid(id)) { 
    const err = new Error('The `id` is not valid'); 
    err.status = 400; 
    return next(err); 
  }

  let timeElapsed, slouchElapsed, improvement;  

  let prevTimeMin = moment().subtract(8, 'minutes')._d; 
  let prevTimeMax = moment().subtract(3, 'minutes')._d; 

  let presTimeMin = moment().subtract(4, 'minutes')._d; 
  let presTimeMax = moment().subtract(0, 'minutes')._d; 

  User
    .findById(id)
    .populate('slouches')
    .then(poseData => {
      
      const newSlouches = poseData.slouches.reduce((arr, slouch) => { 
        return [...arr, ...slouch.slouch];  
      }, [] ); 

      
      timeElapsed = toTime(newSlouches.length); 
      //console.log('time elapsed', timeElapsed); 
      slouchElapsed = getTimeSlouching(newSlouches);
      //console.log('slouch elpased', slouchElapsed); 
      
      const prevTimePromise = Slouch.find( {created: {
        $gte: prevTimeMin,
        $lt: prevTimeMax
      }, _id : id});
      
      const presTimePromise = Slouch.find( { created : { 
        $gte: presTimeMin, 
        $lt: presTimeMax
      }, _id : id}); 

      //const findUsernamePromise = User.find( {_id: id, userId} ); 
      
      return Promise.all([prevTimePromise, presTimePromise]); 
    })
    .then(data => {
      const newSlouchesPrev = data[0].reduce((arr, slouch) => { 
        return [...arr, ...slouch.slouch];  
      }, [] ); 

      const newSlouchPost = data[1].reduce((arr, slouch) => { 
        return [...arr, ...slouch.slouch];  
      }, [] ); 
     
      //console.log(data); 
      //console.log(data[0].length, data[1].length);   
      const prevTime = getTimeSlouching(newSlouchesPrev); 
      const presTime = getTimeSlouching(newSlouchPost); 
      //console.log('prevTime', prevTime, 'presTime', presTime); 


      improvement = (presTime/prevTime); 
      console.log((improvement).toFixed(3)); 
      //console.log(timeElapsed, slouchElapsed, improvement); 
      res.json({timeElapsed, slouchElapsed, improvement}); 
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
  //console.log(data); 
  const thresh = 0.02; 
  
  const slouchData = data.filter(pose => (pose >= thresh)); 
  console.log('slouchslouchData', slouchData.length); 

  const time = ((slouchData.length*50)/60000).toFixed(3); 

  return time; 
}

module.exports = router; 