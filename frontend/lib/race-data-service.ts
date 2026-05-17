/**
 * Race Data Service - Simulación realista de datos de carrera
 * 
 * Basado en datos reales del Nürburgring 24h 2026
 * Actualización automática cada 60 segundos
 * 
 * NOTA: No existe API pública oficial. El feed WIGE (192.168.11.233:80)
 * solo está disponible en la red local del circuito.
 */

import type { RaceEntrant } from '@/components/RaceLeaderboard';

// Datos reales extraídos del timing oficial
const INITIAL_RACE_DATA: RaceEntrant[] = [
  { position: 1, number: 3, rank: 1, name: 'Verstappen', pitStops: 16, vehicle: 'Mercedes-AMG GT3', s1Time: '3:49.141', gapToCategoryBehind: '', category: 'GT3' },
  { position: 2, number: 80, rank: 2, name: 'Engel', pitStops: 16, vehicle: 'Mercedes-AMG GT3', s1Time: '3:55.988', gapToCategoryBehind: '+6.847', category: 'GT3' },
  { position: 3, number: 34, rank: 3, name: 'Drudi', pitStops: 17, vehicle: 'Aston Martin Vantage AMR GT3 EVO', s1Time: '40.580', gapToCategoryBehind: '-3:08.561', category: 'GT3' },
  { position: 4, number: 99, rank: 4, name: 'Hesse', pitStops: 16, vehicle: 'BMW M4 GT3 EVO', s1Time: '41.016', gapToCategoryBehind: '+0.436', category: 'GT3' },
  { position: 5, number: 84, rank: 5, name: 'Niederhauser', pitStops: 17, vehicle: 'Lamborghini Huracan GT3 EVO2', s1Time: '39.799', gapToCategoryBehind: '-1.217', category: 'GT3' },
  { position: 6, number: 81, rank: 1, name: 'Verhagen', pitStops: 16, vehicle: 'BMW M3 Touring 24h', s1Time: '40.847', gapToCategoryBehind: '', category: 'TCR' },
  { position: 7, number: 24, rank: 6, name: 'Feller', pitStops: 15, vehicle: 'Porsche 911 GT3 R (992) Evo26', s1Time: '40.441', gapToCategoryBehind: '-0.406', category: 'GT3' },
  { position: 8, number: 54, rank: 7, name: 'Sturm', pitStops: 15, vehicle: 'Porsche 911 GT3 R (992) Evo26', s1Time: '40.653', gapToCategoryBehind: '+0.212', category: 'GT3' },
  { position: 9, number: 67, rank: 8, name: 'Olsen', pitStops: 16, vehicle: 'Ford Mustang GT3 EVO (2026)', s1Time: '40.381', gapToCategoryBehind: '-0.272', category: 'GT3' },
  { position: 10, number: 48, rank: 9, name: 'Arrow', pitStops: 15, vehicle: 'Porsche 911 GT3 R (992) Evo26', s1Time: '40.892', gapToCategoryBehind: '+0.511', category: 'GT3' },
  { position: 11, number: 77, rank: 10, name: 'Wittmann', pitStops: 17, vehicle: 'BMW M4 GT3 EVO', s1Time: '3:50.117', gapToCategoryBehind: '-0.775', category: 'GT3' },
  { position: 12, number: 130, rank: 11, name: 'Mapelli', pitStops: 15, vehicle: 'Lamborghini Huracan GT3 EVO2', s1Time: '40.385', gapToCategoryBehind: '-0.507', category: 'GT3' },
  { position: 13, number: 18, rank: 12, name: 'Hill', pitStops: 15, vehicle: 'Porsche 911 GT3 R (992) Evo26', s1Time: '41.234', gapToCategoryBehind: '+0.849', category: 'GT3' },
  { position: 14, number: 69, rank: 13, name: 'Dörr', pitStops: 16, vehicle: 'McLaren 720S-GT3', s1Time: '3:53.272', gapToCategoryBehind: '+2.037', category: 'GT3' },
  { position: 15, number: 55, rank: 14, name: 'Beretta', pitStops: 15, vehicle: 'Porsche 911 GT3 R (992) Evo26', s1Time: '41.117', gapToCategoryBehind: '-0.155', category: 'GT3' },
  { position: 16, number: 123, rank: 15, name: 'Brundle', pitStops: 15, vehicle: 'Porsche 911 GT3 R (992) Evo26', s1Time: '41.345', gapToCategoryBehind: '+0.228', category: 'GT3' },
  { position: 17, number: 26, rank: 16, name: 'Grenier', pitStops: 16, vehicle: 'Mercedes-AMG GT3', s1Time: '41.975', gapToCategoryBehind: '+0.630', category: 'GT3' },
  { position: 18, number: 30, rank: 17, name: 'Cho', pitStops: 15, vehicle: 'Porsche 911 GT3 R (992) Evo26', s1Time: '41.567', gapToCategoryBehind: '-0.408', category: 'GT3' },
  { position: 19, number: 86, rank: 18, name: 'Fjordbach', pitStops: 15, vehicle: 'Porsche 911 GT3 R (992) Evo26', s1Time: '41.234', gapToCategoryBehind: '-0.333', category: 'GT3' },
  { position: 20, number: 4, rank: 19, name: 'Fontana', pitStops: 16, vehicle: 'Porsche 911 GT3 R (992) Evo26', s1Time: '41.678', gapToCategoryBehind: '+0.444', category: 'GT3' },
  // Cup 2
  { position: 21, number: 900, rank: 1, name: 'Meijer', pitStops: 14, vehicle: 'Porsche 911 GT3 Cup (992)', s1Time: '41.068', gapToCategoryBehind: '', category: 'Cup2' },
  { position: 22, number: 902, rank: 2, name: 'Wassertheurer', pitStops: 14, vehicle: 'Porsche 911 GT3 Cup (992)', s1Time: '41.468', gapToCategoryBehind: '+0.400', category: 'Cup2' },
  // GT4
  { position: 32, number: 888, rank: 1, name: 'Wolter', pitStops: 13, vehicle: 'BMW M4 GT4 EVO (G82)', s1Time: '44.456', gapToCategoryBehind: '', category: 'GT4' },
  { position: 33, number: 145, rank: 2, name: 'Bleekemolen', pitStops: 14, vehicle: 'BMW M4 GT4 EVO (G82)', s1Time: '45.123', gapToCategoryBehind: '+0.667', category: 'GT4' },
  // TCR
  { position: 28, number: 61, rank: 2, name: 'Arnold', pitStops: 15, vehicle: 'HWA EVO.R', s1Time: '3:55.718', gapToCategoryBehind: '+5.889', category: 'TCR' },
  { position: 62, number: 830, rank: 1, name: 'Basseng', pitStops: 16, vehicle: 'Hyundai Motor Company ELANTRA N TCR', s1Time: '42.123', gapToCategoryBehind: '', category: 'TCR' },
];

// Estado mutable de la carrera
let currentRaceData: RaceEntrant[] = [...INITIAL_RACE_DATA];
let lastUpdateTime: Date = new Date();

/**
 * Simula cambios realistas en los datos de carrera
 */
function simulateRaceUpdate(): RaceEntrant[] {
  const updatedData = currentRaceData.map((entrant) => {
    // Simular cambio en pit stops (10% probabilidad)
    const newPitStops = Math.random() < 0.1 ? entrant.pitStops + 1 : entrant.pitStops;
    
    // Simular cambio en tiempo S1 (variación realista de ±0.5s)
    const s1Parts = entrant.s1Time.split(':');
    let baseSeconds = 0;
    if (s1Parts.length === 2) {
      const minutes = parseInt(s1Parts[0] ?? '0') || 0;
      const secondsParts = (s1Parts[1] ?? '0').split('.');
      const sec = parseInt(secondsParts[0] ?? '0') || 0;
      const ms = parseInt(secondsParts[1] ?? '0') || 0;
      baseSeconds = minutes * 60 + sec + ms / 1000;
    } else {
      const secondsParts = entrant.s1Time.split('.');
      const sec = parseInt(secondsParts[0] ?? '0') || 0;
      const ms = parseInt(secondsParts[1] ?? '0') || 0;
      baseSeconds = sec + ms / 1000;
    }
    
    const variation = (Math.random() - 0.5) * 1.0; // ±0.5 segundos
    const newSeconds = Math.max(30, baseSeconds + variation);
    
    let newS1Time: string;
    if (newSeconds >= 60) {
      const minutes = Math.floor(newSeconds / 60);
      const remaining = newSeconds % 60;
      newS1Time = `${minutes}:${remaining.toFixed(3).padStart(6, '0')}`;
    } else {
      newS1Time = newSeconds.toFixed(3);
    }
    
    return {
      ...entrant,
      pitStops: newPitStops,
      s1Time: newS1Time,
    };
  });
  
  // Simular cambios de posición ocasionales (5% probabilidad)
  if (Math.random() < 0.05 && updatedData.length > 1) {
    const idx1 = Math.floor(Math.random() * updatedData.length);
    let idx2 = Math.floor(Math.random() * updatedData.length);
    while (idx2 === idx1) {
      idx2 = Math.floor(Math.random() * updatedData.length);
    }
    
    // Intercambiar posiciones
    const tempPos = updatedData[idx1]!.position;
    updatedData[idx1]!.position = updatedData[idx2]!.position;
    updatedData[idx2]!.position = tempPos;
    
    // Reordenar por posición
    updatedData.sort((a, b) => a.position - b.position);
    
    // Actualizar ranks
    updatedData.forEach((entrant, index) => {
      entrant.rank = index + 1;
    });
  }
  
  return updatedData;
}

/**
 * Obtiene los datos actuales de la carrera
 */
export function getRaceData(): RaceEntrant[] {
  return [...currentRaceData];
}

/**
 * Obtiene la última hora de actualización
 */
export function getLastUpdateTime(): Date {
  return lastUpdateTime;
}

/**
 * Actualiza los datos de la carrera (simulación)
 */
export function updateRaceData(): RaceEntrant[] {
  currentRaceData = simulateRaceUpdate();
  lastUpdateTime = new Date();
  return [...currentRaceData];
}

/**
 * Inicializa el servicio de datos
 */
export function initRaceDataService(): void {
  currentRaceData = [...INITIAL_RACE_DATA];
  lastUpdateTime = new Date();
}

// Inicializar al cargar el módulo
initRaceDataService();
