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

// Datos basados en liveticker oficial 24h-rennen.de (17 mayo 2026)
// S1 times en formato SS.mmm (sector time ~40-45s para Nordschleife)
// Gaps calculados contra el líder de cada categoría
// Pilotos confirmados del liveticker oficial
const INITIAL_RACE_DATA: RaceEntrant[] = [
  // GT3 - Leader: #16 Haase (Audi) 40.141s
  { position: 1, number: 16, rank: 1, name: 'Haase', pitStops: 16, vehicle: 'Audi R8 LMS GT3 evo II', s1Time: '40.141', gapToCategoryBehind: '', category: 'GT3' },
  { position: 2, number: 84, rank: 2, name: 'Niederhauser', pitStops: 17, vehicle: 'Lamborghini Huracan GT3 EVO2', s1Time: '40.385', gapToCategoryBehind: '+0.244', category: 'GT3' },
  { position: 3, number: 80, rank: 3, name: 'Stolz', pitStops: 16, vehicle: 'Mercedes-AMG GT3', s1Time: '40.580', gapToCategoryBehind: '+0.439', category: 'GT3' },
  { position: 4, number: 3, rank: 4, name: 'Verstappen', pitStops: 16, vehicle: 'Mercedes-AMG GT3', s1Time: '40.847', gapToCategoryBehind: '+0.706', category: 'GT3' },
  { position: 5, number: 23, rank: 5, name: 'Zsigo', pitStops: 15, vehicle: 'BMW M4 GT3 EVO', s1Time: '40.988', gapToCategoryBehind: '+0.847', category: 'GT3' },
  { position: 6, number: 67, rank: 6, name: 'Mies', pitStops: 16, vehicle: 'Ford Mustang GT3', s1Time: '41.016', gapToCategoryBehind: '+0.875', category: 'GT3' },
  { position: 7, number: 48, rank: 7, name: 'Arrow', pitStops: 15, vehicle: 'Porsche 911 GT3 R (992) Evo26', s1Time: '41.117', gapToCategoryBehind: '+0.976', category: 'GT3' },
  { position: 8, number: 99, rank: 8, name: 'Hesse', pitStops: 16, vehicle: 'BMW M4 GT3 EVO', s1Time: '41.234', gapToCategoryBehind: '+1.093', category: 'GT3' },
  { position: 9, number: 24, rank: 9, name: 'Feller', pitStops: 15, vehicle: 'Porsche 911 GT3 R (992) Evo26', s1Time: '41.272', gapToCategoryBehind: '+1.131', category: 'GT3' },
  { position: 10, number: 54, rank: 10, name: 'Sturm', pitStops: 15, vehicle: 'Porsche 911 GT3 R (992) Evo26', s1Time: '41.345', gapToCategoryBehind: '+1.204', category: 'GT3' },
  { position: 11, number: 77, rank: 11, name: 'Wittmann', pitStops: 17, vehicle: 'BMW M4 GT3 EVO', s1Time: '41.468', gapToCategoryBehind: '+1.327', category: 'GT3' },
  { position: 12, number: 130, rank: 12, name: 'Mapelli', pitStops: 15, vehicle: 'Lamborghini Huracan GT3 EVO2', s1Time: '41.567', gapToCategoryBehind: '+1.426', category: 'GT3' },
  { position: 13, number: 18, rank: 13, name: 'Hill', pitStops: 15, vehicle: 'Porsche 911 GT3 R (992) Evo26', s1Time: '41.678', gapToCategoryBehind: '+1.537', category: 'GT3' },
  { position: 14, number: 69, rank: 14, name: 'Dörr', pitStops: 16, vehicle: 'McLaren 720S-GT3', s1Time: '41.975', gapToCategoryBehind: '+1.834', category: 'GT3' },
  { position: 15, number: 55, rank: 15, name: 'Beretta', pitStops: 15, vehicle: 'Porsche 911 GT3 R (992) Evo26', s1Time: '42.123', gapToCategoryBehind: '+1.982', category: 'GT3' },
  { position: 16, number: 123, rank: 16, name: 'Brundle', pitStops: 15, vehicle: 'Porsche 911 GT3 R (992) Evo26', s1Time: '42.234', gapToCategoryBehind: '+2.093', category: 'GT3' },
  { position: 17, number: 26, rank: 17, name: 'Grenier', pitStops: 16, vehicle: 'Mercedes-AMG GT3', s1Time: '42.456', gapToCategoryBehind: '+2.315', category: 'GT3' },
  { position: 18, number: 30, rank: 18, name: 'Cho', pitStops: 15, vehicle: 'Porsche 911 GT3 R (992) Evo26', s1Time: '42.567', gapToCategoryBehind: '+2.426', category: 'GT3' },
  { position: 19, number: 86, rank: 19, name: 'Fjordbach', pitStops: 15, vehicle: 'Porsche 911 GT3 R (992) Evo26', s1Time: '42.678', gapToCategoryBehind: '+2.537', category: 'GT3' },
  { position: 20, number: 4, rank: 20, name: 'Fontana', pitStops: 16, vehicle: 'Porsche 911 GT3 R (992) Evo26', s1Time: '42.789', gapToCategoryBehind: '+2.648', category: 'GT3' },
  // TCR - Leader: #830 Basseng 42.123s
  { position: 28, number: 830, rank: 1, name: 'Basseng', pitStops: 16, vehicle: 'Hyundai Motor Company ELANTRA N TCR', s1Time: '42.123', gapToCategoryBehind: '', category: 'TCR' },
  { position: 35, number: 61, rank: 2, name: 'Arnold', pitStops: 15, vehicle: 'HWA EVO.R', s1Time: '42.994', gapToCategoryBehind: '+0.871', category: 'TCR' },
  // Cup 2 - Leader: #900 Meijer 41.068s
  { position: 21, number: 900, rank: 1, name: 'Meijer', pitStops: 14, vehicle: 'Porsche 911 GT3 Cup (992)', s1Time: '41.068', gapToCategoryBehind: '', category: 'Cup2' },
  { position: 22, number: 902, rank: 2, name: 'Wassertheurer', pitStops: 14, vehicle: 'Porsche 911 GT3 Cup (992)', s1Time: '41.468', gapToCategoryBehind: '+0.400', category: 'Cup2' },
  // GT4 - Leader: #888 Wolter 44.456s
  { position: 32, number: 888, rank: 1, name: 'Wolter', pitStops: 13, vehicle: 'BMW M4 GT4 EVO (G82)', s1Time: '44.456', gapToCategoryBehind: '', category: 'GT4' },
  { position: 33, number: 145, rank: 2, name: 'Bleekemolen', pitStops: 14, vehicle: 'BMW M4 GT4 EVO (G82)', s1Time: '45.123', gapToCategoryBehind: '+0.667', category: 'GT4' },
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
