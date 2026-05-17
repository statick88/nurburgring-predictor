# Nürburgring 24h Live Predictor

Real-time predictor for the 24 Hours of Nürburgring. Collects live timing data, runs ETL + ML pipelines, and serves predictions via API, web, and mobile clients.

## Structure
- backend-python: data pipeline + ML
- backend-node: API service
- frontend: React + Tailwind dashboard
- mobile: Flutter app
- docs: architecture and Gitflow

## Quick start
- Configure environment variables in `.env` (see `.env.example`).
- Run `docker-compose up` to start Postgres + Redis.
- Follow each subproject's README for local dev.
