const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const app = express();

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// connect to database

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2yruo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// console.log(uri);

async function run() {
  try {
    await client.connect();
    // create a database
    const database = client.db('mrittika');
    const productsCollection = database.collection('allProducts');
    const usersCollection = database.collection('users');
    const ordersCollection = database.collection('orders');
    const reviewsCollection = database.collection('reviews');

    // add a product to database

    app.post('/products', async (req, res) => {
      const product = req.body;
      // console.log(product);
      const result = await productsCollection.insertOne(product);
      res.json(result);
    });

    // add orders
    app.post('/orders', async (req, res) => {
      const order = req.body;
      // console.log(order);
      const result = await ordersCollection.insertOne(order);
      res.json(result);
    });
    // get orders
    app.get('/orders', async (req, res) => {
      const result = await ordersCollection.find({}).toArray();
      // console.log(result);
      res.json(result);
    });
    // add review
    app.post('/reviews', async (req, res) => {
      const review = req.body;
      // console.log(review);
      const result = await reviewsCollection.insertOne(review);

      res.json(result);
    });
    // get review
    app.get('/reviews', async (req, res) => {
      const result = await reviewsCollection.find({}).toArray();
      res.json(result);
    });

    // get products from database
    app.get('/products', async (req, res) => {
      const result = await productsCollection.find({}).toArray();
      res.send(result);
    });
    // get products for home page
    app.get('/homeProducts', async (req, res) => {
      const limit = parseInt(req.query.limit);
      const cursor = productsCollection.find({});
      const result = await cursor.limit(limit).toArray();
      // console.log(result);
      res.send(result);
    });

    // find a product for place order
    app.get('/products/:productId', async (req, res) => {
      const id = req.params.productId;

      const query = { _id: ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.json(result);
    });

    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });
    // add new user if not exists id users collection using upsert
    app.put('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    // Remove a product from database
    app.delete('/products/:productId', async (req, res) => {
      const productId = req.params.productId;
      const query = { _id: ObjectId(productId) };
      const result = await productsCollection.deleteOne(query);
      res.json(result);
    });
    // Remove a order from database
    app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });
    // check admin
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === 'admin') {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    // make admin
    app.put('/users/admin', async (req, res) => {
      const user = req.body;
      // console.log('admin:', user);
      const filter = { email: user.email };
      const updateDoc = { $set: { role: 'admin' } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
    // change status
    app.post('/orders/orderId', async (req, res) => {
      // console.log(req.body);
      const order = req.body;
      const { _id, status, ...rest } = order;
      // console.log({ ...rest, status: true });
      const updateOrder = { ...rest, status: true };

      // const query = { _id: ObjectId(req.body.id) };
      // const replacement = { ...rest, status: true };
      // const option = { upsert: true };
      // const updateDoc = { $set: { status: 'true' } };
      const result = await ordersCollection.updateOne(
        { _id: ObjectId(order._id) },
        { $set: updateOrder }
      );
      res.json(result);
    });

    app.get('/myOrders', async (req, res) => {
      const email = req.query.email;
      // console.log(email);
      const query = { email: email };
      const cursor = ordersCollection.find(query);
      const result = await cursor.toArray();
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello Mrittika!');
});

app.listen(port, () => {
  console.log(`Mrittika Server app listening PORT:${port}`);
});
