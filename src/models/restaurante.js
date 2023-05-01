// models/Restaurant.js
const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: String,
  category: String,
  direccion:String,
  isActive: { type: Boolean, default: true },
  user:{type:String},
  domiciliosRealizados: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
