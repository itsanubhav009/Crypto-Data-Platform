# Worker Server - KoinX Crypto Data Platform

## Overview

This Worker Server is a background processing component of the KoinX Crypto Data Platform. Its primary responsibility is to periodically trigger data refresh cycles for various cryptocurrencies. It achieves this by publishing messages to a NATS server, signaling the API Server to fetch and update its data from external sources like CoinGecko.

This service is designed to be triggered by a scheduler (like GCP Cloud Scheduler) but also provides a manual trigger endpoint for development and testing.

**Deployed Trigger URL (Manual):** `https://worker-server-1042702908830.us-central1.run.app/fetch-crypto`

## Features

*   **Scheduled Task Execution**: Designed to be run periodically (e.g., every 15 minutes via GCP Cloud Scheduler).
*   **NATS Messaging Integration**: Publishes messages (update triggers) to specified NATS subjects.
*   **Manual Trigger**: Provides an HTTP endpoint to manually initiate the data update trigger process.
*   **Lightweight & Focused**: Dedicated to the task of triggering updates, decoupling it from the data fetching and storage logic in the API server.
*   **Dockerized Service**: Containerized for consistent deployment.
*   **GCP Cloud Run Deployment**: Deployed and scalable on Google Cloud Run.

## Tech Stack

*   **Runtime**: Node.js
*   **Messaging**: NATS (publisher)
*   **HTTP Framework**: (Likely Express.js or built-in `http` module for the manual trigger endpoint - *verify from `src/app.js`*)
*   **Environment Management**: `dotenv` (if used, check for `.env.example`)

## Prerequisites

*   Node.js (v18 or higher, as per original README)
*   Access to a running NATS Server
*   Git

## Setup & Installation

1.  **Clone the repository (if not already done):**
    ```bash
    git clone <your-repo-url>
    cd KoinX--Backend-Assignment/worker-server
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the `worker-server` directory if an `.env.example` exists:
    ```bash
    cp .env.example .env
    ```
    Update the `.env` file with your specific configurations:
    ```env
    NATS_URL=nats://localhost:4222 # Your NATS server URL
    PORT=3001 # Port for the manual trigger HTTP server (if applicable)
    # Define coins to trigger updates for, e.g., SUPPORTED_COINS=bitcoin,ethereum,matic-network
    ```
    *(Note: The list of coins to trigger might be hardcoded or configurable via environment variables. Check `src/app.js`)*

## Running Locally

*   **Start the server:**
    ```bash
    npm start
    ```
    If the worker has an HTTP server for manual triggers, it will start listening on the configured port. Otherwise, it might be a script that runs once or needs a specific invocation if not purely event-driven by an external scheduler locally.

## Operation

### Scheduled Triggers (Production)
*   In a production environment (GCP), Google Cloud Scheduler is configured to call an HTTP endpoint on this worker (e.g., `/fetch-crypto` or a specific scheduler endpoint) at regular intervals (e.g., every 15 minutes).

### Manual Trigger (Development/Testing)
*   An HTTP GET request to the `/fetch-crypto` endpoint (or the configured manual trigger endpoint) will initiate the process.
    *   **URL**: `http://localhost:PORT/fetch-crypto` (locally) or the deployed URL.

### NATS Publishing
*   When triggered (either by scheduler or manually), the Worker Server connects to the NATS instance.
*   It then publishes messages to predefined NATS subjects. For example, it might publish to:
    *   `TRIGGER_UPDATE.bitcoin`
    *   `TRIGGER_UPDATE.ethereum`
    *   `TRIGGER_UPDATE.matic-network`
*   The API Server subscribes to these (or wildcard `TRIGGER_UPDATE.*`) subjects and initiates data fetching from CoinGecko upon receiving these messages.
    *(Verify the exact NATS subject pattern and message payload from `src/app.js`)*

## Deployment

*   This service is containerized using the provided `Dockerfile`.
*   It is deployed on Google Cloud Run.
*   Google Cloud Scheduler is used to invoke its trigger endpoint periodically in the deployed environment.

## Source Code Structure

```
src/
├── app.js              # Main application logic, NATS publishing, HTTP endpoint for manual trigger
├── config/             # Configuration files (e.g., NATS connection details)
└── services/           # (Potentially NATS publishing service or scheduling logic)
```
