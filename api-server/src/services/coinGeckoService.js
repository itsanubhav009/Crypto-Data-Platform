const axios = require('axios');

/**
 * Get cryptocurrency data from CoinGecko API
 * @returns {Promise<Array>} - Array of cryptocurrency data
 */
const getCryptoData = async () => {
  try {
    // Define coins to fetch
    const coins = ['bitcoin', 'ethereum', 'matic-network'];
    
    // API URL for CoinGecko
    // Using the /coins/markets endpoint which gives price, market cap, and 24h change
    const url = 'https://api.coingecko.com/api/v3/coins/markets';
    
    // Make API request with parameters
    const response = await axios.get(url, {
      params: {
        vs_currency: 'usd',        // Currency to compare against
        ids: coins.join(','),      // Comma-separated list of coin IDs
        order: 'market_cap_desc',  // Order by market cap (not required but useful)
        per_page: 100,             // Results per page (max 100)
        page: 1,                   // Page number
        sparkline: false,          // No sparkline data needed
        price_change_percentage: '24h' // Include 24h price change
      },
      timeout: 10000 // 10 second timeout
    });
    
    // Map the API response to our required format
    return response.data.map(coin => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      price: coin.current_price,
      marketCap: coin.market_cap,
      change24h: coin.price_change_percentage_24h
    }));
  } catch (error) {
    console.error('Error fetching crypto data from CoinGecko:', error.message);
    throw new Error('Failed to fetch cryptocurrency data');
  }
};

module.exports = { getCryptoData };