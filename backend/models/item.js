const mongoose = require("mongoose");
const conn = require("./db");

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    type: { type: String },
    restaurantId: { type: String, required: true },
    id: { type: String, required: true, unique: true }
});

const item = conn.model('Item', itemSchema, "item");
module.exports = item;