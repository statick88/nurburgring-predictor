/**
 * Prediction Engine for Nürburgring Race Predictions
 * 
 * Predictions are generated PER TEAM (grouped by vehicle), not per driver.
 * Multiple drivers sharing the same car are aggregated into one team prediction.
 */

import type { RaceEntrant } from '@/types/race';
import type { Prediction, PredictionFactor, ModelMetadata } from '@/types/predictions';

// Team model: groups drivers by vehicle number
export interface TeamEntrant {
  teamId: string;           // e.g., "team-3" (by car number)
  carNumber: number;        // Car number
  vehicle: string;          // Vehicle model
  category: string;         // GT3, TCR, GT4, Cup2
  drivers: string[];        // All drivers sharing this car
  bestPosition: number;     // Best position achieved by any driver
  avgPitStops: number;      // Average pit stops across all stints
  bestS1Time: string;       // Fastest S1 time by any driver
  totalLaps: number;        // Combined laps
}

// Mock model metadata
const modelMetadata: ModelMetadata = {
  modelName: 'NürburgringTeamPredictor',
  modelVersion: 'v3.0.0-team',
  algorithm: 'GradientBoostingRegressor',
  accuracy: 0.847,
  lastTrainedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  features: ['teamS1Time', 'teamPosition', 'category', 'pitStops', 'driverRotation', 'weather'],
};

/**
 * Group individual entrants into teams by vehicle
 */
export function groupByTeam(entrants: RaceEntrant[]): TeamEntrant[] {
  const teamMap = new Map<number, TeamEntrant>();
  
  for (const entrant of entrants) {
    const existing = teamMap.get(entrant.number);
    
    if (existing) {
      // Add driver to existing team
      existing.drivers.push(entrant.name);
      existing.bestPosition = Math.min(existing.bestPosition, entrant.position);
      existing.avgPitStops = (existing.avgPitStops + entrant.pitStops) / 2;
      existing.totalLaps += 1; // Simplified
      
      // Keep best S1 time (lowest is fastest)
      const currentS1 = parseS1TimeToSeconds(existing.bestS1Time);
      const newS1 = parseS1TimeToSeconds(entrant.s1Time);
      if (newS1 < currentS1) {
        existing.bestS1Time = entrant.s1Time;
      }
    } else {
      // Create new team
      teamMap.set(entrant.number, {
        teamId: `team-${entrant.number}`,
        carNumber: entrant.number,
        vehicle: entrant.vehicle,
        category: entrant.category,
        drivers: [entrant.name],
        bestPosition: entrant.position,
        avgPitStops: entrant.pitStops,
        bestS1Time: entrant.s1Time,
        totalLaps: 1,
      });
    }
  }
  
  return Array.from(teamMap.values()).sort((a, b) => a.bestPosition - b.bestPosition);
}

/**
 * Generate predictions for all teams
 */
export function generatePredictions(entrants: RaceEntrant[]): Prediction[] {
  const teams = groupByTeam(entrants);
  
  const predictions: Prediction[] = [];
  
  for (const team of teams) {
    const prediction = calculateTeamPrediction(team, teams);
    predictions.push(prediction);
  }
  
  return predictions;
}

/**
 * Calculate prediction for a single team
 */
function calculateTeamPrediction(
  team: TeamEntrant,
  allTeams: TeamEntrant[]
): Prediction {
  // Parse S1 time for calculations
  const s1Time = parseS1TimeToSeconds(team.bestS1Time);
  const baseS1Time = 164; // ~2:44 seconds - baseline
  
  // Calculate relative performance
  const timeDelta = s1Time - baseS1Time;
  const positionFactor = (20 - team.bestPosition) / 20;
  const categoryFactor = getCategoryFactor(team.category);
  const driverCountFactor = Math.min(1.2, 1 + (team.drivers.length - 1) * 0.05); // More drivers = slight advantage
  
  // Predict finish position (simulate some position changes)
  const positionSwing = Math.random() * 3 - 1.5;
  const predictedFinish = Math.max(1, Math.min(allTeams.length, 
    Math.round(team.bestPosition + positionSwing)
  ));
  
  // Calculate confidence based on team factors
  const confidenceBase = 50 + (positionFactor * 40) + (Math.random() * 10);
  const confidencePercentage = Math.min(98, Math.max(25, Math.round(confidenceBase * driverCountFactor)));
  
  // Top 5 odds based on predicted finish position
  const top5Odds = predictedFinish <= 5 
    ? 0.75 + (Math.random() * 0.24) 
    : (6 - predictedFinish) / 10 + (Math.random() * 0.1);
  
  // DNF probability - lower for teams with more drivers (rotation advantage)
  const dnfBase = getCategoryDNFBase(team.category);
  const positionDnfFactor = (team.bestPosition - 1) * 0.02;
  const driverRotationBonus = Math.max(0.7, 1 - (team.drivers.length - 1) * 0.05);
  const dnfProbability = Math.min(0.15, Math.max(0.02, (dnfBase + positionDnfFactor) * driverRotationBonus));
  
  // Generate prediction factors
  const factors = generateTeamFactors(team, timeDelta, predictedFinish);
  
  return {
    id: team.teamId,
    driverName: `#${team.carNumber} ${team.vehicle}`,
    vehicle: team.vehicle,
    category: team.category,
    currentPosition: team.bestPosition,
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
function parseS1TimeToSeconds(s1Time: string): number {
  const parts = s1Time.split(':');
  if (parts.length === 2) {
    const minutes = parseInt(parts[0] ?? '0') || 0;
    const secondsPart = parts[1] ?? '0';
    const secondsParts = secondsPart.split('.');
    const sec = secondsParts[0] ?? '0';
    const ms = secondsParts[1] ?? '0';
    return minutes * 60 + (parseInt(sec) || 0) + (parseInt(ms) / 1000);
  }
  // Just seconds
  const secondsParts = s1Time.split('.');
  const sec = secondsParts[0] ?? '0';
  const ms = secondsParts[1] ?? '0';
  return (parseInt(sec) || 0) + (parseInt(ms) / 1000);
}

/**
 * Generate prediction factors for team explainability
 */
function generateTeamFactors(
  team: TeamEntrant,
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
      description: `Excellent S1 time: ${team.bestS1Time} (${Math.abs(timeDelta).toFixed(2)}s faster than average)`,
    });
  } else if (timeDelta > 1) {
    factors.push({
      name: 'Sector 1 Performance',
      impact: 'negative',
      weight: 0.25,
      description: `S1 time needs improvement: ${team.bestS1Time}`,
    });
  }
  
  // Position factor
  if (team.bestPosition <= 3) {
    factors.push({
      name: 'Current Position',
      impact: 'positive',
      weight: 0.30,
      description: `Strong starting position (P${team.bestPosition}) provides strategic advantage`,
    });
  }
  
  // Category factor
  if (team.category === 'GT3') {
    factors.push({
      name: 'Category Performance',
      impact: 'positive',
      weight: 0.20,
      description: 'GT3 class cars have highest probability of finishing in top positions',
    });
  }
  
  // Driver rotation factor
  if (team.drivers.length >= 3) {
    factors.push({
      name: 'Driver Rotation',
      impact: 'positive',
      weight: 0.15,
      description: `${team.drivers.length} drivers provide excellent rotation and fatigue management`,
    });
  }
  
  // Pit stops factor
  if (team.avgPitStops > 16) {
    factors.push({
      name: 'Pit Stop Efficiency',
      impact: 'negative',
      weight: 0.15,
      description: `Above average pit stops (${team.avgPitStops.toFixed(0)}) may impact final position`,
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
