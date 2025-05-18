const http = require('http');
const nats = require('nats');
const https = require('https');

const PORT = parseInt(process.env.PORT || "8080");

// Create a server to respond to health checks
const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Worker server running');
    return;
  }
  
  if (req.url === '/fetch-crypto') {
    // Trigger the crypto fetch and publish process
    fetchAndPublishCryptoData()
      .then(result => {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(result));
      })
      .catch(error => {
        console.error('Error:', error);
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ error: error.message }));
      });
    return;
  }
  
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Worker server listening on port ${PORT}`);
});

// Function to fetch crypto data from CoinGecko
async function fetchCryptoData() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.coingecko.com',
      path: '/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,matic-network&order=market_cap_desc&per_page=100',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      if (res.statusCode !== 200) {
        return reject(new Error(`API responded with status code ${res.statusCode}`));
      }
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          
          if (!Array.isArray(parsedData)) {
            return reject(new Error('Expected array response from API'));
          }
          
          // Format the data
          const formattedData = parsedData.map(coin => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            current_price: coin.current_price,
            market_cap: coin.market_cap,
            price_change_percentage_24h: coin.price_change_percentage_24h,
            timestamp: new Date().toISOString()
          }));
          
          resolve(formattedData);
        } catch (error) {
          reject(new Error(`Failed to parse data: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });
    
    req.setTimeout(10000, () => {
      req.abort();
      reject(new Error('Request timed out after 10 seconds'));
    });
    
    req.end();
  });
}

// Function to publish update message to NATS
async function fetchAndPublishCryptoData() {
  try {
    const NATS_URL = process.env.NATS_URL || 'nats://localhost:4222';
    console.log(`Connecting to NATS at ${NATS_URL}`);
    
    // Connect to NATS
    const nc = await nats.connect({ 
      servers: NATS_URL,
      timeout: 5000
    });
    
    console.log('Connected to NATS, sending update trigger');
    
    // Publish update trigger message
    nc.publish('crypto.trigger', JSON.stringify({ trigger: 'update' }));
    
    // Close NATS connection
    await nc.drain();
    console.log('NATS connection closed');
    
    return { 
      status: 'success', 
      message: 'Update trigger sent to crypto.trigger subject'
    };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
