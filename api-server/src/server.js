require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { connectNATS, closeNatsConnection } = require('./config/nats');
const { setupNatsSubscription } = require('./services/natsSubscriber');
const { storeCryptoStats } = require('./controllers/statsController');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3000;
let server = null;
let natsSubscription = null;

/**
 * Start the server and its components
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Connect to NATS
    await connectNATS();
    
    // Set up NATS subscription
    natsSubscription = await setupNatsSubscription();
    
    // Initialize the database with initial data
    console.log('Fetching initial cryptocurrency data...');
    await storeCryptoStats();
    
    // Start Express server
    server = app.listen(PORT, () => {
      console.log(`API Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    await gracefulShutdown();
    process.exit(1);
  }
};

/**
 * Gracefully shut down the server
 */
const gracefulShutdown = async () => {
  console.log('Shutting down...');
  
  // Close HTTP server
  if (server) {
    console.log('Closing HTTP server...');
    server.close();
    server = null;
  }
  
  // Close NATS connection
  try {
    console.log('Closing NATS connection...');
    await closeNatsConnection();
  } catch (error) {
    console.error('Error closing NATS connection:', error);
  }
  
  // Close MongoDB connection
  try {
    console.log('Closing MongoDB connection...');
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
  
  console.log('Shutdown complete');
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Starting graceful shutdown...');
  await gracefulShutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Starting graceful shutdown...');
  await gracefulShutdown();
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});

// Start the server
startServer();
