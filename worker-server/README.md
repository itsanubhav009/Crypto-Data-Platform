# Crypto Worker Server

This server runs a scheduled job every 15 minutes to trigger cryptocurrency data collection.

## Features
- Scheduled job to publish NATS events every 15 minutes
- Configurable via environment variables

## Setup
1. Install dependencies: `npm install`
2. Create `.env` file based on `.env.example`
3. Start the server: `npm start`
