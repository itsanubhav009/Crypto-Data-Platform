const CryptoStats = require('../models/CryptoStats');
const { getCryptoData } = require('../services/coinGeckoService');
const { calculateStandardDeviation } = require('../utils/mathUtils');

/**
 * Store cryptocurrency statistics in the database
 */
const storeCryptoStats = async () => {
  try {
    console.log('Fetching cryptocurrency data from CoinGecko...');
    // Change from fetchCryptoData to getCryptoData to match the exported function name
    const cryptoData = await getCryptoData();
    
    // Create array of documents to insert
    const documents = cryptoData.map(coin => ({
      coin: coin.id,
      price: coin.price,
      marketCap: coin.marketCap,
      change24h: coin.change24h,
      timestamp: new Date()
    }));
    
    // Insert documents into database
    await CryptoStats.insertMany(documents);
    
    console.log(`Successfully stored data for ${documents.length} cryptocurrencies`);
    return { success: true, count: documents.length };
  } catch (error) {
    console.error('Error storing crypto stats:', error);
    throw error;
  }
};

/**
 * Get the latest stats for a specific cryptocurrency
 * @param {string} coin - Cryptocurrency ID (bitcoin, ethereum, matic-network)
 */
const getLatestStats = async (coin) => {
  try {
    // Validate coin parameter
    if (!['bitcoin', 'ethereum', 'matic-network'].includes(coin)) {
      throw new Error('Invalid coin. Must be bitcoin, ethereum, or matic-network');
    }
    
    // Get the latest record for the specified coin
    const latestStats = await CryptoStats.findOne({ coin })
      .sort({ timestamp: -1 })
      .select('price marketCap change24h -_id');
    
    if (!latestStats) {
      throw new Error(`No data found for ${coin}`);
    }
    
    return {
      price: latestStats.price,
      marketCap: latestStats.marketCap,
      '24hChange': latestStats.change24h
    };
  } catch (error) {
    console.error(`Error getting latest stats for ${coin}:`, error);
    throw error;
  }
};

/**
 * Calculate the standard deviation of price for a specific cryptocurrency
 * @param {string} coin - Cryptocurrency ID (bitcoin, ethereum, matic-network)
 */
const getPriceDeviation = async (coin) => {
  try {
    // Validate coin parameter
    if (!['bitcoin', 'ethereum', 'matic-network'].includes(coin)) {
      throw new Error('Invalid coin. Must be bitcoin, ethereum, or matic-network');
    }
    
    // Get the last 100 records for the specified coin
    const records = await CryptoStats.find({ coin })
      .sort({ timestamp: -1 })
      .limit(100)
      .select('price -_id');
    
    if (records.length === 0) {
      throw new Error(`No data found for ${coin}`);
    }
    
    // Extract prices from records
    const prices = records.map(record => record.price);
    
    // Calculate standard deviation
    const deviation = calculateStandardDeviation(prices);
    
    return { deviation };
  } catch (error) {
    console.error(`Error calculating deviation for ${coin}:`, error);
    throw error;
  }
};

module.exports = {
  storeCryptoStats,
  getLatestStats,
  getPriceDeviation
};