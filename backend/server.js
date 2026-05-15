
const express = require('express');
const cors = require('cors');
//const dotenv = require('dotenv');
require("dotenv").config({ path: "./.env" });
const path = require('path');
const db = require("./models/db");
// const { NumberVerification } = require("./twilio");
// NumberVerification({ phoneNumber: '970595642327', code: '123456' }); // Example usage, replace with actual phone number and code
// Load environment variables
//dotenv.config();
const app = express();

db();
// Import routes
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const globalRoutes = require('./routes/globalRoutes');
const projectRoutes = require('./routes/projectRoutes');


const PORT = process.env.PORT || 3000;

// Middleware
/////////////////here edit
/*app.use(cors({
origin:'*', //Allow requests from this origin
methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allowed HTTP methods
credentials: true, // Allow credentials (cookies, authorization headers, etc.)    
allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers   


}));*/
app.use(cors({
  origin: 'https://my-website-react-and-node-js-122.onrender.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({limit: '10mb'}));


// Serve uploaded files


// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/global',globalRoutes)
app.use('/api/projects',projectRoutes)

// Error handling middleware for database operations (uncomment when using a real database)
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
