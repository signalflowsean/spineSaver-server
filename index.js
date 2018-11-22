'use strict'; 

const express = require('express');
const bodyParser = require('body-parser'); 
const cors = require('cors'); 
const morgan = require('morgan'); 
const mongoose = require('mongoose'); 
const passport = require('passport'); 

const { PORT, CLIENT_ORIGIN, DATABASE_URL } = require('./config'); 

const localStrategy = require('./passport/local'); 
const jwtStrategy = require('./passport/jwt'); 

const loginRouter = require('./routes/login');
const authRouter = require('./routes/auth'); 
const slouchRouter = require('./routes/slouch');  

mongoose.Promise = global.Promise; 

const app = express(); 

app.use(bodyParser.json());

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
); 

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', { 
    skip : (req, res) => process.env.NODE_ENV === 'test'})
); 

passport.use(localStrategy); 
passport.use(jwtStrategy); 

const jwtAuth = passport.authenticate('jwt', {session : false, failWithError: true}); 

app.use('/api', authRouter); 
app.use('/api/login', loginRouter); 
app.use('/api', slouchRouter); 

//Custom Error Handler
app.use((err, req, res, next) => { 
  if (err.status) { 
    const errBody = Object.assign({}, err, { message: err.message }); 
    res.status(err.status).json(errBody); 
  } else { 
    res.status(500).json({ message: 'Internal Server Error' }); 
  }
}); 

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


