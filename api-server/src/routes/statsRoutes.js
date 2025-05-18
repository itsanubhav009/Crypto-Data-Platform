const express = require('express');
const { getLatestStats, calculateDeviation, storeCryptoStats } = require('../services/cryptoService');

const router = express.Router();

// GET /stats - Get latest stats for a specific coin
router.get('/stats', async (req, res) => {
  try {
    const { coin } = req.query;
    
    if (!coin) {
      return res.status(400).json({ error: 'Coin parameter is required' });
    }
    
    if (!['bitcoin', 'ethereum', 'matic-network'].includes(coin)) {
      return res.status(400).json({ error: 'Invalid coin. Must be bitcoin, ethereum, or matic-network' });
    }
    
    const stats = await getLatestStats(coin);
    res.json(stats);
  } catch (error) {
    console.error('Error in /stats endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /deviation - Calculate standard deviation for a specific coin
router.get('/deviation', async (req, res) => {
  try {
    const { coin } = req.query;
    
    if (!coin) {
      return res.status(400).json({ error: 'Coin parameter is required' });
    }
    
    if (!['bitcoin', 'ethereum', 'matic-network'].includes(coin)) {
      return res.status(400).json({ error: 'Invalid coin. Must be bitcoin, ethereum, or matic-network' });
    }
    
    const deviation = await calculateDeviation(coin);
    res.json(deviation);
  } catch (error) {
    console.error('Error in /deviation endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /update - Manually trigger crypto stats update (for testing)
router.post('/update', async (req, res) => {
  try {
    const result = await storeCryptoStats();
    res.json(result);
  } catch (error) {
    console.error('Error in /update endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
