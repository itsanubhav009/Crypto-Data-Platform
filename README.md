# Crypto Data Platform

## Overview

The Crypto Data Platform is a backend system designed for fetching, storing, processing, and serving cryptocurrency market data. This project, developed as a backend assignment for  , leverages a microservices architecture with distinct API and Worker servers. These services communicate asynchronously via NATS messaging. The platform is containerized using Docker and deployed on Google Cloud Platform (GCP), utilizing Cloud Run for services and Cloud Scheduler for periodic tasks.

**Core Functionality:**
*   The **API Server** exposes endpoints to retrieve processed cryptocurrency statistics (e.g., current price, market cap, price deviation) and listens for data update events.
*   The **Worker Server**, triggered periodically by Cloud Scheduler, fetches fresh data from external sources (CoinGecko), processes it, and publishes update events through NATS for the API server to consume and store in MongoDB.

**Deployed Endpoints (Examples from Project Description/READMEs):**
*   **API Server (Get Stats)**: `https://api-server-1042702908830.us-central1.run.app/stats?coin={cryptocurrency_name}`
    *   Supported coins (example): `bitcoin`, `ethereum`, `matic-network`
*   **API Server (Get Price Deviation)**: `https://api-server-1042702908830.us-central1.run.app/deviation?coin={cryptocurrency_name}`
*   **Worker Server (Manual Fetch Trigger - for testing/dev)**: `https://worker-server-1042702908830.us-central1.run.app/fetch-crypto` (This URL might be for triggering the worker's fetch process directly)

## Architecture

The platform is composed of the following key components:

1.  **API Server (`api-server/`)**:
    *   A Node.js application built with Express.js.
    *   **Responsibilities**:
        *   Serves client requests for cryptocurrency statistics via HTTP GET endpoints (e.g., `/stats`, `/deviation`).
        *   Subscribes to NATS messages (e.g., `UPDATED.{coin}`) published by the Worker Server.
        *   Upon receiving update messages, it fetches detailed data from CoinGecko (or uses data from the message) and stores/updates it in the MongoDB database.
        *   Queries MongoDB to serve data to clients.
    *   Deployed as a Docker container on GCP Cloud Run.

2.  **Worker Server (`worker-server/`)**:
    *   A Node.js application.
    *   **Responsibilities**:
        *   Triggered by GCP Cloud Scheduler (e.g., every 15 minutes) to initiate data fetching.
        *   Can also be triggered manually via an HTTP endpoint for testing/development.
        *   When triggered, it publishes messages to NATS subjects (e.g., `TRIGGER_UPDATE.{coin}`) to signal that a particular cryptocurrency's data needs to be refreshed. (Alternatively, it might fetch data directly and publish the *results*). The `api-server/README.md` suggests the API server fetches from CoinGecko upon NATS update, so the worker likely sends a simple "update needed" trigger.
    *   Deployed as a Docker container on GCP Cloud Run.

3.  **NATS Messaging Server (`nats-server-v2.9.21-linux-amd64/`)**:
    *   Provides the asynchronous communication backbone between the API Server and Worker Server.
    *   The Worker Server publishes messages to specific NATS subjects.
    *   The API Server subscribes to these subjects to receive notifications and act accordingly.

4.  **MongoDB Database**:
    *   Used by the API Server to store and retrieve cryptocurrency data (prices, market cap, historical data for deviation calculation).
    *   (Specify if it's a self-hosted instance, MongoDB Atlas, or GCP's Datastore/Firestore if that was used instead of Mongo).

5.  **Google Cloud Platform (GCP)**:
    *   **Cloud Run**: Hosts the containerized API and Worker servers.
    *   **Cloud Scheduler**: Triggers the Worker Server periodically.
    *   **Cloud Build**: Used for CI/CD, building Docker images and deploying to Cloud Run (inferred from `cloudbuild.yaml`).

![System Architecture Diagram (Conceptual - Create and embed an actual diagram for better clarity)](https://via.placeholder.com/800x400.png?text=Conceptual+Architecture+Diagram)
*(Diagram Flow: GCP Cloud Scheduler -> Worker Server -> NATS -> API Server -> MongoDB. Client -> API Server -> MongoDB)*

## Features

*   **Dynamic Cryptocurrency Statistics**: Provides endpoints for current price, market cap, and price standard deviation.
*   **Scheduled Data Updates**: Worker automatically triggers data refresh cycles every 15 minutes.
*   **Asynchronous Microservices**: Decoupled services using NATS for improved scalability and resilience.
*   **Persistent Storage**: Utilizes MongoDB for storing cryptocurrency market data.
*   **Containerized & Cloud-Native**: Dockerized applications deployed on GCP Cloud Run.
*   **External Data Integration**: Fetches data from the CoinGecko API.

## Tech Stack

*   **Backend**: Node.js, Express.js (API Server)
*   **Database**: MongoDB (with Mongoose ODM for the API Server)
*   **Messaging**: NATS (v2.9.21)
*   **Deployment**: Google Cloud Platform (GCP)
    *   Cloud Run (for services)
    *   Cloud Scheduler (for cron jobs)
    *   Cloud Build (for CI/CD)
*   **Containerization**: Docker
*   **Utilities**: `dotenv`, `nodemon`

## Project Structure

```
 --Backend-Assignment/
├── api-server/                 # Handles client requests and MongoDB interactions
│   ├── src/
│   │   ├── app.js              # Main application entry point (Express setup)
│   │   ├── server.js           # Core server logic, NATS subscription, CoinGecko fetching
│   │   ├── controllers/        # Request handlers for API routes
│   │   ├── models/             # Mongoose schemas for MongoDB
│   │   ├── routes/             # API route definitions
│   │   ├── services/           # Business logic (e.g., talking to CoinGecko)
│   │   ├── config/             # Configuration files (e.g., MongoDB, NATS connection)
│   │   └── utils/              # Utility functions
│   ├── Dockerfile
│   ├── package.json
│   ├── README.md               # Service-specific README
│   ├── .env.example
│   └── cloudbuild.yaml
├── worker-server/              # Triggers data update events via NATS
│   ├── src/
│   │   ├── app.js              # Main application logic, NATS publishing
│   │   ├── config/             # Configuration files
│   │   └── services/           # (Potentially NATS publishing service)
│   ├── Dockerfile
│   ├── package.json
│   ├── README.md               # Service-specific README
│   └── .env.example
├── nats-server-v2.9.21-linux-amd64/ # NATS server binaries
└── nats-server.tar.gz          # NATS server archive
```

## Setup and Deployment

This project involves multiple services. Refer to the individual README files within each service directory for detailed setup and local development instructions:

*   **API Server**: [`api-server/README.md`](./api-server/README.md)
*   **Worker Server**: [`worker-server/README.md`](./worker-server/README.md)

**General Prerequisites:**
*   Node.js (v14+ for API Server, v18+ for Worker, or as specified in their READMEs)
*   Docker
*   Access to a MongoDB instance (local or cloud-based like MongoDB Atlas)
*   Access to a NATS server (can be run locally using the provided binaries or a Docker image)
*   Google Cloud Platform account for deployment.

**NATS Server (Local Setup Example):**
1.  Extract `nats-server.tar.gz` or use the `nats-server-v2.9.21-linux-amd64` directory.
2.  Run the NATS server:
    ```bash
    ./nats-server-v2.9.21-linux-amd64/nats-server
    ```

**Environment Variables:**
Both `api-server` and `worker-server` use `.env` files for configuration. Copy `.env.example` to `.env` in each respective directory and update with your local or cloud configurations for:
*   MongoDB Connection URI (`MONGO_URI` for api-server)
*   NATS Server URL (`NATS_URL` for both)
*   Port numbers (`PORT` for api-server)
*   CoinGecko API details (if any, like API keys, though often not needed for public endpoints)

**Deployment to GCP:**
The `api-server` includes a `cloudbuild.yaml` file, suggesting it's set up for automated builds and deployments to GCP Cloud Run using Google Cloud Build. Similar setup would be needed for the `worker-server`. GCP Cloud Scheduler would be configured to call the worker's trigger endpoint.

## API Endpoints (API Server)

Refer to the [`api-server/README.md`](./api-server/README.md) for detailed API endpoint documentation. Key endpoints include:

*   `GET /stats?coin=<coin_id>`: Retrieves latest statistics for the specified coin.
*   `GET /deviation?coin=<coin_id>`: Calculates and returns the price standard deviation for the last 100 records of the coin.

## Worker Server Operations

*   The worker is designed to be triggered by GCP Cloud Scheduler every 15 minutes.
*   Upon trigger, it publishes messages to NATS to initiate data update processes in the API server.
*   A manual trigger endpoint (e.g., `/fetch-crypto` or similar, check worker's `app.js` or `README.md`) is available for development and testing.

## Future Enhancements / Considerations

*   **Error Handling & Resilience**: Implement more robust error handling, retries (e.g., for NATS publishing, CoinGecko API calls), and dead-letter queues for NATS messages.
*   **Security**: Secure API endpoints (e.g., API keys, authentication for admin operations). Ensure NATS server is secured in production.
*   **Scalability**: Configure auto-scaling for Cloud Run services based on traffic.
*   **Monitoring & Logging**: Integrate comprehensive logging (e.g., Google Cloud Logging) and monitoring (e.g., Google Cloud Monitoring) for all services.
*   **Configuration Management**: Use a dedicated configuration service like GCP Secret Manager for sensitive data instead of just `.env` files in production containers.
*   **Data Validation**: Implement stricter input validation for API requests and data from external sources.
*   **Idempotency**: Ensure worker tasks and NATS message processing are idempotent where necessary.
*   **Testing**: Add unit, integration, and end-to-end tests for both services.

## Contributing

*(Standard contribution guidelines can be added here if the project were open source or for team collaboration.)*
Currently, this is a solo assignment project by @itsanubhav009.

---

This comprehensive README should give a good overview of your project. Remember to:
1.  Choose a final project name and update it.
2.  Create and embed an actual architecture diagram if possible.
3.  Verify the NATS communication flow (does worker send triggers or actual data?). The current README assumes triggers based on the `api-server`'s README.
4.  Specify MongoDB hosting details if relevant.
5.  Fill in any `(Placeholder)` or `(Specify ...)` sections with concrete details from your project.
