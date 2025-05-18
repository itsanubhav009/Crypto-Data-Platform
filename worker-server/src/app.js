const http = require('http');
const nats = require('nats');
const { fetchCryptoData } = require('./services/coinGeckoService');

const PORT = parseInt(process.env.PORT || "8080");

// Create HTTP server
const server = http.createServer((req, res) => {
  // Health check endpoint
  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Worker server running - Standard NATS version');
    return;
  }
  
  // Full endpoint to fetch and publish
  if (req.url === '/fetch-crypto') {
    console.log('Starting fetch and publish process...');
    fetchCryptoData()
      .then(data => {
        return connectToNatsAndPublish(data);
      })
      .then(result => {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(result));
      })
      .catch(error => {
        console.error('Error in fetch-crypto endpoint:', error);
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ 
          status: 'error', 
          message: error.message 
        }));
      });
    return;
  }
  
  // Handle unknown routes
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.end('Not found');
});

// Start server immediately
server.listen(PORT, () => {
  console.log(`Worker server listening on port ${PORT}`);
});

// Function to connect to NATS and publish data
async function connectToNatsAndPublish(cryptoData) {
  try {
    if (!cryptoData || !Array.isArray(cryptoData) || cryptoData.length === 0) {
      throw new Error('No crypto data to publish');
    }
    
    const NATS_URL = process.env.NATS_URL || 'nats://localhost:4222';
    console.log(`Connecting to NATS at ${NATS_URL}`);
    
    const nc = await nats.connect({ 
      servers: NATS_URL,
      timeout: 5000
    });
    
    console.log('Connected to NATS, publishing data...');
    
    let publishedCount = 0;
    
    for (const coin of cryptoData) {
      // Use standard NATS publish instead of JetStream
      nc.publish('crypto.update', JSON.stringify(coin));
      publishedCount++;
      console.log(`Published data for ${coin.id}`);
    }
    
    await nc.drain(); // Ensure all messages are sent before closing
    console.log('NATS connection closed');
    
    return { 
      status: 'success', 
      message: `Published data for ${publishedCount} cryptocurrencies`,
      coins: cryptoData.map(c => c.id)
    };
  } catch (error) {
    console.error('Error in NATS publish:', error);
    throw error;
  }
}
