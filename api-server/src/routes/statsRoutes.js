const express = require('express');
const { getLatestStats, getPriceDeviation } = require('../controllers/statsController');

const router = express.Router();

/**
 * @route GET /stats
 * @desc Get the latest stats for a cryptocurrency
 * @query {string} coin - Cryptocurrency ID (bitcoin, ethereum, matic-network)
 */
router.get('/stats', async (req, res) => {
  try {
    const { coin } = req.query;
    
    if (!coin) {
      return res.status(400).json({ error: 'Coin parameter is required' });
    }
    
    const stats = await getLatestStats(coin);
    res.json(stats);
  } catch (error) {
    console.error('Stats route error:', error);
    res.status(error.message.includes('Invalid coin') ? 400 : 500)
      .json({ error: error.message });
  }
});

/**
 * @route GET /deviation
 * @desc Calculate the standard deviation of price for a cryptocurrency
 * @query {string} coin - Cryptocurrency ID (bitcoin, ethereum, matic-network)
 */
router.get('/deviation', async (req, res) => {
  try {
    const { coin } = req.query;
    
    if (!coin) {
      return res.status(400).json({ error: 'Coin parameter is required' });
    }
    
    const deviationData = await getPriceDeviation(coin);
    res.json(deviationData);
  } catch (error) {
    console.error('Deviation route error:', error);
    res.status(error.message.includes('Invalid coin') ? 400 : 500)
      .json({ error: error.message });
  }
});

module.exports = router;