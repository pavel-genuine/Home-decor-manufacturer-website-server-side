
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

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.pbmjp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

  try {

    await client.connect()
    const toolsCollection = client.db('toolsFactory').collection('tools')
    const userCollection = client.db('toolsFactory').collection('user')
    const ordersCollection = client.db('toolsFactory').collection('order')
    const reviewCollection = client.db('toolsFactory').collection('review')
    const paymentCollection = client.db('toolsFactory').collection('payment')


    app.post('/sign-in', async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, secretTicket, {
        expiresIn: '1d'
      });
      res.send({ accessToken });
    })


    app.get('/orders', async (req, res) => {
      const query = {}
      const cursor = ordersCollection.find(query)
      const allorders = await cursor.toArray()
      res.send(allorders)
    })

    app.get('/tools', async (req, res) => {
      const query = {}
      const cursor = toolsCollection.find(query)
      const alltools = await cursor.toArray()
      res.send(alltools)
    })

    app.post('/tool', async (req, res) => {
      const tool = req.body;
      const result = await toolsCollection.insertOne(tool);
      res.send(result)
    })

    app.put('/purchase/:id', async(req, res) =>{
      const id = req.params.id;
      const tool = req.body;
      const filter = {_id: ObjectId(id)};
      const options = { upsert: true };
      const updatedDoc = {
          $set: {
            quantity: tool.quantity,
          }
      };
      const result = await ordersCollection.updateOne(filter, updatedDoc, options);
      res.send(result);
    
    })


    app.get('/purchase/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: ObjectId(id) }

      const singletool = await toolsCollection.findOne(query)
      res.send(singletool)
    })
    
    app.get('/payment/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: ObjectId(id) }
      const singletool = await toolsCollection.findOne(query)
      res.send(singletool)
    })



    app.post('/user', async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result)
    })

    app.post('/review', async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result)
    })

    app.get('/reviews', async (req, res) => {
      const query = {}
      const cursor = reviewCollection.find(query)
      const allreviews = await cursor.toArray()
      res.send(allreviews)
    })

    app.get('/user', async (req, res) => {
      const email = req.query.email;
      const query = { email: email }
      const user = await userCollection.findOne(query)
      res.send(user)
    })

    app.get('/users', async (req, res) => {
      const query = {}
      const cursor = userCollection.find(query)
      const allusers = await cursor.toArray()
      res.send(allusers)
    })

    app.get('/user-orders', async (req, res) => {
      // const decodedEmail = req.decoded.email
      const email = req.query.email;
      // if (email === decodedEmail) {
      const query = { email: email };
      const cursor = ordersCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
      // }
      // else{
      //     res.status(403).send({message: 'forbidden access'})
      // }
    })

    app.post('/create-payment-intent', async (req, res) => {
      const service = req.body;
      const price = service.totalPrice;
      const amount = price * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'bdt',
        payment_method_types: ['card']
      });
      // console.log('ppp',paymentIntent.client_secret);
      res.send({ clientSecret: paymentIntent.client_secret })
    });


    
    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updatedDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updatedDoc, options);
      const result2 = await userCollection.insertOne(user);
      res.send(result2);

    })

    app.put('/orders/:id', async(req, res) =>{
      const id  = req.params.id;
      
      const payment = req.body;
      const filter = {_id: ObjectId(id)};
      const options = { upsert: true };
      const updatedDoc = {
        $set:{
                id:payment.id,
                name:payment.name,
                img:payment.img,
                description:payment.description,
                price:payment.price,
                minQuantity:payment.minQuantity,
                availableQuantity:payment.availableQuantity,
                quantity:payment.quantity,
                email:payment.email, 
                paid:true,
                transactionId:payment.transactionId
          
        },
    };
      const result = await paymentCollection.insertOne(payment);
      const updatedBooking = await ordersCollection.updateOne(filter,updatedDoc,options);
      res.send(updatedBooking);
    })

    app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.send(result);
    })
    app.delete('/tools/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await toolsCollection.deleteOne(query);
      res.send(result);
    })










app.get('/', (req, res) => {
  res.send('full-stack-12-server running')
});

app.listen(port, () => {
  console.log('listening', port);
});