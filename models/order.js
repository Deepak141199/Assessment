const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  Amount: {
    type: Number,
    required: true,
  },
  productName: { 
    type: String,
    required: true,
  },
  Address:{
    type:String,
    required:true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

const Order = mongoose.model('Order', orderSchema,'order');

module.exports = Order;
