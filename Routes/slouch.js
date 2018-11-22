'use strict'; 
const express = require('express'); 
const moment = require('moment'); 
const bodyParser = require('body-parser'); 
const jsonParser = bodyParser.json(); 

const Slouch = require('../models/slouch'); 

const router = express.Router(); 


//TESTING ENDPOINT
router.get('/api/hi', (req, res) => { 
  res.send('hi'); 
}); 

router.post('/slouchData', (req, res) => { 
  const {slouchData} = req.body; 
  res.json({slouchData}); 

  Slouch
    .create({ slouch : slouchData, created : moment() })
    .then(slouch => { 
      res.status(201);
    })
    .catch(err => {
      // eslint-disable-next-line no-console 
      console.log('Error: ', err); 
    }); 
}); 

router.get('/display', (req, res) => {  
  let timeElapsed, slouchElapsed, improvement;  

  let prevTimeMin = moment().subtract(10, 'hours')._d; 
  let prevTimeMax = moment().subtract(8, 'hours')._d; 

  let presTimeMin = moment().subtract(4, 'hours')._d; 
  let presTimeMax = moment().subtract(0, 'hours')._d; 

  Slouch
    .find()
    .then(poseData => {  
      const prevTimePromise = Slouch.find( {created: {
        $gte: prevTimeMin,
        $lt: prevTimeMax
      }});
      
      const presTimePromise = Slouch.find( { created : { 
        $gte: presTimeMin, 
        $lt: presTimeMax
      }}); 

      timeElapsed = toTime(poseData.length); 
      slouchElapsed = getTimeSlouching(poseData);
      
      return Promise.all([prevTimePromise, presTimePromise]); 
    })
    .then(data => {  
      const prevTime = getTimeSlouching(data[0]); 
      const presTime = getTimeSlouching(data[1]); 
      
      improvement = (presTime/prevTime); 
      
      res.json({timeElapsed, slouchElapsed, improvement}); 
    })
    .catch(error => { 
      // eslint-disable-next-line no-console
      console.log('Error: ', error); 
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