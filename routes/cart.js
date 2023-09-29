const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/product'); 
const jwt = require('jsonwebtoken');
const secretkey="secretkey";
const swaggerSpec = require('../swaggerconfig');
const swaggerUi=require('swagger-ui-express');

// Middleware to parse JSON request bodies
router.use(express.json());

// Serve Swagger UI
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));



/**
 * @swagger
 * /add/{productname}:
 *   post:
 *     summary: Add a product to the cart
 *     description: Add a specified product to the user's cart with the given quantity.
 *     security:
 *       - BearerAuth: []  # Use this if the route requires authentication
 *     parameters:
 *       - in: path
 *         name: productname
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the product to add to the cart.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 description: The quantity of the product to add to the cart.
 *                 minimum: 1
 *     responses:
 *       '200':
 *         description: Product added to the cart successfully.
 *       '404':
 *         description: Product not found.
 *       '500':
 *         description: Internal Server Error.
 */

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






/**
 * @swagger
 * /view:
 *   get:
 *     summary: View items in the cart
 *     description: Retrieve the items currently in the user's cart.
 *     security:
 *       - BearerAuth: []  # Use this if the route requires authentication
 *     responses:
 *       '200':
 *         description: Items in the cart retrieved successfully.
 *       '404':
 *         description: Cart not found.
 *       '500':
 *         description: Internal Server Error.
 */
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


