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
  //TEMP FOR NOW
  //res.json({timeElapsed: 2, slouchElapsed : 3, improvement : 21 }); 
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
      }});
      
      const presTimePromise = Slouch.find( { created : { 
        $gte: presTimeMin, 
        $lt: presTimeMax
      }}); 

      //const findUsernamePromise = User.find( {_id: id, userId} ); 
      
      return Promise.all([prevTimePromise, presTimePromise]); 
    })
    .then(data => {  
      const prevTime = getTimeSlouching(data[0]); 
      const presTime = getTimeSlouching(data[1]); 
      console.log('prevTime', prevTime, 'presTime', presTime); 


      improvement = (presTime/prevTime); 
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
  const poseData = []; 
  const thresh = 0.02; 
  
  const slouchData = data.filter(pose => (pose >= thresh)); 
  console.log('slouchslouchData', slouchData.length); 

  const time = ((slouchData.length*50)/60000).toFixed(3); 

  return time; 
}

module.exports = router; 