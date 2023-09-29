const express = require('express');
const router = express.Router();
const Order = require('../models/order');
require("dotenv").config(); 
 
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const jwt = require('jsonwebtoken');
const secretkey = "secretkey";
const swaggerSpec = require('../swaggerconfig');
const swaggerUi=require('swagger-ui-express');
//const PaymentIntentSerializer = require('../serializers');
//const User = require('../models/user');



router.use(express.json());

// Serve Swagger UI
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));





// Create a Customer
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


//  Add a Card to the Customer
router.post('/add-card',verifyToken, async (req, res) => {
  try {
      const { customerId, 
      
       } = req.body; 

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







/**
 * @swagger
 * /payment-intent:
 *   post:
 *     summary: Create a Payment Intent
 *     description: Create a Payment Intent for a specified order with customer details and an amount.
 *     security:
 *       - BearerAuth: []  # Use this if the route requires authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
  *               orderId:
 *                 type: string
 *                 description: The ID of the order.
 *               customerId:
 *                 type: string
 *                 description: The ID of the customer.
 *               amount:
 *                 type: number
 *                 description: The payment amount in INR (Indian Rupees).
 *                 minimum: 0
 *     responses:
 *       '200':
 *         description: Payment Intent created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 paymentIntentId:
 *                   type: string
 *                   description: The ID of the created Payment Intent.
 *       '500':
 *         description: Internal Server Error.
 */
// Create a Payment Intent
router.post('/payment-intent', verifyToken,async (req, res) => {
  try {
    const { orderId, customerId, amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, 
      currency: 'INR', 
      description: `Payment for Order ID: ${orderId}`,
      payment_method: 'pm_card_in', 
      payment_method_types: ['card'],
      customer: customerId, 
    });

    res.json({paymentIntentId: paymentIntent.id} );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Handle Payment Success 
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
