/**
 * Data Fetcher - HTTP client para Azure Live Timing API (CommonJS)
 */

const axios = require('axios');
const { dataClientConfig, getAzureApiUrl } = require('./config');

class DataFetcher {
  constructor() {
    this.baseUrl = getAzureApiUrl();
    this.requestCount = 0;
    this.errorCount = 0;
  }

  async fetch() {
    this.requestCount++;
    const startTime = Date.now();

    try {
      const response = await axios.get(this.baseUrl, {
        timeout: dataClientConfig.timeoutMs,
        headers: {
          'Accept': 'application/json, text/html, */*',
          'User-Agent': 'NurburgringPredictor/1.0 (Data Client)',
          'Cache-Control': 'no-cache',
        },
        responseType: 'json',
        transformResponse: [(data) => {
          try {
            return JSON.parse(data);
          } catch {
            return { _isHtml: true, _raw: data.substring(0, 500) };
          }
        }],
      });

      const duration = Date.now() - startTime;
      console.log(`[DataFetcher] Fetch successful in ${duration}ms`);

      return {
        standings: this._extractStandings(response.data),
        events: this._extractEvents(response.data),
        weather: this._extractWeather(response.data),
        raceInfo: this._extractRaceInfo(response.data),
        rawData: response.data,
        fetchedAt: new Date().toISOString(),
      };

    } catch (error) {
      this.errorCount++;
      const duration = Date.now() - startTime;

      if (error.response?.status === 404) {
        throw new Error('API endpoint not found - verify event ID');
      }
      if (error.response?.status === 403) {
        throw new Error('API access forbidden - may require auth');
      }
      if (error.code === 'ECONNABORTED') {
        throw new Error('API timeout - increase timeoutMs');
      }

      console.error(`[DataFetcher] Error:`, error.message);
      throw error;
    }
  }

  async fetchWithRetry() {
    let lastError = null;

    for (let attempt = 1; attempt <= dataClientConfig.retryAttempts; attempt++) {
      try {
        console.log(`[DataFetcher] Attempt ${attempt}/${dataClientConfig.retryAttempts}`);
        return await this.fetch();
      } catch (error) {
        lastError = error;
        console.warn(`[DataFetcher] Attempt ${attempt} failed:`, error.message);

        if (attempt < dataClientConfig.retryAttempts) {
          const delay = dataClientConfig.retryDelayMs * Math.pow(2, attempt - 1);
          console.log(`[DataFetcher] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`Data fetch failed after ${dataClientConfig.retryAttempts} attempts: ${lastError?.message}`);
  }

  _extractStandings(data) {
    if (!data || typeof data !== 'object') return undefined;
    const d = data;
    if (d.entries) return { entries: d.entries };
    if (d.standings) return { entries: d.standings };
    if (d.Leaderboard) return { entries: d.Leaderboard };
    return undefined;
  }

  _extractEvents(data) {
    if (!data || typeof data !== 'object') return undefined;
    const d = data;
    if (d.events) return { events: d.events };
    if (d.incidents) return { events: d.incidents };
    return undefined;
  }

  _extractWeather(data) {
    if (!data || typeof data !== 'object') return undefined;
    const d = data;
    if (d.weather) return d.weather;
    if (d.Weather) return d.Weather;
    return undefined;
  }

  _extractRaceInfo(data) {
    if (!data || typeof data !== 'object') return undefined;
    const d = data;
    if (d.raceInfo) return d.raceInfo;
    if (d.RaceInfo) return d.RaceInfo;
    if (d.status) return { status: d.status };
    return undefined;
  }

  getMetrics() {
    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      errorRate: this.requestCount > 0 ? this.errorCount / this.requestCount : 0,
    };
  }

  resetMetrics() {
    this.requestCount = 0;
    this.errorCount = 0;
  }
}

const dataFetcher = new DataFetcher();

module.exports = { DataFetcher, dataFetcher };