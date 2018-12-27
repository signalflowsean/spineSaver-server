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

const signupRouter = require('./Routes/signup');
const loginRouter = require('./Routes/login'); 
const slouchRouter = require('./Routes/slouch');  
const displayRouter = require('./Routes/display'); 

const app = express(); 
mongoose.Promise = global.Promise; 

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

passport.use(localStrategy); 
passport.use(jwtStrategy); 

const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: false}); 

app.use('/api/signup', signupRouter); 
app.use('/api/auth', loginRouter); 
app.use('/api/slouch', jwtAuth, slouchRouter); 
app.use('/api/display', jwtAuth, displayRouter); 

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
    .then((instance) => { 
      const conn = instance.connections[0];
      // eslint-disable-next-line no-console 
      console.log(`Connected to : mongodb://${conn.host}:${conn.port}/${conn.name}`); 
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


