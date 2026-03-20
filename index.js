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

// ✅ connection control (important fix)
let isConnected = false;

async function connectDB() {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
    console.log("MongoDB connected ✅");
  }
}

async function run() {
  try {
    const db = client.db("pet_db");

    const listingsCollection = db.collection("products");
    const petsSuppliesCollection = db.collection("pets_supplies");
    const ordersCollection = db.collection("orders");

    // Regular Listings
    app.get("/api/listings", async (req, res) => {
      try {
        await connectDB();
        const data = await listingsCollection
          .find({})
          .sort({ _id: -1 })
          .toArray();
        res.send(data);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    app.get("/api/listings/:id", async (req, res) => {
      try {
        await connectDB();
        const data = await listingsCollection.findOne({
          _id: new ObjectId(req.params.id),
        });
        res.send(data);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    app.post("/api/listings", async (req, res) => {
      try {
        await connectDB();
        const result = await listingsCollection.insertOne(req.body);
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    app.delete("/api/listings/:id", async (req, res) => {
      try {
        await connectDB();
        const result = await listingsCollection.deleteOne({
          _id: new ObjectId(req.params.id),
        });
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // My Listings
    app.get("/api/my-listings", async (req, res) => {
      try {
        await connectDB();
        const email = req.query.email;
        const data = await listingsCollection
          .find({ email })
          .sort({ _id: -1 })
          .toArray();
        res.send(data);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Update a listing
    app.put("/api/listings/:id", async (req, res) => {
      try {
        await connectDB();
        const id = req.params.id;
        const updatedData = { ...req.body };
        delete updatedData._id;

        const result = await listingsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData },
        );

        res.send({ success: true, result });
      } catch (err) {
        res.status(500).send({ success: false, message: err.message });
      }
    });

    // Pets Supplies
    app.get("/api/pets_supplies", async (req, res) => {
      try {
        await connectDB();
        const data = await petsSuppliesCollection
          .find({})
          .sort({ _id: -1 })
          .toArray();
        res.send(data);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    app.get("/api/pets_supplies/:id", async (req, res) => {
      try {
        await connectDB();
        const data = await petsSuppliesCollection.findOne({
          _id: new ObjectId(req.params.id),
        });
        res.send(data);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Orders
    app.get("/api/orders", async (req, res) => {
      try {
        await connectDB();
        const email = req.query.email;
        const data = await ordersCollection.find({ email }).toArray();
        res.send(data);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    app.post("/api/orders", async (req, res) => {
      try {
        await connectDB();
        const result = await ordersCollection.insertOne(req.body);
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    app.delete("/api/orders/:id", async (req, res) => {
      try {
        await connectDB();
        const result = await ordersCollection.deleteOne({
          _id: new ObjectId(req.params.id),
        });
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });
  } catch (err) {
    console.log(err);
  }
}

run();

app.get("/", (req, res) => {
  res.send("Server running");
});

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
