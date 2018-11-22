'use strict'; 

const express = require('express');
const bodyParser = require('body-parser'); 
const cors = require('cors'); 
const morgan = require('morgan'); 
const mongoose = require('mongoose'); 

const { PORT, CLIENT_ORIGIN, DATABASE_URL } = require('./config'); 

const loginRouter = require('./routes/login');
const slouchRouter = require('./routes/slouch');  

mongoose.Promise = global.Promise; 

const app = express(); 

app.use(bodyParser.json());

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
); 

// app.use(
//   morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', { 
//     skip : (req, res) => process.env.NODE_ENV === 'test'})
// ); 

app.use('/api/login', loginRouter); 
app.use('/api/', slouchRouter); 

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


