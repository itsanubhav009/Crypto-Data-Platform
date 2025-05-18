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
      timeout: 20000, // Connection timeout
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
 * Publish a message to a NATS subject
 * @param {string} subject - Subject to publish to
 * @param {Object} data - Data to publish
 */
const publishMessage = (subject, data) => {
  try {
    const nc = getNatsConnection();
    const jsonData = (typeof data === 'string') ? data : JSON.stringify(data);
    nc.publish(subject, sc.encode(jsonData));
    console.log(`Published message to ${subject}`);
  } catch (error) {
    console.error(`Error publishing to ${subject}:`, error);
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
  publishMessage, 
  closeNatsConnection,
  StringCodec: sc
};
