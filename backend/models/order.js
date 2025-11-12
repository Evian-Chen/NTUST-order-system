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
    status: { 
      type: String, 
      enum: ['CREATED', 'PAID', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'],
      default: 'CREATED'
    },
    pickupNumber: { type: String },
    paymentMethod: { 
      type: String, 
      enum: ['cash', 'card']
    },
    paidAt: { type: Date }
  },
  { timestamps: true }
);

const order = conn.model("Order", orderSchema, "order");
module.exports = order;
