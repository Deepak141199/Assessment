const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/product'); 
const jwt = require('jsonwebtoken');
const secretkey="secretkey";

// Middleware to parse JSON request bodies
router.use(express.json());

// add a product to the cart
router.post('/add/:productname',verifyToken,   async (req, res) => {
  const productname = req.params.productname;
  const userName = req.user.username; 
  const { quantity } = req.body;

  try {
    // Find the user's cart or create one if it doesn't exist
    let cart = await Cart.findOne({ userName });

    if (!cart) {
      cart = new Cart({ userName });
    }

    // Fetch the product from the database using Mongoose
    const product = await Product.findOne({name : productname});

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Add the product 
    cart.addItem(productname, quantity);

    // Save the updated cart
    await cart.save();

    res.json({ message: 'Product added to cart successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// get items in the user's cart
router.get('/view', verifyToken, async (req, res) => {
  const userName = req.user.username;

  try {
    // Find the user's cart
    const cart = await Cart.findOne({ userName });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Get the items in the cart
    const items = cart.getItems();

    res.json({ items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

 
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];

  if (typeof token === 'undefined') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, secretkey , (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.user = user;
    next();
  });
}

module.exports = router;


