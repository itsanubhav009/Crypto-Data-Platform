const https = require('https');

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
          console.log(`API Response (first 100 chars): ${data.substring(0, 100)}...`);
          
          const parsedData = JSON.parse(data);
          
          if (!Array.isArray(parsedData)) {
            return reject(new Error('Expected array response from API'));
          }
          
          // Format for our application
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

module.exports = { fetchCryptoData };
