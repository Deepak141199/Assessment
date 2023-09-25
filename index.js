const express = require('express');
const mongoose = require('./db'); // Import the database connection setup
const User = require('./models/user'); // Import the User model
const Product = require('./models/product'); // Import the Product model
const cartRoutes = require('./routes/cart');
const orderRoutes =require('./routes/Order');
const paymentRoutes=require('./routes/payment');
const jwt = require('jsonwebtoken');
const CustomError = require('./customerror');
const ValidationError = require('./customerror');
const handleGlobalError = require('./globalerror');
const cors = require("cors"); 
const secretkey="secretkey";

const app = express();
const port = 3001;

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

// Middleware
app.use(express.json());
app.use(cors()); 

app.use('/cart', cartRoutes); 
app.use('/order', orderRoutes); // Use the order route
app.use('/',paymentRoutes);

// User registration route
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user
    const newUser = new User({ username, password });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



// Authenticate a user
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare the provided password with the stored password
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign({ username }, secretkey, { expiresIn: '3000s' });

    // Fetch user profile data from the UserProfile model
    const userProfile = await User.findOne({ username });

    // For simplicity, we'll just send a success message and the token
    res.status(200).json({ message: 'Authentication successful', token, userProfile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




// Route to retrieve and display products
app.get('/products', async (req, res) => {
    try {
      // Retrieve all products from the database
      const products= await Product.find({});
      res.json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });



app.get('/products/:productId', async (req, res, next) => {
    try {
      const productId = req.params.productId;
  
      // Find the product by ID
      const product = await Product.findById(productId);
  
      if (!product) {
        throw new CustomError('Product not found'); // Use the CustomError class
      }
  
      res.json(product);
    } catch (error) {
      next(error);
    }
  });

// Use the global error handler as the last error-handling middleware
  app.use(handleGlobalError);
  



  // Create a new product (Secured with JWT authentication)
app.post('/products', verifyToken, async (req, res,next) => {
    try {
      // Get the product data from the request body
      const { name, price } = req.body;
  
      // Validate the product data
      if (!name || !price) {
        throw new ValidationError('Product name and price are required');
      }
  
      // Create and save the product to the database
      const product = new Product({ name, price });
      await product.save();
  
      res.status(201).json(product); // Respond with the created product
    } catch (error) {
      next(error);
    }
  });
  // Use the global error handler as the last error-handling middleware
app.use(handleGlobalError);

// Update an existing product (Secured with JWT authentication)
app.put('/products/:productId', verifyToken, async (req, res) => {
  try {
    const productId = req.params.productId;
    const { name, price } = req.body;

    // Validate the product data
    if (!name || !price) {
      return res.status(400).json({ message: 'Product name and price are required' });
    }

    // Find the product by ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update the product properties
    product.name = name;
    product.price = price;

    // Save the updated product to the database
    await product.save();

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




app.get('/profile',verifyToken, async (req, res) => {
  try {

    // Find the user by username
    const user = await User.findOne({ username:req.user.username });

    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Respond with the user's profile data
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



// Route to update the user's username by user ID
app.put('/profile/:userId', verifyToken, async (req, res) => {
  try {
    // Get the new username from the request body
    const newUsername = req.body.username;

    // Check if a new username was provided
    if (!newUsername) {
      return res.status(400).json({ message: 'New username is required' });
    }

    // Find the user by the provided user ID
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the username
    user.username = newUsername;

    // Save the updated user data
    await user.save();

    res.status(200).json({ message: 'Username updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Define an error handler middleware
app.use((error, req, res, next) => {
  console.error(error);

  if (error instanceof CustomError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  
});
// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
