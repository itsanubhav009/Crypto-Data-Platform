const express = require('express');
const mongoose = require('mongoose');
const nats = require('nats');
const dotenv = require('dotenv');
const { storeCryptoStats } = require('./services/cryptoService');

// Routes
const statsRoutes = require('./routes/statsRoutes');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Subscribe to NATS for crypto updates
async function setupNatsSubscription() {
  try {
    const NATS_URL = process.env.NATS_URL || 'nats://localhost:4222';
    console.log(`Connecting to NATS at ${NATS_URL}`);
    
    const nc = await nats.connect({ 
      servers: NATS_URL,
      timeout: 5000
    });
    
    console.log('Connected to NATS, subscribing to crypto.update');
    
    // Subscribe to the same subject as worker publishes to
    const subscription = nc.subscribe('crypto.update');
    
    (async () => {
      for await (const msg of subscription) {
        console.log('Received message from NATS');
        const data = JSON.parse(msg.data.toString());
        try {
          await storeCryptoStats([data]);
          console.log(`Stored data for ${data.id}`);
        } catch (error) {
          console.error(`Error storing data: ${error.message}`);
        }
      }
    })();
    
    console.log('NATS subscription set up successfully');
  } catch (error) {
    console.error('Error setting up NATS subscription:', error);
  }
}

// Set up routes
app.use('/', statsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
  setupNatsSubscription().catch(console.error);
});
