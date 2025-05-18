# Crypto API Server

This server provides cryptocurrency statistics through REST APIs and stores data in MongoDB.

## Features
- Fetch and store cryptocurrency stats (Bitcoin, Ethereum, Matic)
- API endpoint to retrieve latest stats for a specific coin
- API endpoint to calculate price standard deviation
- NATS subscription for real-time updates

## Setup
1. Install dependencies: `npm install`
2. Create `.env` file based on `.env.example`
3. Start the server: `npm start`

## API Endpoints
- GET `/stats?coin=bitcoin` - Get latest stats for a coin
- GET `/deviation?coin=bitcoin` - Get standard deviation of price for last 100 records
