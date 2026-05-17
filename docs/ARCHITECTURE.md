# Architecture

The system ingests live timing data, processes it through ETL + ML pipelines, and serves predictions via API, web, and mobile clients.

## High-level components
- **Scraper** (Playwright/Node): pulls live timing data every 30s.
- **ETL** (Polars/Pandas): normalizes raw snapshots and prepares features.
- **ML** (XGBoost): trains and serves finish-position predictions.
- **API** (Express): exposes prediction and race endpoints.
- **Web** (React + Tailwind): dashboard UI.
- **Mobile** (Flutter): companion app for iOS/Android.

## Data flow
1. Scraper -> raw JSON snapshots
2. ETL -> curated parquet
3. ML -> prediction outputs
4. API -> cached responses (Redis)
5. Clients -> polling / real-time updates
