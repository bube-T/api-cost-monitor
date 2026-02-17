# API Cost Monitor

A SaaS platform for real-time monitoring and alerting of API usage costs across services like OpenAI, AWS, and more.

## Features

- 🔍 Real-time API usage tracking
- 💰 Cost breakdowns by endpoint, user, and service
- 🚨 Customizable spending alerts
- 🛡️ Automatic rate limiting
- 📊 Visual dashboards and analytics
- 🔐 Secure API key management

## Project Structure

```
api-cost-monitor/
├── backend/          # Express API server + proxy logic
├── frontend/         # React dashboard (Vite)
├── shared/           # Shared types and utilities
└── docker-compose.yml # Local development setup
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (see `.env.example`)

3. Start development servers:
```bash
npm run dev
```

## Tech Stack

- **Backend**: Node.js, Express, PostgreSQL
- **Frontend**: React, Vite, TailwindCSS
- **Auth**: JWT
- **Real-time**: WebSockets

## Architecture

The service works as a proxy:
1. Client apps use our API endpoint instead of calling OpenAI/AWS directly
2. We forward requests to the target API
3. Track usage, calculate costs, check thresholds
4. Return the response to the client
5. Update dashboard in real-time

## License

MIT
