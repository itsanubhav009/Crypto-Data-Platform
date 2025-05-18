require('dotenv').config();
const { connectNATS, closeNatsConnection } = require('./config/nats');
const { startScheduler } = require('./services/scheduler');

const PORT = process.env.PORT || 3001;
const JOB_INTERVAL_MINUTES = parseInt(process.env.JOB_INTERVAL_MINUTES) || 15;

// Global scheduler reference
let scheduler = null;

/**
 * Start the server and its components
 */
const startServer = async () => {
  try {
    console.log('Starting Crypto Worker Server...');
    
    // Connect to NATS
    await connectNATS();
    
    // Start the scheduler
    scheduler = startScheduler(JOB_INTERVAL_MINUTES);
    console.log(`Scheduler started with interval: ${JOB_INTERVAL_MINUTES} minutes`);
    
    console.log(`Worker Server running on port ${PORT}`);
  } catch (error) {
    console.error('Failed to start worker server:', error);
    await gracefulShutdown();
    process.exit(1);
  }
};

/**
 * Gracefully shut down the server
 */
const gracefulShutdown = async () => {
  console.log('Shutting down...');
  
  // Stop the scheduler if it's running
  if (scheduler) {
    console.log('Stopping scheduler...');
    scheduler.stop();
    scheduler = null;
  }
  
  // Close NATS connection
  try {
    console.log('Closing NATS connection...');
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
  // Application specific logging, throwing an error, or other logic here
});

// Start the server
startServer();
