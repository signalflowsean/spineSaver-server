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
  //console.log(Slouch); 

  Slouch
    .create({ slouch : slouchData })
    .then(slouch => { 
      res.status(201);

      // eslint-disable-next-line no-console
      //console.log(slouch); 
    })
    .catch(err => {
      // eslint-disable-next-line no-console 
      console.log('Error: ', err); 
    }); 
}); 

app.get('/api/display', (req, res) => { 

  //const thresh = 0.5;  
  let timeElapsed, slouchElapsed, improvement; 
  let prevSlouch, presSlouch; 

  let today = moment().startOf('day');  
  
  let tomorrow = moment(today).endOf('day'); 
  
  // Slouch
  //   .find()
  //   .then(poseData => { 
  //     //console.log(slouch.length); 
  //     console.log('poseData', poseData); 
  //     const slouchData = calculateSlouchFromPose(poseData[0].slouch); 
  //     //const slouchData = poseData[0].slouch.filter(pose => (pose > thresh)); 
  //     timeElapsed = calculateTimeFromLength(poseData.length); 
  //     slouchElapsed = calculateTimeFromLength(slouchData.length); 
  //     return Slouch.find( {createdAt: {
  //       $gte: today.toDate(),
  //       $lt: tomorrow.toDate()
  //     }})
  //       .then((data) => { 
  //         console.log('hi');
  //       }); 
      
  //   });  
  //res.json(display); 
    
}); 
function calculateTimeFromLength(length){ 
  const sampleSize = 10; 
  const frameRate = 50; 

  return ((length * frameRate * sampleSize)/60000).toFixed(2); 
}

function calculateSlouchFromPose(poseData){
  const thresh = 0.5; 
  return poseData.filter(pose => (pose > thresh)); 
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


