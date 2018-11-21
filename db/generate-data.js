'use strict'; 

const sampleSize = 200; 
const packetLength = 10; 

function generateData() { 
  let emptyArray = new Array(sampleSize).fill(0); 
  let mockData = emptyArray.map(dPoint =>  { 
    return {slouch : new Array(packetLength).fill(Math.random())}; 
  }); 
  
  return mockData; 
}
module.exports = generateData; 
