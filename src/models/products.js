const mongoose = require("mongoose");
import { Schema, model } from "mongoose";

const productSchema = new mongoose.Schema({
    name: String,
    price:Number,
    category: String,
    isActive: { type: Boolean, default: true },
    restaurant: { type: String },
  });
  
  module.exports= mongoose.model('Product', productSchema);
  