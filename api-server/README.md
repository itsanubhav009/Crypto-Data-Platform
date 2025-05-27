# API Server -   Crypto Data Platform

## Overview

This API Server is a core component of the   Crypto Data Platform. It is responsible for serving cryptocurrency market statistics to clients, managing data persistence in MongoDB, and listening for data update events from the Worker Server via NATS messaging. It fetches detailed data from the CoinGecko API upon receiving update notifications.

**Deployed Base URL:** `https://api-server-1042702908830.us-central1.run.app`

## Features

*   **Cryptocurrency Statistics**: Provides RESTful APIs to get current price, market capitalization, and 24-hour change for various cryptocurrencies.
*   **Price Deviation Calculation**: Offers an endpoint to calculate the standard deviation of price for the last 100 recorded data points of a cryptocurrency.
*   **MongoDB Integration**: Uses MongoDB (via Mongoose) to store and retrieve cryptocurrency data.
*   **NATS Subscription**: Subscribes to NATS messages published by the Worker Server to know when to update cryptocurrency data.
*   **CoinGecko Integration**: Fetches detailed cryptocurrency data from the CoinGecko API.
*   **Dockerized Service**: Containerized for consistent deployment.
*   **GCP Cloud Run Deployment**: Deployed and scalable on Google Cloud Run, with CI/CD via Google Cloud Build.

## Tech Stack

*   **Framework**: Node.js, Express.js
*   **Database**: MongoDB (with Mongoose ODM)
*   **Messaging**: NATS (subscriber)
*   **HTTP Client**: (e.g., Axios, node-fetch - *verify from `server.js` or `services/` if used for CoinGecko*)
*   **Environment Management**: `dotenv`
*   **Development Utility**: `nodemon`

## Prerequisites

*   Node.js (v14 or higher, as per original README)
*   MongoDB instance (local or cloud-based like MongoDB Atlas)
*   Access to a running NATS Server
*   Git

## Setup & Installation

1.  **Clone the repository (if not already done):**
    ```bash
    git clone <your-repo-url>
    cd  --Backend-Assignment/api-server
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the `api-server` directory by copying the example:
    ```bash
    cp .env.example .env
    ```
    Update the `.env` file with your specific configurations:
    ```env
    PORT=3000 # Or any port you prefer for local development
    MONGO_URI=mongodb://localhost:27017/ _crypto_data # Your MongoDB connection string
    NATS_URL=nats://localhost:4222 # Your NATS server URL
    # Add any other variables like COINGECKO_API_KEY if used
    ```

## Running Locally

*   **Development Mode (with nodemon for auto-restarts):**
    ```bash
    npm run dev
    ```

*   **Production Mode:**
    ```bash
    npm start
    ```
The server will start on the port specified in your `.env` file (or the default in `src/app.js` or `src/server.js`).

## API Endpoints

All endpoints are relative to the deployed base URL or `http://localhost:PORT` if running locally.

### 1. Get Cryptocurrency Statistics

*   **Endpoint**: `GET /stats`
*   **Description**: Retrieves the latest stored statistics for a specified cryptocurrency.
*   **Query Parameters**:
    *   `coin` (string, required): The ID of the cryptocurrency (e.g., `bitcoin`, `ethereum`, `matic-network`).
*   **Example Request**:
    `GET /stats?coin=bitcoin`
*   **Example Success Response (200 OK)**:
    ```json
    {
      "price": 40000,         // Current price in USD (example)
      "marketCap": 800000000, // Market capitalization (example)
      "24hChange": 3.4        // Percentage change in the last 24 hours (example)
    }
    ```
*   **Example Error Response (404 Not Found - if coin data doesn't exist)**:
    ```json
    {
      "error": "Data not found for coin: <coin_id>"
    }
    ```

### 2. Get Price Standard Deviation

*   **Endpoint**: `GET /deviation`
*   **Description**: Calculates the standard deviation of price for the last 100 recorded data points of a cryptocurrency.
*   **Query Parameters**:
    *   `coin` (string, required): The ID of the cryptocurrency (e.g., `bitcoin`, `ethereum`, `matic-network`).
*   **Example Request**:
    `GET /deviation?coin=bitcoin`
*   **Example Success Response (200 OK)**:
    ```json
    {
      "coin": "bitcoin",
      "deviation": 4082.48 // Calculated standard deviation (example)
    }
    ```
*   **Example Error Response (404 Not Found - if insufficient data)**:
    ```json
    {
      "error": "Not enough data to calculate deviation for coin: <coin_id>"
    }
    ```

## NATS Integration

*   The API server connects to the NATS server specified in `NATS_URL`.
*   It subscribes to subjects (e.g., `UPDATED.*` or specific coin subjects like `UPDATED.bitcoin`) to receive messages from the Worker Server indicating that new data for a cryptocurrency might be available or needs fetching.
*   Upon receiving a message, it typically triggers a fetch from CoinGecko for the specified coin and updates the MongoDB database. *(Verify the exact NATS subject and message payload from `server.js`)*

## Deployment

*   This service is containerized using the provided `Dockerfile`.
*   It is deployed on Google Cloud Run.
*   The `cloudbuild.yaml` file defines the build and deployment steps for Google Cloud Build, enabling CI/CD.

## Source Code Structure

```
src/
├── app.js              # Main application entry point (Express setup)
├── server.js           # Core server logic, NATS subscription, CoinGecko fetching
├── controllers/        # Request handlers for API routes
├── models/             # Mongoose schemas for MongoDB (e.g., CryptoData.js)
├── routes/             # API route definitions (e.g., statsRoutes.js)
├── services/           # Business logic (e.g., coinGeckoService.js, natsService.js)
├── config/             # Configuration files (e.g., db.js for MongoDB connection)
└── utils/              # Utility functions
```
