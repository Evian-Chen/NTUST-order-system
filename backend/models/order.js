const conn = require("./db");
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    items: [
      {
        itemId: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
        itemTotalPrice: { type: Number, required: true, default: 0 }
      },
    ],
    totalPrice: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
    // status: { type: String, enum: ['pending', 'completed', 'canceled'], default: 'pending' },
    // customerId: { type: String, required: true }
  },
  { timestamps: true }
);

const order = conn.model("Order", orderSchema, "order");
module.exports = order;
