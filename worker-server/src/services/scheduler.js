const cron = require('node-cron');
const { publishUpdateEvent } = require('../config/nats');

/**
 * Initialize the scheduler for crypto update events
 */
const initializeScheduler = () => {
  try {
    console.log('Initializing scheduler...');
    
    // Schedule job to run every 15 minutes
    // Cron format: minute hour day month day-of-week
    const scheduledTask = cron.schedule('*/15 * * * *', async () => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] Running scheduled crypto update job`);
      
      await publishUpdateEvent();
    });
    
    console.log('Scheduler initialized successfully');
    
    // Publish an initial update event on startup
    console.log('Publishing initial update event...');
    publishUpdateEvent();
    
    return scheduledTask;
  } catch (error) {
    console.error('Error initializing scheduler:', error);
    throw error;
  }
};

module.exports = { initializeScheduler };