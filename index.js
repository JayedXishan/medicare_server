const express = require('express');
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const stripe = require("stripe")('sk_test_51PUn2s02ngvq2SnuFKBKjM1bLerWxswmVhoxokV4K7FjLriuXz8OvPp60NYefVgbqpPi5XD2m4dKKbtYEwbdiTxH00Rivb3wtM');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cff0s1a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {


    const mediCollection = client.db("MediDB").collection('medicine');
    const cartCollection = client.db("MediDB").collection('carts');
    const usercollection = client.db("MediDB").collection('users');
    const bannerCollection = client.db("MediDB").collection('banners');
    const billCollection = client.db("MediDB").collection('payments');
    const paymentCollection = client.db('MediDB').collection("payment");


    // server for the payment gateway Stripe

    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price*100)

      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ['card']
      });
    
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });



    app.get('/payment/:email',async(req, res)=>{
    
      const query = {email: req.params.email};
      const result = await paymentCollection.find(query).toArray();
      res.send(result);
    })

    app.get('/payment', async (req, res) => {
      const cursor = paymentCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    app.get('/payment/buyer/:email',async(req,res)=>{
      const email = req.params.email;
      const query = { buyer_email: email };
      const result = await paymentCollection.find(query).toArray();
      
      res.send(result);
    })
    app.get('/payment/seller/:email',async(req,res)=>{
      const email = req.params.email;
      const query = { seller_email: email };
      const result = await paymentCollection.find(query).toArray();
      
      res.send(result);
    })
    app.get('/payment/admin/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const medi = await paymentCollectionCollection.findOne(query);
      res.send(medi);
    })
    app.patch('/payment/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const update = req.body;
      const updateduser = {
        $set: {
          status: update.status
        }
      }
      const result = await paymentCollection.updateOne(filter, updateduser);
      res.send(result);
    })
    // save payment data and clear users cart
    app.post('/payment',async(req,res) => {
      const payment  = req.body;
      const paymentResult = await paymentCollection.insertOne(payment);
      res.send({paymentResult})
    })

    // JWT related Api
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res.send({ token });
    })

    // Middlewares
    const verifyToken = (req, res, next) => {
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'unauthorized access' });
      }
      const token = req.headers.authorization.split(' ')[1]
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: 'unauthorized access' });
        }
        req.decoded = decoded;
        next();
      })
    }

    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await usercollection.findOne(query);
      const isAdmin = user.role === 'admin';
      if (!isAdmin) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      next();
    }

    const verifySeller = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await usercollection.findOne(query);
      const isSeller = user.role === 'seller';
      if (!isSeller) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      next();
    }
    
    // app.get('/payment', async (req, res) => {
    //   const cursor = billCollection.find();
    //   const result = await cursor.toArray();
    //   res.send(result);
    // })
    // app.get('/payment/buyer/:email',async(req,res)=>{
    //   const email = req.params.email;
    //   const query = { buyer_email: email };
    //   const result = await billCollection.find(query).toArray();
      
    //   res.send(result);
    // })
    // app.get('/payment/seller/:email',async(req,res)=>{
    //   const email = req.params.email;
    //   const query = { seller_email: email };
    //   const result = await billCollection.find(query).toArray();
      
    //   res.send(result);
    // })
    app.get('/category', async (req, res) => {
      const cursor = mediCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    app.get("/category/:no", async (req, res) => {
      console.log(req.params.no);
      const result = await mediCollection.find({ no: req.params.no }).toArray();
      res.send(result)
    })

    app.get('/medidetails', async (req, res) => {
      const cursor = mediCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    app.get('/medidetails/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const medi = await mediCollection.findOne(query);
      res.send(medi);
    })
    app.get('/category/seller/:email',async(req,res)=>{
      const email = req.params.email;
      const query = { email: email };
      const result = await mediCollection.find(query).toArray();
      console.log('email :', result);
      res.send(result);
    })
    
    app.get('/carts',async(req,res)=>{
      const email =req.query.email;
      const query ={ email: email};
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    })

    app.get('/users',async (req, res) => {
      const result = await usercollection.find().toArray();
      res.send(result);
    })

    app.get('/users/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      const result = await usercollection.findOne(email);
      res.send(result);
    })

    app.get('/users/admin/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      const query = { email: email };
      const user = await usercollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === 'admin';
      }
      res.send({ admin });
    })

    app.patch('/users/admin/:id', verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const update = req.body;
      const updateduser = {
        $set: {
          role: update.role
        }
      }
      const result = await usercollection.updateOne(filter, updateduser);
      res.send(result);
    })

    app.get('/users/seller/:email', verifyToken, verifySeller, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      const query = { email: email };
      const user = await usercollection.findOne(query);
      let seller = false;
      if (user) {
        seller = user?.role === 'seller';
      }
      res.send({ seller });
    })

    app.get('/addbanner', async (req, res) => {
      const cursor = bannerCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    app.patch('/users/admin/:id', verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const update = req.body;
      const updateduser = {
        $set: {
          role: update.role
        }
      }
      const result = await usercollection.updateOne(filter, updateduser);
      res.send(result);
    })
    app.post('/category', async (req, res) => {
      const newMedi = req.body;
      console.log(newMedi);
      const result = await mediCollection.insertOne(newMedi);
      res.send(result);
    })
    // app.post('/payment', async (req, res) => {
    //   const newMedi = req.body;
    //   console.log(newMedi);
    //   const result = await billCollection.insertOne(newMedi);
    //   res.send(result);
    // })

    app.post('/carts',async (req,res) =>{
      const cartItem =req.body;
      const result = await cartCollection.insertOne(cartItem);
      res.send(result);
    })
    app.post('/addbanner',async (req,res) =>{
      const bannerItem =req.body;
      const result = await bannerCollection.insertOne(bannerItem);
      res.send(result);
    })
    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await usercollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null })
      }
      const result = await usercollection.insertOne(user);
      res.send(result);
    })

    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    })
    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await usercollection.deleteOne(query);
      res.send(result);
    })
    app.delete('/banners/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await bannerCollection.deleteOne(query);
      res.send(result);
    })
    


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

//run();

app.get('/', (req, res) => {
  res.send('Simple crud is running')

})

app.listen(port, () => {
  console.log(`Simple crud is running on port, ${port}`)
})