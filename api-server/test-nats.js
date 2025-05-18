const { connect } = require('nats');

async function testNats() {
  try {
    console.log('Connecting to NATS...');
    const nc = await connect({
      servers: 'nats://localhost:4222',
      timeout: 30000
    });
    
    console.log('Connected! Creating subscription...');
    
    // Create a subscription with explicit options
    const sub = nc.subscribe('test.subject', {
      timeout: 30000,
      max: 1, // only wait for 1 message
    });
    
    console.log('Subscription created. Publishing a test message...');
    
    // Publish a message to the same subject
    nc.publish('test.subject', new TextEncoder().encode('test message'));
    
    console.log('Message published. Waiting for message...');
    
    // Try to receive a message
    try {
      const msg = await sub.next();
      console.log('Received message:', new TextDecoder().decode(msg.data));
    } catch (err) {
      console.error('Error receiving message:', err);
    }
    
    // Clean up
    await nc.drain();
    console.log('Test complete');
  } catch (err) {
    console.error('NATS test error:', err);
  }
}

testNats();