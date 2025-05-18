const cron = require('node-cron');
const { publishMessage } = require('../config/nats');

/**
 * Start the scheduler to publish events at regular intervals
 * @param {number} intervalMinutes - Interval in minutes
 */
const startScheduler = (intervalMinutes = 15) => {
  // Validate interval
  if (intervalMinutes < 1) {
    console.error('Invalid interval. Using default of 15 minutes.');
    intervalMinutes = 15;
  }
  
  // Create cron expression for the given interval (e.g., "*/15 * * * *" for every 15 minutes)
  const cronExpression = `*/${intervalMinutes} * * * *`;
  
  console.log(`Scheduling job to run every ${intervalMinutes} minutes (${cronExpression})`);
  
  // Schedule the job
  const job = cron.schedule(cronExpression, async () => {
    try {
      await publishUpdateEvent();
    } catch (error) {
      console.error('Error publishing update event:', error);
    }
  });
  
  // Run the job immediately on startup
  publishUpdateEvent().catch(error => {
    console.error('Error publishing initial update event:', error);
  });
  
  return job;
};

/**
 * Publish an update event to NATS
 */
const publishUpdateEvent = async () => {
  try {
    const subject = 'crypto.update';
    const timestamp = new Date().toISOString();
    
    const message = {
      trigger: 'update',
      timestamp: timestamp,
      source: 'worker-scheduler'
    };
    
    console.log(`[${timestamp}] Publishing update event to ${subject}`);
    
    // Publish the message to the crypto.update subject
    publishMessage(subject, message);
    
    console.log(`[${timestamp}] Update event published successfully`);
    return true;
  } catch (error) {
    console.error(`Error publishing update event: ${error.message}`);
    throw error;
  }
};

module.exports = { startScheduler, publishUpdateEvent };
