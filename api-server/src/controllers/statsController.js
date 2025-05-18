const CryptoStats = require('../models/CryptoStats');
const { fetchCryptoData } = require('../services/coinGeckoService');
const { calculateStandardDeviation } = require('../utils/mathUtils');

/**
 * Fetches and stores cryptocurrency statistics in the database
 */
const storeCryptoStats = async () => {
  try {
    const coins = ['bitcoin', 'ethereum', 'matic-network'];
    const coinsData = await fetchCryptoData(coins);
    
    const statsToSave = coinsData.map(coin => ({
      coin: coin.id,
      price: coin.current_price,
      marketCap: coin.market_cap,
      change24h: coin.price_change_percentage_24h || 0,
    }));
    
    await CryptoStats.insertMany(statsToSave);
    console.log(`Stored stats for ${statsToSave.length} coins`);
    
    return statsToSave;
  } catch (error) {
    console.error('Error storing crypto stats:', error);
    throw error;
  }
};

/**
 * Get latest stats for a specific coin
 */
const getLatestStats = async (req, res) => {
  try {
    const { coin } = req.query;
    
    if (!coin) {
      return res.status(400).json({ message: 'Coin parameter is required' });
    }
    
    if (!['bitcoin', 'ethereum', 'matic-network'].includes(coin)) {
      return res.status(400).json({ 
        message: 'Invalid coin. Supported coins: bitcoin, ethereum, matic-network' 
      });
    }
    
    // Get the latest entry for the requested coin
    const latestStats = await CryptoStats.findOne({ coin })
      .sort({ timestamp: -1 })
      .lean();
    
    if (!latestStats) {
      return res.status(404).json({ message: 'No stats found for this coin' });
    }
    
    // Format response according to the requirements
    res.json({
      price: latestStats.price,
      marketCap: latestStats.marketCap,
      "24hChange": latestStats.change24h
    });
  } catch (error) {
    console.error('Error getting latest stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Calculate standard deviation of price for the last 100 records
 */
const getPriceDeviation = async (req, res) => {
  try {
    const { coin } = req.query;
    
    if (!coin) {
      return res.status(400).json({ message: 'Coin parameter is required' });
    }
    
    if (!['bitcoin', 'ethereum', 'matic-network'].includes(coin)) {
      return res.status(400).json({ 
        message: 'Invalid coin. Supported coins: bitcoin, ethereum, matic-network' 
      });
    }
    
    // Get the last 100 records for the requested coin
    const records = await CryptoStats.find({ coin })
      .sort({ timestamp: -1 })
      .limit(100)
      .select('price')
      .lean();
    
    if (records.length === 0) {
      return res.status(404).json({ message: 'No stats found for this coin' });
    }
    
    // Extract prices and calculate standard deviation
    const prices = records.map(record => record.price);
    const deviation = calculateStandardDeviation(prices);
    
    res.json({ deviation });
  } catch (error) {
    console.error('Error calculating price deviation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  storeCryptoStats,
  getLatestStats,
  getPriceDeviation
};
