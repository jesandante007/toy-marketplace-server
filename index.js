const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jtzepo9.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const toyCollection = client.db("toyDB").collection("toys");

    app.post('/toys', async(req, res) => {
      const toyInfo = req.body;
      const result = await toyCollection.insertOne(toyInfo)
      res.send(result)
    })

    app.get("/toys", async (req, res) => {
      const result = await toyCollection.find().limit(20).toArray();
      res.send(result);
    });

    app.get("/toyDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    app.get("/toys/:category", async (req, res) => {
      const cat = req.params.category;
      const category = cat.toString();
      const filter = { category: category };
      const result = await toyCollection.find(filter).toArray();
      res.send(result);
    });

    app.get('/toySearch', async(req, res) => {
      const text = req.query.text;
      const filter = {name: {$regex: text, $options: 'i'}}
      const result = await toyCollection.find(filter).toArray()
      res.send(result)
    })

    // app.delete("/toyDelete/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const filter = { _id: new ObjectId(id) };
    //   const result = await toyCollection.deleteOne(filter);
    //   res.send(result);
    // });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("toy-marketplace server is running");
});

app.listen(port, () => {
  console.log(`toy-marketplace server is running on port ${port}`);
});
