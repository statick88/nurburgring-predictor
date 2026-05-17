/**
 * Data Client Module - CommonJS
 */

const { DataFetcher, dataFetcher } = require('./fetcher');
const { DataTransformer, dataTransformer } = require('./transformer');
const { DataPoller, dataPoller } = require('./poller');
const { dataClientConfig, getAzureApiUrl } = require('./config');

module.exports = {
  DataFetcher,
  dataFetcher,
  DataTransformer,
  dataTransformer,
  DataPoller,
  dataPoller,
  dataClientConfig,
  getAzureApiUrl,
};