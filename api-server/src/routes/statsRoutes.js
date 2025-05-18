const express = require('express');
const { getLatestStats, getPriceDeviation } = require('../controllers/statsController');

const router = express.Router();

// GET /stats?coin=bitcoin
router.get('/stats', getLatestStats);

// GET /deviation?coin=bitcoin
router.get('/deviation', getPriceDeviation);

module.exports = router;
