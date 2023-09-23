const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const jwt = require('jsonwebtoken');
const secretkey = "secretkey";

// Middleware to parse JSON request bodies
router.use(express.json());

// Create a new order
router.post('/place-order', verifyToken,  async (req, res) => {
  const username = req.user.username; 
  try {
    const { Amount , productName, Address } = req.body; 
   
    // Create a new order
    const order = new Order({
      username: username, 
      Amount,
      productName,
      Address
    });

    // Save the order to the database
    await order.save();

    res.status(201).json(order);
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
