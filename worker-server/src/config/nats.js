const { connect, StringCodec } = require('nats');

// NATS connection singleton
let natsConnection = null;

// String codec for encoding/decoding messages
const sc = StringCodec();

/**
 * Connect to NATS server
 * @returns {Promise<Object>} - NATS connection
 */
const connectNATS = async () => {
  try {
    const servers = process.env.NATS_URL || 'nats://localhost:4222';
    
    console.log(`Connecting to NATS at ${servers}...`);
    
    const options = {
      servers: servers,
      timeout: 30000, // Connection timeout (increased to 30 seconds)
      reconnect: true, // Enable reconnection logic
      maxReconnectAttempts: -1, // Unlimited reconnection attempts
      reconnectTimeWait: 2000, // Wait 2 seconds between reconnect attempts
      pingInterval: 30000, // 30 seconds ping interval
    };
    
    natsConnection = await connect(options);
    console.log(`Connected to NATS at ${servers}`);
    
    // Setup disconnection event handling
    natsConnection.closed()
      .then(() => {
        console.log('NATS connection closed');
      })
      .catch((err) => {
        console.error(`NATS connection closed with error: ${err.message}`);
        process.exit(1);
      });
    
    return natsConnection;
  } catch (error) {
    console.error(`NATS connection error: ${error.message}`);
    throw error;
  }
};

/**
 * Get NATS connection
 * @returns {Object} - NATS connection
 */
const getNatsConnection = () => {
  if (!natsConnection) {
    throw new Error('NATS connection not established');
  }
  return natsConnection;
};

/**
 * Publish an update event to NATS
 */
const publishUpdateEvent = async () => {
  try {
    const nc = getNatsConnection();
    
    // Create the update event message
    const updateEvent = {
      trigger: 'update',
      timestamp: new Date().toISOString()
    };
    
    // Publish the message to the 'crypto.update' subject
    nc.publish('crypto.update', sc.encode(JSON.stringify(updateEvent)));
    
    console.log('Update event published successfully');
  } catch (error) {
    console.error('Error publishing update event:', error);
    throw error;
  }
};

/**
 * Close NATS connection
 */
const closeNatsConnection = async () => {
  if (natsConnection) {
    await natsConnection.drain();
    natsConnection = null;
    console.log('NATS connection closed');
  }
};

module.exports = { 
  connectNATS, 
  getNatsConnection, 
  publishUpdateEvent, 
  closeNatsConnection
};