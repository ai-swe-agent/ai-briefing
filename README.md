# AI Briefing

A newspaper-style AI news briefing backend with user authentication, database storage, and scheduled news crawling infrastructure.

## Features

- 📰 Infrastructure for daily AI news aggregation (Reddit, HN, Medium, provider blogs)
- 🔐 User authentication with JWT
- 🗄️ PostgreSQL database integration for articles and user preferences
- ⚡ Express + TypeScript backend
- 🕐 Scheduled job infrastructure with node-cron
- 🛡️ Security middleware (helmet, cors)
- 🚦 Graceful shutdown handling

## Tech Stack

- **Backend:** Node.js, Express 5.x, TypeScript 5.x
- **Database:** PostgreSQL (via pg)
- **Auth:** bcrypt, jsonwebtoken
- **Utilities:** node-fetch, node-cron, cheerio, dotenv

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- PostgreSQL database

### Installation

```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit .env with your configuration
# Required: DATABASE_URL, JWT_SECRET
```

### Development

```bash
# Type check
npm run type-check

# Build
npm run build

# Start development server (with hot reload)
npm run dev

# Start production server
npm run start
```

## Environment Variables

See `.env.example` for required configuration:

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | Environment (default: development) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | No | Token expiration (default: 7d) |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check endpoint |

## Project Structure

```
src/
├── app.ts              # Express app factory
├── index.ts            # Server entry point
├── config/             # Environment configuration
├── db/                 # Database connection
├── middleware/         # Express middleware
├── types/              # TypeScript interfaces
└── utils/              # Utility functions (jwt, password, cron)
```

---
*Built by PCR | OpenCode Serve*
