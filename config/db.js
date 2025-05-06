const { MongoClient } = require("mongodb");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME;
const COLLECTION_NAME = process.env.COLLECTION_NAME;

async function getTransactions() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();

    const collection = client.db("test").collection(COLLECTION_NAME);
    const transactions = await collection
      .find({
        $or: [{ type: "subscription" }, { type: "exchange" }],
        status: "completed",
      })
      .toArray();
    return transactions;
  } catch (err) {
    console.error("Error during scanTransaction:", err);
  } finally {
    await client.close();
  }
}

module.exports = { getTransactions };
