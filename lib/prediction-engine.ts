/**
 * Prediction Engine for Nürburgring Race Predictions
 * 
 * This is a mock implementation that generates realistic predictions
 * based on race data. In production, this would call an ML model endpoint.
 */

import type { RaceEntrant } from '@/types/race';
import type { Prediction, PredictionFactor, ModelMetadata } from '@/types/predictions';

// Mock model metadata
const modelMetadata: ModelMetadata = {
  modelName: 'NürburgringLapTimePredictor',
  modelVersion: 'v2.1.0-mock',
  algorithm: 'GradientBoostingRegressor',
  accuracy: 0.847,
  lastTrainedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  features: ['s1Time', 'position', 'category', 'pitStops', 'historicalData', 'weather'],
};

/**
 * Generate predictions for a list of race entrants
 * Uses mock ML model logic to simulate realistic predictions
 */
export function generatePredictions(entrants: RaceEntrant[]): Prediction[] {
  // Sort by current position to process in order
  const sortedEntrants = [...entrants].sort((a, b) => a.position - b.position);
  
  const predictions: Prediction[] = [];
  
  for (const entrant of sortedEntrants) {
    const prediction = calculatePrediction(entrant, sortedEntrants);
    predictions.push(prediction);
  }
  
  return predictions;
}

/**
 * Calculate prediction for a single entrant
 * Uses mock ML logic based on race position, S1 time, and category
 */
function calculatePrediction(
  entrant: RaceEntrant,
  allEntrants: RaceEntrant[]
): Prediction {
  // Parse S1 time for calculations
  const s1Time = parseS1Time(entrant.s1Time);
  const baseS1Time = 164; // ~2:44 seconds - baseline
  
  // Calculate relative performance
  const timeDelta = s1Time - baseS1Time;
  const positionFactor = (20 - entrant.position) / 20; // Higher for better positions
  const categoryFactor = getCategoryFactor(entrant.category);
  
  // Predict finish position (simulate some position changes)
  const positionSwing = Math.random() * 3 - 1.5; // -1.5 to +1.5 positions swing
  const predictedFinish = Math.max(1, Math.min(allEntrants.length, 
    Math.round(entrant.position + positionSwing)
  ));
  
  // Calculate confidence based on position and time consistency
  const confidenceBase = 50 + (positionFactor * 40) + (Math.random() * 10);
  const confidencePercentage = Math.min(98, Math.max(25, Math.round(confidenceBase)));
  
  // Top 5 odds based on predicted finish position
  const top5Odds = predictedFinish <= 5 
    ? 0.75 + (Math.random() * 0.24) 
    : (6 - predictedFinish) / 10 + (Math.random() * 0.1);
  
  // DNF probability - higher for lower positions and certain categories
  const dnfBase = getCategoryDNFBase(entrant.category);
  const positionDnfFactor = (entrant.position - 1) * 0.02;
  const dnfProbability = Math.min(0.15, Math.max(0.02, dnfBase + positionDnfFactor));
  
  // Generate prediction factors
  const factors = generateFactors(entrant, timeDelta, predictedFinish);
  
  return {
    id: `pred-${entrant.number}`,
    driverName: entrant.name,
    vehicle: entrant.vehicle,
    category: entrant.category,
    currentPosition: entrant.position,
    predictedFinish,
    confidencePercentage,
    top5Odds: Math.round(top5Odds * 100) / 100,
    dnfProbability: Math.round(dnfProbability * 1000) / 1000,
    modelVersion: modelMetadata.modelVersion,
    predictionTimestamp: new Date().toISOString(),
    factors,
  };
}

/**
 * Get category performance factor
 */
function getCategoryFactor(category: string): number {
  switch (category) {
    case 'GT3': return 1.0;
    case 'Cup2': return 0.7;
    case 'TCR': return 0.6;
    case 'GT4': return 0.4;
    default: return 0.5;
  }
}

/**
 * Get base DNF probability by category
 */
function getCategoryDNFBase(category: string): number {
  switch (category) {
    case 'GT3': return 0.03;
    case 'Cup2': return 0.05;
    case 'TCR': return 0.08;
    case 'GT4': return 0.06;
    default: return 0.05;
  }
}

/**
 * Parse S1 time string to seconds
 */
function parseS1Time(s1Time: string): number {
  const parts = s1Time.split(':');
  if (parts.length !== 2) return 0;
  
  const minutes = parseInt(parts[0] ?? '0') || 0;
  const secondsPart = parts[1] ?? '0';
  const secondsParts = secondsPart.split('.');
  const sec = secondsParts[0] ?? '0';
  const ms = secondsParts[1] ?? '0';
  
  return minutes * 60 + (parseInt(sec) || 0) + (parseInt(ms) / 1000);
}

/**
 * Generate prediction factors for explainability
 */
function generateFactors(
  entrant: RaceEntrant,
  timeDelta: number,
  predictedFinish: number
): PredictionFactor[] {
  const factors: PredictionFactor[] = [];
  
  // S1 Time factor
  if (timeDelta < -1) {
    factors.push({
      name: 'Sector 1 Performance',
      impact: 'positive',
      weight: 0.35,
      description: `Excellent S1 time: ${entrant.s1Time} (${Math.abs(timeDelta).toFixed(2)}s faster than average)`,
    });
  } else if (timeDelta > 1) {
    factors.push({
      name: 'Sector 1 Performance',
      impact: 'negative',
      weight: 0.25,
      description: `S1 time needs improvement: ${entrant.s1Time}`,
    });
  }
  
  // Position factor
  if (entrant.position <= 3) {
    factors.push({
      name: 'Current Position',
      impact: 'positive',
      weight: 0.30,
      description: `Strong starting position (P${entrant.position}) provides strategic advantage`,
    });
  }
  
  // Category factor
  if (entrant.category === 'GT3') {
    factors.push({
      name: 'Category Performance',
      impact: 'positive',
      weight: 0.20,
      description: 'GT3 class cars have highest probability of finishing in top positions',
    });
  }
  
  // Pit stops factor
  if (entrant.pitStops > 16) {
    factors.push({
      name: 'Pit Stop Efficiency',
      impact: 'negative',
      weight: 0.15,
      description: `Above average pit stops (${entrant.pitStops}) may impact final position`,
    });
  }
  
  return factors;
}

/**
 * Filter predictions by category
 */
export function filterByCategory(
  predictions: Prediction[],
  category?: string
): Prediction[] {
  if (!category || category === 'all') {
    return predictions;
  }
  return predictions.filter(p => p.category === category);
}

/**
 * Get predictions sorted by predicted finish position
 */
export function sortByPredictedFinish(predictions: Prediction[]): Prediction[] {
  return [...predictions].sort((a, b) => a.predictedFinish - b.predictedFinish);
}

/**
 * Get top N predictions by confidence
 */
export function getTopByConfidence(
  predictions: Prediction[],
  count: number = 5
): Prediction[] {
  return [...predictions]
    .sort((a, b) => b.confidencePercentage - a.confidencePercentage)
    .slice(0, count);
}

export { modelMetadata };