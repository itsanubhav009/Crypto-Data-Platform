# Cryptocurrency API Server

This server provides APIs for cryptocurrency statistics and listens for update events from the worker server.

## Features

- Fetch and store cryptocurrency data from CoinGecko
- Provide latest statistics for cryptocurrencies
- Calculate standard deviation of cryptocurrency prices
- Subscribe to update events via NATS

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local instance or Atlas)
- NATS Server

### Installation

1. Clone the repository
2. Navigate to the api-server directory
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

5. Update the `.env` file with your configuration

### Running the Server

Start the server in development mode:

```bash
npm run dev
```

Or in production mode:

```bash
npm start
```

## API Endpoints

### GET /stats

Get the latest statistics for a cryptocurrency.

**Query Parameters:**
- `coin`: The cryptocurrency ID (bitcoin, ethereum, or matic-network)

**Example Response:**
```json
{
  "price": 40000,
  "marketCap": 800000000,
  "24hChange": 3.4
}
```

### GET /deviation

Calculate the standard deviation of price for the last 100 records of a cryptocurrency.

**Query Parameters:**
- `coin`: The cryptocurrency ID (bitcoin, ethereum, or matic-network)

**Example Response:**
```json
{
  "deviation": 4082.48
}
```