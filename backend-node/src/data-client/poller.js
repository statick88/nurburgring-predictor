/**
 * Data Poller - Interval-based data fetching (CommonJS)
 */

const { dataClientConfig } = require('./config');
const { DataFetcher } = require('./fetcher');
const { DataTransformer } = require('./transformer');

class DataPoller {
  constructor() {
    this.fetcher = new DataFetcher();
    this.transformer = new DataTransformer();
    this.intervalId = null;
    this.isRunning = false;

    // Metrics
    this.cyclesCompleted = 0;
    this.cyclesFailed = 0;
    this.lastCycleDurationMs = null;
    this.lastSuccessfulFetch = null;
    this.lastError = null;

    // Callbacks
    this.callbacks = {};
  }

  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  start() {
    if (this.isRunning) {
      console.warn('[DataPoller] Already running');
      return;
    }

    console.log(`🚀 Starting Data Poller (interval: ${dataClientConfig.pollIntervalMs}ms)`);
    this.isRunning = true;

    // Run immediately
    this.tick().catch(err => {
      console.error('[DataPoller] Initial tick failed:', err.message);
    });

    this.intervalId = setInterval(() => {
      this.tick().catch(err => {
        console.error('[DataPoller] Tick failed:', err.message);
      });
    }, dataClientConfig.pollIntervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 Data Poller stopped');
  }

  async tick() {
    const startTime = Date.now();
    console.log(`🔄 [${new Date().toISOString()}] Starting data fetch cycle...`);

    try {
      // 1. Fetch data from Azure API
      const rawData = await this.fetcher.fetchWithRetry();

      // 2. Transform to internal schema
      const competitors = this.transformer.transformStandings(rawData.standings);
      const events = this.transformer.transformEvents(rawData.events);
      const weather = this.transformer.transformWeather(rawData.weather);
      const raceInfo = this.transformer.transformRaceInfo(rawData.raceInfo);

      // 3. Update metrics
      this.cyclesCompleted++;
      this.lastCycleDurationMs = Date.now() - startTime;
      this.lastSuccessfulFetch = new Date().toISOString();
      this.lastError = null;

      // 4. Trigger callbacks
      if (competitors.length > 0) {
        console.log(`✅ Processed ${competitors.length} competitors`);
        this.callbacks.onCompetitors?.(competitors);
      }

      if (events.length > 0) {
        console.log(`✅ Processed ${events.length} events`);
        this.callbacks.onEvents?.(events);
      }

      if (weather) {
        console.log('✅ Processed weather data');
        this.callbacks.onWeather?.(weather);
      }

      if (raceInfo) {
        console.log(`✅ Processed race info: ${raceInfo.status}`);
        this.callbacks.onRaceInfo?.(raceInfo);
      }

      const duration = this.lastCycleDurationMs;
      console.log(`📊 Cycle completed in ${duration}ms | Total: ${this.cyclesCompleted} | Failed: ${this.cyclesFailed}`);

    } catch (error) {
      this.cyclesFailed++;
      this.lastError = error.message;

      console.error(`❌ Data cycle failed:`, this.lastError);
      this.callbacks.onError?.(error);
    }
  }

  async fetchOnce() {
    const rawData = await this.fetcher.fetchWithRetry();

    return {
      competitors: this.transformer.transformStandings(rawData.standings),
      events: this.transformer.transformEvents(rawData.events),
      weather: this.transformer.transformWeather(rawData.weather),
      raceInfo: this.transformer.transformRaceInfo(rawData.raceInfo),
    };
  }

  getMetrics() {
    return {
      isRunning: this.isRunning,
      cyclesCompleted: this.cyclesCompleted,
      cyclesFailed: this.cyclesFailed,
      lastCycleDurationMs: this.lastCycleDurationMs,
      lastSuccessfulFetch: this.lastSuccessfulFetch,
      lastError: this.lastError,
    };
  }

  resetMetrics() {
    this.cyclesCompleted = 0;
    this.cyclesFailed = 0;
    this.lastCycleDurationMs = null;
    this.lastSuccessfulFetch = null;
    this.lastError = null;
    this.fetcher.resetMetrics();
  }
}

const dataPoller = new DataPoller();

module.exports = { DataPoller, dataPoller };