/**
 * Prediction types for ML prediction system
 * 
 * API Response Format (camelCase):
 * - predictedFinish: number
 * - confidencePercentage: number (0-100)
 * - top5Odds: number (0-1)
 * - dnfProbability: number (0-1)
 */

import type { RaceEntrant } from './race';

/**
 * Individual driver/car prediction
 */
export interface Prediction {
  id: string;
  driverName: string;
  vehicle: string;
  category: string;
  currentPosition: number;
  
  // ML prediction outputs
  predictedFinish: number;
  confidencePercentage: number;
  top5Odds: number;      // 0-1 probability
  dnfProbability: number; // 0-1 probability
  
  // Metadata
  modelVersion: string;
  predictionTimestamp: string;
  factors: PredictionFactor[];
}

/**
 * Factors that influenced the prediction
 */
export interface PredictionFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

/**
 * API response for predictions endpoint
 */
export interface PredictionsResponse {
  success: boolean;
  data: {
    raceId: string;
    predictions: Prediction[];
    modelMetadata: ModelMetadata;
    generatedAt: string;
  };
  error?: string;
}

/**
 * Model metadata
 */
export interface ModelMetadata {
  modelName: string;
  modelVersion: string;
  algorithm: string;
  accuracy: number;
  lastTrainedAt: string;
  features: string[];
}

/**
 * Prediction request parameters
 */
export interface PredictionParams {
  raceId?: string;
  category?: string;
  includeFactors?: boolean;
}