'use strict'; 

const express = require('express');
const bodyParser = require('body-parser'); 
const cors = require('cors'); 
const morgan = require('morgan'); 
const mongoose = require('mongoose'); 
const passport = require('passport'); 
const moment = require('moment'); 

const { PORT, CLIENT_ORIGIN, DATABASE_URL } = require('./config'); 
const Slouch = require('./models/slouch'); 

mongoose.Promise = global.Promise; 

const app = express(); 

app.use(bodyParser.json());

// app.use(
//   morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', { 
//     skip : (req, res) => process.env.NODE_ENV === 'test'})
// ); 

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
); 

//TESTING ENDPOINT
app.get('/api/hi', (req, res) => { 
  res.send('hi'); 
}); 

app.post('/api/slouchData', (req, res) => { 
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

app.get('/api/display', (req, res) => {  
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

function runServer(port = PORT) { 
  const server = app
    .listen(port, () => { 
      // eslint-disable-next-line no-console
      console.info(`App listening on port ${server.address().port}`); 
    })
    .on('error', err => {
      // eslint-disable-next-line no-console
      console.error('Express failed:', err); 
    }); 
}

function dbConnect(url = DATABASE_URL) { 
  return mongoose.connect(url, { useNewUrlParser: true })
    .then(() => { 
      // eslint-disable-next-line no-console
      console.log('Mongoose is connected'); 
    })
    .catch(err => { 
      // eslint-disable-next-line no-console
      console.error('Mongoose failed to connect');
      // eslint-disable-next-line no-console 
      console.error(err); 
    }); 
}

if (require.main === module) { 
  runServer(PORT); 
  dbConnect(DATABASE_URL); 
}


