const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const jwt = require('jsonwebtoken');
const secretkey = "secretkey";


// Middleware to parse JSON request bodies
router.use(express.json());

// Route to create a payment intent
router.post('/payment-intent', verifyToken, async (req, res,next) => {
  try {
    const { orderId, Amount } = req.body;

    // Create a payment intent using Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      Amount: Amount * 100, 
      currency: 'INR', 
      description: `Payment for Order ID: ${orderId}`,
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Handle successful payments
router.post('/payment-success',verifyToken, async (req, res,next) => {
    try {
      const { orderId, paymentIntentId } = req.body;
  
      const order = await Order.findOne({ _id: orderId });
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      order.paymentStatus = 'true';
  
      await order.save();
  
      res.json({ message: 'Order payment status updated successfully' });
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
