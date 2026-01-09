const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection URI
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
  try {
    await client.connect();
    const db = client.db("pet_db");

    const listingsCollection = db.collection("products");
    const ordersCollection = db.collection("orders");
    const addListingCollection = db.collection("addlisting"); // ✅ new collection

    // ===============================
    // Listings Endpoints
    // ===============================

    app.get("/api/listings", async (req, res) => {
      const limit = parseInt(req.query.limit) || 20;
      const listings = await listingsCollection
        .find({})
        .sort({ _id: -1 })
        .limit(limit)
        .toArray();
      res.send(listings);
    });

    app.get("/api/listings/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const listing = await listingsCollection.findOne({
          _id: new ObjectId(id),
        });
        if (!listing)
          return res.status(404).send({ message: "Listing not found" });
        res.send(listing);
      } catch (err) {
        res.status(400).send({ message: "Invalid ID" });
      }
    });

    // ===============================
    // Add Listing Endpoints
    // ===============================

    // Add new user listing
    app.post("/api/addlisting", async (req, res) => {
      try {
        const newListing = req.body;
        if (!newListing.email)
          return res.status(400).send({ message: "User email is required" });

        const result = await addListingCollection.insertOne(newListing);
        res.send({
          message: "Listing added successfully!",
          listingId: result.insertedId,
        });
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Failed to add listing" });
      }
    });

    // Get listings for a specific user
    app.get("/api/addlisting", async (req, res) => {
      const email = req.query.email;
      if (!email)
        return res.status(400).send({ message: "Email query parameter is required" });

      try {
        const listings = await addListingCollection
          .find({ email })
          .sort({ _id: -1 })
          .toArray();
        res.send(listings);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Failed to fetch listings" });
      }
    });

    // ===============================
    // Orders Endpoints
    // ===============================

    app.post("/api/orders", async (req, res) => {
      try {
        const newOrder = req.body;
        const result = await ordersCollection.insertOne(newOrder);
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Failed to place order" });
      }
    });

    app.get("/api/orders", async (req, res) => {
      const email = req.query.email;
      if (!email)
        return res.status(400).send({ message: "Email query parameter is required" });

      try {
        const orders = await ordersCollection
          .find({ email })
          .sort({ _id: -1 })
          .toArray();
        res.send(orders);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Failed to fetch orders" });
      }
    });

    app.delete("/api/orders/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const result = await ordersCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0)
          return res.status(404).send({ message: "Order not found" });
        res.send({ message: "Order deleted successfully" });
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Failed to delete order" });
      }
    });

    console.log("Connected to MongoDB!");
  } finally {
    // Keep connection alive
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Adoption server is running");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
