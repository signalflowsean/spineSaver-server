'use strict'; 

const express = require('express');
const bodyParser = require('body-parser'); 
const cors = require('cors'); 
const morgan = require('morgan'); 
const mongoose = require('mongoose'); 

const { PORT, CLIENT_ORIGIN } = require('./config'); 

const app = express(); 

app.use(bodyParser.json());

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', { 
    skip : (req, res) => process.env.NODE_ENV === 'test'
  })
); 

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
); 

app.get('/api/hi', (req, res) => { 
  res.send('hi'); 
}); 

app.post('/api/slouchData', (req, res) => { 
  const {slouchData} = req.body; 

  //res.json({slouchData}); 
}); 

function runServer(port = PORT) { 
  const server = app
    .listen(port, () => { 
      console.info(`App listening on port ${server.address().port}`); 
    })
    .on('error', err => { 
      console.err('Express failed:', err); 
    }); 
}

if (require.main === module) { 
  runServer(); 
}


