require('dotenv').config();
const { connectNATS, closeNatsConnection } = require('./config/nats');
const { initializeScheduler } = require('./services/scheduler');

// Scheduler instance
let scheduler = null;

/**
 * Start the worker server
 */
const startWorker = async () => {
  try {
    console.log('Starting worker server...');
    
    // Connect to NATS
    await connectNATS();
    
    // Initialize the scheduler
    scheduler = initializeScheduler();
    
    console.log('Worker server started successfully');
  } catch (error) {
    console.error('Failed to start worker server:', error);
    await gracefulShutdown();
    process.exit(1);
  }
};

/**
 * Gracefully shut down the worker server
 */
const gracefulShutdown = async () => {
  console.log('Shutting down worker server...');
  
  // Stop the scheduler
  if (scheduler) {
    scheduler.stop();
    console.log('Scheduler stopped');
  }
  
  // Close NATS connection
  try {
    await closeNatsConnection();
  } catch (error) {
    console.error('Error closing NATS connection:', error);
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
  // Application specific logging
});

// Start the worker server
startWorker();