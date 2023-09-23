const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  items: [
    {
      productname: {
        type: String,
        ref: 'Product', 
      },
      quantity: {
        type: Number,
        default: 0,
      },
    },
  ],
});

cartSchema.methods.addItem = function (productname, quantity) {
  // Check if the product is already in the cart
  const existingItem = this.items.find((item) => item.productname === productname);

  if (existingItem) {
    // If the product is already in the cart, update the quantity
    existingItem.quantity += quantity;
  } else {
    // If the product is not in the cart, add it as a new item
    this.items.push({ productname, quantity });
  }
};

cartSchema.methods.getItems = function () {
  return this.items;
};

const Cart = mongoose.model('Cart', cartSchema, 'cart');

module.exports = Cart;


  