const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors(
  {
    origin: [
      "http://localhost:5173",
],
}
));
app.use(express.json());




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
    // const categoryCollection = client.db("craftDB").collection('category');

    // app.get('/craft', async (req, res) => {
    //   const cursor = craftCollection.find();
    //   const result = await cursor.toArray();
    //   res.send(result);
    // })
    // app.get('/craft/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) }
    //   const craft = await craftCollection.findOne(query);
    //   res.send(craft);
    // })

    // app.get("/mycraft/:email", async (req, res) => {
    //   console.log(req.params.email);
    //   const result = await craftCollection.find({ email: req.params.email }).toArray();
    //   res.send(result)
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
    
    // app.get('/categoryNo/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) }
    //   const craft = await categoryCollection.findOne(query);
    //   res.send(craft);
    // })

    // // taking obj from client
    // app.post('/craft', async (req, res) => {
    //   const newCraft = req.body;
    //   console.log(newCraft);
    //   const result = await craftCollection.insertOne(newCraft);
    //   res.send(result);
    // })
    app.get('/carts',async(req,res)=>{
      const result = await cartCollection.find().toArray();
      res.send(result);
    })

    app.post('/category', async (req, res) => {
      const newMedi = req.body;
      console.log(newMedi);
      const result = await mediCollection.insertOne(newMedi);
      res.send(result);
    })

    app.post('/carts',async (req,res) =>{
      const cartItem =req.body;
      const result = await cartCollection.insertOne(cartItem);
      res.send(result);
    })

    // app.delete('/craft/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) }
    //   const result = await craftCollection.deleteOne(query);
    //   res.send(result);
    // })

    // app.put('/craft/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const filter = { _id: new ObjectId(id) };
    //   const options = { upsert: true };
    //   const updatedCraft = req.body;
    //   const craft = {
    //     $set: {
    //       No: updatedCraft.No,
    //       name: updatedCraft.name,
    //       subcategory: updatedCraft.subcategory,
    //       customization: updatedCraft.customization,
    //       image: updatedCraft.image,
    //       price: updatedCraft.price,
    //       rating: updatedCraft.rating,
    //       time: updatedCraft.time,
    //       status: updatedCraft.status,
    //       description: updatedCraft.description,

    //     }
    //   }

    //   const result = await craftCollection.updateOne(filter, craft, options);
    //   res.send(result);
    // })

    // app.put('/category/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const filter = { _id: new ObjectId(id) };
    //   const options = { upsert: true };
    //   const updatedCraft = req.body;
    //   const craft = {
    //     $set: {
    //       No: updatedCraft.No,
    //       name: updatedCraft.name,
    //       subcategory: updatedCraft.subcategory,
    //       customization: updatedCraft.customization,
    //       image: updatedCraft.image,
    //       price: updatedCraft.price,
    //       rating: updatedCraft.rating,
    //       time: updatedCraft.time,
    //       status: updatedCraft.status,
    //       description: updatedCraft.description,

    //     }
    //   }

    //   const result = await categoryCollection.updateOne(filter, craft, options);
    //   res.send(result);
    // })



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