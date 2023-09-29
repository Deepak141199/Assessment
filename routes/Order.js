const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const jwt = require('jsonwebtoken');
const secretkey = "secretkey";
const swaggerSpec = require('../swaggerconfig');
const swaggerUi=require('swagger-ui-express');

router.use(express.json());

// Serve Swagger UI
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));




/**
 * @swagger
 * /place-order:
 *   post:
 *     summary: Place a new order
 *     description: Place a new order with the specified amount, product name, and delivery address.
 *     security:
 *       - BearerAuth: []  # Use this if the route requires authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Amount:
 *                 type: number
 *                 description: The order amount.
 *               productName:
 *                 type: string
 *                 description: The name of the product being ordered.
 *               Address:
 *                 type: string
 *                 description: The delivery address for the order.
 *     responses:
 *       '201':
 *         description: Order placed successfully.
 *       '500':
 *         description: Internal Server Error.
 */

router.post('/place-order', verifyToken,  async (req, res) => {
  const username = req.user.username; 
  try {
    const { Amount , productName, Address } = req.body; 
   
    //  new order
    const order = new Order({
      username: username, 
      Amount,
      productName,
      Address
    });

    // Save the order 
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
