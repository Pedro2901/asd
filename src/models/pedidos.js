
const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new mongoose.Schema({
  user: { type:String},
  restaurant: { type:String },
  products: [
    {
      product: { type:String},
      quantity: Number,
      name: { type:String},
      price: { type:Number},
    },
  ],
  status: { type: String, default: 'Creado' },
  Domiciliario: { type:String },
  isActive: { type: Boolean, default: true },
  date:{type: Date,default:Date.now},
});

module.exports = mongoose.model('Order', orderSchema);
