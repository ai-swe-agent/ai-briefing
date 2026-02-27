# AI Briefing

A newspaper-style AI news briefing website with user authentication, database storage, and daily automated news crawling.

## Features

- 📰 Daily AI news aggregation from Reddit, HN, Medium, and provider blogs
- 🔐 User authentication with JWT
- 🗄️ PostgreSQL database for articles and user preferences
- ⚡ Express + TypeScript backend
- ⚛️ React frontend with Tailwind CSS
- 🕐 Automated daily crawling with node-cron

## Tech Stack

- **Backend:** Node.js, Express, TypeScript, PostgreSQL
- **Frontend:** React, Vite, Tailwind CSS
- **Auth:** bcrypt, jsonwebtoken
- **Crawling:** node-fetch, node-cron, cheerio

## Getting Started

```bash
# Install dependencies
npm install

# Setup database (Docker)
docker-compose up -d postgres

# Run migrations
npm run migrate

# Start development
npm run dev
```

## API Documentation

See `docs/api.md` for endpoint details.

---
*Built by PCR | OpenCode Serve*
