'use strict'; 

const express = require('express'); 
const app = express(); 

app.get('/api/hi', (req, res) => { 
  res.send('hi'); 
}); 

app.listen(8080); 

