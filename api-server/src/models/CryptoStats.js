const mongoose = require('mongoose');

const CryptoStatsSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    enum: ['bitcoin', 'ethereum', 'matic-network']
  },
  name: {
    type: String,
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  current_price: {
    type: Number,
    required: true
  },
  market_cap: {
    type: Number,
    required: true
  },
  price_change_percentage_24h: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CryptoStats', CryptoStatsSchema);
