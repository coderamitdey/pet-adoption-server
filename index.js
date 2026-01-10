const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://petdbUser:dQUvrnaNIK9O5Wmq@cluster0.zvnbuvn.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  await client.connect();
  const db = client.db("pet_db");
  const listingsCollection = db.collection("products");
  const ordersCollection = db.collection("orders");

  app.get("/api/listings", async (req, res) => {
    const data = await listingsCollection.find({}).sort({ _id: -1 }).toArray();
    res.send(data);
  });

  app.get("/api/my-listings", async (req, res) => {
    const email = req.query.email;
    const data = await listingsCollection
      .find({ email })
      .sort({ _id: -1 })
      .toArray();
    res.send(data);
  });

  app.get("/api/listings/:id", async (req, res) => {
    const data = await listingsCollection.findOne({
      _id: new ObjectId(req.params.id),
    });
    res.send(data);
  });

  app.post("/api/listings", async (req, res) => {
    const newListing = req.body;
    if (!newListing.email)
      return res.status(400).send({ message: "Email required" });
    const result = await listingsCollection.insertOne(newListing);
    res.send(result);
  });

  app.delete("/api/listings/:id", async (req, res) => {
    const result = await listingsCollection.deleteOne({
      _id: new ObjectId(req.params.id),
    });
    res.send(result);
  });

  app.post("/api/orders", async (req, res) => {
    const result = await ordersCollection.insertOne(req.body);
    res.send(result);
  });

  app.get("/api/orders", async (req, res) => {
    const email = req.query.email;
    const data = await ordersCollection
      .find({ email })
      .sort({ _id: -1 })
      .toArray();
    res.send(data);
  });

  app.delete("/api/orders/:id", async (req, res) => {
    const id = req.params.id;
    try {
      const result = await ordersCollection.deleteOne({
        _id: new ObjectId(id),
      });
      if (result.deletedCount === 0)
        return res.status(404).send({ message: "Order not found" });
      res.send({ message: "Order deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: "Failed to delete order" });
    }
  });
}

run();

app.get("/", (req, res) => {
  res.send("Server running");
});

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
