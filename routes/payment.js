const express = require('express');
const router = express.Router();
const Order = require('../models/order');
require("dotenv").config(); 
 
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const jwt = require('jsonwebtoken');
const PaymentIntentSerializer = require('../serializers');
const User = require('../models/user');
const secretkey = "secretkey";


// Middleware to parse JSON request bodies
router.use(express.json());

// Step 1: Create a Customer
router.post('/create-customer', verifyToken,async (req, res) => {
  try {
    const { email, name } = req.body;

    const customer = await stripe.customers.create({
      email,
      name,
    });

    res.json({ customerId: customer.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Step 2: Add a Card to the Customer
router.post('/add-card',verifyToken, async (req, res) => {
  try {
      const { customerId, 
      
       } = req.body; // cardToken is obtained during card creation

      const card_token='tok_visa';
      await stripe.customers.createSource(customerId,{
      source:card_token
     });
    res.status(200).send({ card:card.id});
  } catch (error) {
    console.error(error);
    res.status(400).send({ success:false ,message: error.message });
  }
});

// Step 3: Create a Payment Intent and return Payment Intent ID
router.post('/payment-intent', verifyToken,async (req, res) => {
  try {
    const { orderId, customerId, amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Amount in cents
      currency: 'INR', // Change to your currency
      description: `Payment for Order ID: ${orderId}`,
      payment_method: 'pm_card_in', 
      payment_method_types: ['card'],
      customer: customerId, // Use the customer's ID here
    });

    res.json({paymentIntentId: paymentIntent.id} );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Step 4: Handle Payment Success (same as previous code)
router.post('/payment-success', verifyToken, async (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId ,{ 
      return_url: 'http://127.0.0.1:3001/products'});

    
      if (paymentIntent.status === 'succeeded') {
        const order = await Order.findOne({ _id: orderId });
  
        if (!order) {
          return res.status(404).json({ message: 'Order not found' });
        }
  
        order.Paymentstatus = 'true';
  
        await order.save();

      res.json({ message: 'Order payment completed successfully' });
    } else {
      res.status(400).json({ message: 'Payment confirmation failed' });
    }
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
