'use strict'; 
const express = require('express'); 
const router = express.Router(); 

const bodyParser = require('body-parser'); 
const jsonParser = bodyParser.json(); 

const User = require('../models/user'); 


router.post('/', (req, res, next) => { 
  const requiredFields = ['username', 'password']; 
  const missingField = requiredFields.find(field => !(field in req.body)); 

  if(missingField) { 
    const err = new Error(`Missing '${missingField}'`);
    err.status = 422; 
    return next(err);  
  }

  const stringFields = ['username', 'password', 'fullname']; 
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  ); 

  if (nonStringField) { 
    const err = new Error(`Field not type String: ${nonStringField}`); 
    err.status = 422; 
    return next(err); 
  }

  const explicitlyTrimmedFields = ['username', 'password']; 
  const nonTrimmedField = explicitlyTrimmedFields.find( 
    field => req.body[field].trim() !== req.body[field] 
  ); 

  if (nonTrimmedField) { 
    const err = new Error(`Field not trimmed: '${nonTrimmedField}'`); 
    err.status = 422; 
    return next(err); 
  }

  const sizedFields = { 
    username: { min: 1}, 
    password: { min: 8, max: 72}
  }; 

  const tooSmallField = Object.keys(sizedFields).find(
    field => 'min' in sizedFields[field] &&
      req.body[field].trim().length < sizedFields[field].min
  ); 
  
  if (tooSmallField) { 
    const min = sizedFields[tooSmallField].min; 
    const err = new Error(`Field too small: '${tooSmallField}'`); 
  }

  const tooLargeField = Object.keys(sizedFields).find(
    field => 'max' in sizedFields[field] && 
      req.body[field].trim().length > sizedFields[field].max
  ); 

  if (tooLargeField) { 
    const max = sizedFields[tooLargeField].max; 
    const err = new Error(`Field too large: '${tooLargeField}'`); 
    err.status = 422; 
    return next(err); 
  }

  let { username, password, fullname =''} = req.body; 
  fullname = fullname.trim(); 

  return User.hashPassword(password)
    .then(digest => { 
      const newUser = { 
        username, 
        password : digest, 
        fullname
      };
      return User.create(newUser);  
    })
    .then(result => { 
      return res.status(201).location(`/api/users/${result.id}`).json(result); 
    })
    .catch(err => { 
      if (err.code === 11000) { 
        err = new Error('The username already exists'); 
        err.status = 400; 
      }
      next(err); 
    }); 


}); 


module.exports = router; 