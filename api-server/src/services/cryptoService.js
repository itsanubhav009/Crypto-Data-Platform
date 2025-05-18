const https = require('https');
const CryptoStats = require('../models/CryptoStats');

// Function to fetch and store crypto stats
async function storeCryptoStats(cryptoData = null) {
  try {
    // If data is provided, use it directly, otherwise fetch from CoinGecko
    let data = cryptoData;
    
    if (!data) {
      data = await fetchCryptoData();
    }
    
    // Store each crypto in MongoDB
    for (const coin of data) {
      await CryptoStats.create({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        current_price: coin.current_price,
        market_cap: coin.market_cap,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        timestamp: coin.timestamp || new Date()
      });
      console.log(`Stored stats for ${coin.id}`);
    }
    
    return { success: true, count: data.length };
  } catch (error) {
    console.error('Error in storeCryptoStats:', error);
    throw error;
  }
}

// Function to fetch cryptocurrency data from CoinGecko
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

// Get latest stats for a specific coin
async function getLatestStats(coin) {
  const stats = await CryptoStats.findOne(
    { id: coin },
    { _id: 0, current_price: 1, market_cap: 1, price_change_percentage_24h: 1 }
  ).sort({ timestamp: -1 });
  
  if (!stats) {
    throw new Error(`No data found for ${coin}`);
  }
  
  return {
    price: stats.current_price,
    marketCap: stats.market_cap,
    "24hChange": stats.price_change_percentage_24h
  };
}

// Calculate price standard deviation for a specific coin
async function calculateDeviation(coin) {
  const stats = await CryptoStats.find(
    { id: coin },
    { current_price: 1 }
  ).sort({ timestamp: -1 }).limit(100);
  
  if (stats.length === 0) {
    throw new Error(`No data found for ${coin}`);
  }
  
  const prices = stats.map(stat => stat.current_price);
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const variance = prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prices.length;
  const deviation = Math.sqrt(variance);
  
  return { deviation: parseFloat(deviation.toFixed(2)) };
}

module.exports = { 
  storeCryptoStats,
  getLatestStats,
  calculateDeviation
};
