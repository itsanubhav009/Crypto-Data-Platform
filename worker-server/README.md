# Cryptocurrency Worker Server

This server runs a background job every 15 minutes to trigger cryptocurrency data updates.

## Features

- Scheduled job running every 15 minutes
- NATS event publishing
- Triggers update events for the API server

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- NATS Server

### Installation

1. Clone the repository
2. Navigate to the worker-server directory
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

## How It Works

The worker server:
1. Connects to NATS server on startup
2. Schedules a job to run every 15 minutes
3. On each scheduled run, publishes an update event to NATS
4. The API server subscribes to these events and updates the cryptocurrency data

## Message Format

The worker publishes messages in the following format:

```json
{
  "trigger": "update",
  "timestamp": "2025-05-18T06:30:00.000Z"
}
```