/**
 * Race data types for the Nürburgring predictor
 * Based on the mock race data from RaceLeaderboard.tsx
 */

export interface RaceEntrant {
  position: number;      // Pos.
  number: number;        // No.
  rank: number;          // Rank (clasificación general)
  name: string;          // Name (equipo/pilotos)
  pitStops: number;      // Pit (paradas en boxes)
  vehicle: string;       // Vehicle
  s1Time: string;        // S1 time (tiempo sector 1)
  gapToCategoryBehind: string; // Diferencia con vehículo de su categoría detrás
  category: string;      // Categoría del auto
}

export interface RaceData {
  raceId: string;
  raceName: string;
  timestamp: string;
  entrants: RaceEntrant[];
  totalEntrants: number;
  lastUpdated: string;
}

/**
 * Parsed S1 time in seconds for calculations
 */
export function parseS1Time(s1Time: string): number {
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
 * Parse gap string to numeric value
 */
export function parseGap(gap: string): number {
  if (!gap || gap === '') return 0;
  return parseFloat(gap.replace('+', '').replace('-', '')) || 0;
}