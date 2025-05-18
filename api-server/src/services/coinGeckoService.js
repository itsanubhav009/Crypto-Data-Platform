const axios = require('axios');

// CoinGecko API base URL
const API_BASE_URL = process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';
const API_KEY = process.env.COINGECKO_API_KEY;

/**
 * Fetches cryptocurrency data from CoinGecko API
 * @param {string[]} coins - Array of coin IDs
 * @returns {Promise<Object>} - Coin data
 */
const fetchCryptoData = async (coins) => {
  try {
    // Configure request parameters
    const params = {
      vs_currency: 'usd',
      ids: coins.join(','),
      order: 'market_cap_desc',
      per_page: 100,
      page: 1,
      sparkline: false,
      price_change_percentage: '24h',
    };
    
    // Add API key to params if using query parameter method
    // Uncomment the line below if you prefer using query parameter
    // if (API_KEY) params.x_cg_demo_api_key = API_KEY;
    
    // Configure headers with API key (recommended method)
    const headers = {};
    if (API_KEY) {
      headers['x-cg-demo-api-key'] = API_KEY;
    }

    // Using the /coins/markets endpoint which provides all the data we need in one request
    const response = await axios.get(`${API_BASE_URL}/coins/markets`, {
      params,
      headers
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching data from CoinGecko:', error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}, Data:`, error.response.data);
    }
    throw new Error(`Failed to fetch cryptocurrency data: ${error.message}`);
  }
};

module.exports = { fetchCryptoData };
