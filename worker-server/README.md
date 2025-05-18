# Worker Server

This server is responsible for triggering cryptocurrency data updates by publishing events to NATS.

## Features

- Runs as a background job every 15 minutes using Cloud Scheduler
- Publishes update triggers to NATS messaging system
- Provides HTTP endpoints for health checks and manual triggers

## Setup Instructions

### Prerequisites

- Node.js 18 or higher
- Access to a NATS server
- Google Cloud Platform account (for deployment)

### Local Development

1. Install dependencies:
   ```bash
   npm install

