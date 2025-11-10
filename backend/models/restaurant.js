const mongoose = require('mongoose');
const conn = require('./db');

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    cusines: [{ 
        name: { type: String, required: true },
        price: { type: Number, required: true }
    }],
    id: { type: String, required: true }
})

const restaurant = conn.model('Restaurant', restaurantSchema, "restaurant");
module.exports = restaurant;