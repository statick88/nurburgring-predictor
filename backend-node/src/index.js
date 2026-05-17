require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Middleware for timing
app.use((req, res, next) => {
  req.startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    console.log(`[${req.method}] ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// ========== In-memory storage (later: PostgreSQL) ==========

let latestData = {
  competitors: [],
  events: [],
  weather: null,
  raceInfo: null,
  lastUpdated: null,
};

// API to receive data from GitHub Actions
app.post('/api/internal/update-data', (req, res) => {
  const { competitors, events, weather, raceInfo, timestamp } = req.body;
  
  if (competitors) latestData.competitors = competitors;
  if (events) latestData.events = events;
  if (weather) latestData.weather = weather;
  if (raceInfo) latestData.raceInfo = raceInfo;
  if (timestamp) latestData.lastUpdated = timestamp;

  console.log(`📥 Data updated at ${latestData.lastUpdated}`);
  res.json({ status: 'ok', updated: latestData.lastUpdated });
});

// ========== API Endpoints ==========

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    data: {
      competitorsCount: latestData.competitors.length,
      eventsCount: latestData.events.length,
      hasWeather: !!latestData.weather,
      hasRaceInfo: !!latestData.raceInfo,
      lastUpdated: latestData.lastUpdated,
    }
  });
});

// GET /api/races/current
app.get('/api/races/current', (req, res) => {
  res.json({
    id: 'current',
    status: latestData.raceInfo?.status || 'unknown',
    name: latestData.raceInfo?.eventName || 'Nürburgring 24h',
    elapsedHours: latestData.raceInfo?.elapsedHours || 0,
    weatherCondition: latestData.weather || null,
    lastUpdated: latestData.lastUpdated,
  });
});

// GET /api/leaderboard
app.get('/api/leaderboard', (req, res) => {
  const { category, limit = 10, offset = 0 } = req.query;
  
  let competitors = latestData.competitors;
  
  if (category) {
    competitors = competitors.filter(c => c.category === category);
  }
  
  const total = competitors.length;
  const standings = competitors.slice(Number(offset), Number(offset) + Number(limit));
  
  res.json({
    raceId: 'current',
    timestamp: latestData.lastUpdated,
    totalCompetitors: total,
    standings,
    pagination: {
      total,
      limit: Number(limit),
      offset: Number(offset),
      hasMore: Number(offset) + Number(limit) < total,
    },
  });
});

// GET /api/predictions/top10
app.get('/api/predictions/top10', (req, res) => {
  const { minConfidence = 0, category } = req.query;
  
  let competitors = latestData.competitors;
  if (category) {
    competitors = competitors.filter(c => c.category === category);
  }
  
  const predictions = competitors
    .filter(c => c.currentPosition <= 10)
    .map((c, i) => ({
      rank: i + 1,
      teamId: c.teamCode,
      teamName: c.teamName,
      category: c.category,
      currentPosition: c.currentPosition,
      predictedFinishPosition: c.currentPosition,
      finishProbability: 50 + Math.random() * 40, // Placeholder
      confidenceScore: 50 + Math.random() * 30,
    }));
  
  res.json({
    raceId: 'current',
    modelVersion: 'xgboost_v1',
    predictions,
    generatedAt: new Date().toISOString(),
  });
});

// GET /api/events
app.get('/api/events', (req, res) => {
  const { eventType, teamId, limit = 50, offset = 0 } = req.query;
  
  let events = latestData.events;
  
  if (eventType) {
    events = events.filter(e => e.eventType === eventType);
  }
  if (teamId) {
    events = events.filter(e => e.teamId === teamId);
  }
  
  const total = events.length;
  const sliced = events.slice(Number(offset), Number(offset) + Number(limit));
  
  res.json({
    raceId: 'current',
    events: sliced,
    pagination: {
      total,
      limit: Number(limit),
      offset: Number(offset),
      hasMore: Number(offset) + Number(limit) < total,
    },
  });
});

// GET /api/stats
app.get('/api/stats', (req, res) => {
  const running = latestData.competitors.filter(c => c.status === 'running').length;
  const pit = latestData.competitors.filter(c => c.status === 'pit').length;
  const dnf = latestData.competitors.filter(c => c.status === 'dnf').length;
  
  res.json({
    raceId: 'current',
    timestamp: latestData.lastUpdated,
    raceStats: {
      competitors: {
        total: latestData.competitors.length,
        running,
        pit,
        finished: 0,
        dnf,
      },
      elapsedHours: latestData.raceInfo?.elapsedHours || 0,
    },
    weather: latestData.weather,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ========== Start Server ==========

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🏁 Nürburgring Predictor API running on port ${PORT}`);
  console.log(`📡 Data source: PostgreSQL (updated via GitHub Actions)`);
});

module.exports = { latestData }; // For testing