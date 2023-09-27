const express = require('express');
const mongoose = require('./db'); 
const User = require('./models/user'); 
const Product = require('./models/product'); 
const cartRoutes = require('./routes/cart');
const orderRoutes =require('./routes/Order');
const paymentRoutes=require('./routes/payment');
const fileRoutes =require('./routes/fileupload');
const jwt = require('jsonwebtoken');
const {CustomError,ValidationError} = require('./customerror');
const handleGlobalError = require('./globalerror');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { UserSerializer,ProductSerializer } = require('./serializers');
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
app.use(helmet());

// rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 6, 
});

// rate limiting middleware
app.use('/', limiter);

//routes
app.use('/cart', cartRoutes); 
app.use('/order', orderRoutes); 
app.use('/',paymentRoutes);
app.use('/',fileRoutes);


// User registration 
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

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

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign({ username }, secretkey, { expiresIn: '3000s' });

    const userProfile = await User.findOne({ username });
    const sanitizedUserProfile = {
      username: userProfile.username,
      userId: userProfile._id,

    };
  
    res.status(200).json({ message: 'Authentication successful', token,userProfile: sanitizedUserProfile  });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




// to retrieve products
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find({});
    const serializedProducts = ProductSerializer.serialize(products);
    const resultArray = serializedProducts.data.map((item) => ({
      name: item.attributes.name,
      price: item.attributes.price,
    }));

    res.json(resultArray);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.get('/products/:productId', async (req, res, next) => {
    try {
      const productId = req.params.productId;
      const product = await Product.findById(productId);
  
      if (!product) {
        throw new CustomError('Product not found'); 
      }
  
      res.json(product);
    } catch (error) {
      next(error);
    }
  });




  // Create a new product
app.post('/products', verifyToken, async (req, res,next) => {
    try {
      const { name, price } = req.body;
  
      if (!name || !price) {
        throw new ValidationError('Product name and price are required');
      }
  
      const product = new Product({ name, price });
      await product.save();
  
      res.status(201).json(product); 
    } catch (error) {
      next(error);
    }
  });

// Update an existing product
app.put('/products/:productId', verifyToken, async (req, res) => {
  try {
    const productId = req.params.productId;
    const { name, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: 'Product name and price are required' });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update the product properties
    product.name = name;
    product.price = price;

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

    const serializedUser = UserSerializer.serialize(user);
    const { attributes } = serializedUser.data;

      // Create a new object with the desired fields
      const serializedData = {
        username: attributes.username,
        id: attributes.id,
      };
  
      res.json(serializedData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



//to update the user's username by user ID
app.put('/profile/:userId', verifyToken, async (req, res) => {
  try {
    const newUsername = req.body.username;

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
    await user.save();

    res.status(200).json({ message: 'Username updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// an error handler middleware
app.use((error, req, res, next) => {
  console.error(error);

  if (error instanceof CustomError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  
});


// the global error handler
app.use(handleGlobalError);
  
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
