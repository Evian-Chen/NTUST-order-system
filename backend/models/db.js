require('dotenv').config();

const mongoose = require("mongoose");

const mongo_uri = process.env.MONGO_URI + "order-system";
console.log(`mongo uri: ${mongo_uri}`);

const conn = mongoose.createConnection(mongo_uri);

conn.on("connected", () => {
  console.log(`mongo connected: ${mongo_uri}`);
});

module.exports = conn;