
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const secretTicket = 'shhh'
require('dotenv').config();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const port = process.env.PORT || 5000
const app = express();


//middlewire

app.use(cors());
app.use(express.json());




app.get('/', (req, res) => {
  res.send('full-stack-12-server running')
});

app.listen(port, () => {
  console.log('listening', port);
});