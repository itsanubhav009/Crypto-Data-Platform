const { getNatsConnection, StringCodec: sc } = require('../config/nats');
const { storeCryptoStats } = require('../controllers/statsController');

/**
 * Set up NATS subscription for update events
 */
const setupNatsSubscription = async () => {
  try {
    const nc = getNatsConnection();
    
    // Subject to subscribe to
    const subject = 'crypto.update';
    
    // Subscribe to the update events with a queue group
    // Queue groups ensure that only one subscriber in the group receives each message
    const subscription = nc.subscribe(subject, { 
      queue: 'api-servers',  // Multiple API servers can form a queue group
      max: 0,
      noMux: true ,                // Unlimited messages (0 = unlimited)
      timeout: 300000         // 30 second timeout for each message processing
    });
    
    console.log(`Subscribed to ${subject} events`);
    
    // Process incoming messages
    (async () => {
      for await (const msg of subscription) {
        try {
          // Get the data and decode it
          const data = JSON.parse(sc.decode(msg.data));
          const timestamp = new Date().toISOString();
          
          console.log(`[${timestamp}] Received update event:`, data);
          
          if (data.trigger === 'update') {
            console.log(`[${timestamp}] Triggering crypto stats update...`);
            await storeCryptoStats();
            console.log(`[${timestamp}] Stats update completed`);
          } else {
            console.log(`[${timestamp}] Unknown trigger type: ${data.trigger}`);
          }
        } catch (error) {
          console.error('Error processing NATS message:', error);
        }
      }
      
      console.log('Subscription closed');
    })().catch(err => {
      console.error('Subscription error:', err);
    });
    
    return subscription;
  } catch (error) {
    console.error('Error setting up NATS subscription:', error);
    throw error;
  }
};

module.exports = { setupNatsSubscription };
