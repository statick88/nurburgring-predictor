/**
 * Data Client Configuration - CommonJS
 */

const dataClientConfig = {
  // Azure API Configuration
  azureApiUrl: process.env.AZURE_API_URL || 'https://livetiming.azurewebsites.net',
  eventId: process.env.EVENT_ID || '50',
  config: process.env.AZURE_CONFIG || 'w3',

  // Polling Configuration
  pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS || '30000', 10),
  timeoutMs: parseInt(process.env.DATA_CLIENT_TIMEOUT_MS || '10000', 10),

  // Retry Configuration
  retryAttempts: parseInt(process.env.DATA_CLIENT_RETRY_ATTEMPTS || '3', 10),
  retryDelayMs: parseInt(process.env.DATA_CLIENT_RETRY_DELAY_MS || '2000', 10),

  // Feature flags
  enableAutoRestart: process.env.ENABLE_AUTO_RESTART !== 'false',
  enableMetrics: process.env.ENABLE_DATA_CLIENT_METRICS === 'true',
};

function getAzureApiUrl() {
  return `${dataClientConfig.azureApiUrl}/event=${dataClientConfig.eventId}?config=${dataClientConfig.config}`;
}

module.exports = { dataClientConfig, getAzureApiUrl };