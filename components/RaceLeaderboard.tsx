'use client';

import { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { ChevronUp, ChevronDown, ArrowUpDown, Timer, Gauge } from 'lucide-react';

export interface RaceEntrant {
  position: number;      // Pos.
  number: number;         // No.
  rank: number;           // Rank (clasificación general)
  name: string;           // Name (equipo/pilotos)
  pitStops: number;       // Pit (paradas en boxes)
  vehicle: string;        // Vehicle
  s1Time: string;         // S1 time (tiempo sector 1)
  gapToCategoryBehind: string; // Diferencia con vehículo de su categoría detrás
  category: string;       // Categoría del auto
}

const mockRaceData: RaceEntrant[] = [
  { position: 1, number: 3, rank: 1, name: 'Verstappen', pitStops: 15, vehicle: 'Mercedes-AMG GT3', s1Time: '2:44.123', gapToCategoryBehind: '', category: 'GT3' },
  { position: 2, number: 80, rank: 2, name: 'Stolz', pitStops: 15, vehicle: 'Mercedes-AMG GT3', s1Time: '2:44.567', gapToCategoryBehind: '+0.444', category: 'GT3' },
  { position: 3, number: 34, rank: 3, name: 'Drudi', pitStops: 16, vehicle: 'Aston Martin Vantage AMR GT3 EVO', s1Time: '2:43.891', gapToCategoryBehind: '-0.676', category: 'GT3' },
  { position: 4, number: 99, rank: 4, name: 'Hesse', pitStops: 15, vehicle: 'BMW M4 GT3 EVO', s1Time: '2:45.234', gapToCategoryBehind: '+1.343', category: 'GT3' },
  { position: 5, number: 84, rank: 5, name: 'Niederhauser', pitStops: 17, vehicle: 'Lamborghini Huracan GT3 EVO2', s1Time: '2:42.456', gapToCategoryBehind: '-2.778', category: 'GT3' },
  { position: 6, number: 81, rank: 1, name: 'Verhagen', pitStops: 16, vehicle: 'BMW M3 Touring 24h', s1Time: '2:44.891', gapToCategoryBehind: '', category: 'TCR' },
  { position: 7, number: 24, rank: 6, name: 'Feller', pitStops: 15, vehicle: 'Porsche 911 GT3 R (992) Evo26', s1Time: '2:43.678', gapToCategoryBehind: '+0.787', category: 'GT3' },
  { position: 8, number: 54, rank: 7, name: 'Buus', pitStops: 15, vehicle: 'Porsche 911 GT3 R (992) Evo26', s1Time: '2:46.123', gapToCategoryBehind: '+2.445', category: 'GT3' },
  { position: 9, number: 67, rank: 8, name: 'Olsen', pitStops: 15, vehicle: 'Ford Mustang GT3 EVO (2026)', s1Time: '2:43.234', gapToCategoryBehind: '-2.889', category: 'GT3' },
  { position: 10, number: 48, rank: 9, name: 'Arrow', pitStops: 15, vehicle: 'Porsche 911 GT3 R (992) Evo26', s1Time: '2:45.678', gapToCategoryBehind: '+2.444', category: 'GT3' },
  { position: 11, number: 77, rank: 10, name: 'Wittmann', pitStops: 16, vehicle: 'BMW M4 GT3 EVO', s1Time: '2:44.345', gapToCategoryBehind: '-1.333', category: 'GT3' },
  { position: 12, number: 130, rank: 11, name: 'Mapelli', pitStops: 15, vehicle: 'Lamborghini Huracan GT3 EVO2', s1Time: '2:42.789', gapToCategoryBehind: '-1.556', category: 'GT3' },
  { position: 13, number: 18, rank: 12, name: 'Hill', pitStops: 15, vehicle: 'Porsche 911 GT3 R (992) Evo26', s1Time: '2:47.234', gapToCategoryBehind: '+4.445', category: 'GT3' },
  { position: 14, number: 69, rank: 13, name: 'Scheider', pitStops: 15, vehicle: 'McLaren 720S-GT3', s1Time: '2:45.123', gapToCategoryBehind: '-2.111', category: 'GT3' },
  { position: 15, number: 55, rank: 14, name: 'Beretta', pitStops: 15, vehicle: 'Porsche 911 GT3 R (992) Evo26', s1Time: '2:46.567', gapToCategoryBehind: '+1.444', category: 'GT3' },
  { position: 16, number: 123, rank: 15, name: 'Brundle', pitStops: 15, vehicle: 'Porsche 911 GT3 R (992) Evo26', s1Time: '2:47.890', gapToCategoryBehind: '+1.323', category: 'GT3' },
  { position: 17, number: 26, rank: 16, name: 'Grenier', pitStops: 16, vehicle: 'Mercedes-AMG GT3', s1Time: '2:44.456', gapToCategoryBehind: '-3.434', category: 'GT3' },
  { position: 18, number: 30, rank: 17, name: 'Cho', pitStops: 15, vehicle: 'Porsche 911 GT3 R (992) Evo26', s1Time: '2:47.567', gapToCategoryBehind: '+3.111', category: 'GT3' },
  { position: 19, number: 86, rank: 18, name: 'Fjordbach', pitStops: 15, vehicle: 'Porsche 911 GT3 R (992) Evo26', s1Time: '2:46.234', gapToCategoryBehind: '-1.333', category: 'GT3' },
  { position: 20, number: 4, rank: 19, name: 'Fontana', pitStops: 16, vehicle: 'Porsche 911 GT3 R (992) Evo26', s1Time: '2:47.678', gapToCategoryBehind: '+1.444', category: 'GT3' },
  // Cup 2
  { position: 21, number: 900, rank: 1, name: 'Meijer', pitStops: 14, vehicle: 'Porsche 911 GT3 Cup (992)', s1Time: '2:50.234', gapToCategoryBehind: '', category: 'Cup2' },
  // GT4
  { position: 32, number: 888, rank: 1, name: 'Wolter', pitStops: 13, vehicle: 'BMW M4 GT4 EVO (G82)', s1Time: '2:58.456', gapToCategoryBehind: '', category: 'GT4' },
  { position: 33, number: 145, rank: 2, name: 'Bleekemolen', pitStops: 14, vehicle: 'BMW M4 GT4 EVO (G82)', s1Time: '2:59.123', gapToCategoryBehind: '+0.667', category: 'GT4' },
  // TCR
  { position: 28, number: 61, rank: 2, name: 'Adelson', pitStops: 14, vehicle: 'HWA EVO.R', s1Time: '2:54.789', gapToCategoryBehind: '+5.889', category: 'TCR' },
  { position: 62, number: 830, rank: 1, name: 'Basseng', pitStops: 16, vehicle: 'Hyundai Motor Company ELANTRA N TCR', s1Time: '2:54.123', gapToCategoryBehind: '', category: 'TCR' },
];

interface RaceLeaderboardProps {
  entrants?: RaceEntrant[];
  sortBy?: string;
}

export default function RaceLeaderboard({ entrants = mockRaceData }: RaceLeaderboardProps) {
  const { t } = useLanguage();
  const [sortConfig, setSortConfig] = useState<{ key: keyof RaceEntrant; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: keyof RaceEntrant) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedEntrants = [...entrants].sort((a, b) => {
    if (!sortConfig) return a.position - b.position;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ column }: { column: keyof RaceEntrant }) => {
    if (sortConfig?.key !== column) {
      return <ArrowUpDown className="w-3 h-3 ml-1 opacity-30" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-3 h-3 ml-1 text-racing-red" />
      : <ChevronDown className="w-3 h-3 ml-1 text-racing-red" />;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'GT3': return 'bg-racing-red/20 text-racing-red';
      case 'GT4': return 'bg-semantic-success/20 text-semantic-success';
      case 'Cup2': return 'bg-blue-500/20 text-blue-400';
      case 'TCR': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-racing-muted/20 text-racing-muted';
    }
  };

  return (
    <div className="bg-racing-darker rounded-lg border border-racing-light/10 overflow-hidden">
      {/* Table Header */}
      <div className="bg-racing-dark/50 border-b border-racing-light/10">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-semibold text-racing-muted uppercase">
          <button onClick={() => handleSort('position')} className="flex items-center hover:text-white transition-colors">
            {t('Pos.', 'Pos.')}<SortIcon column="position" />
          </button>
          <button onClick={() => handleSort('number')} className="flex items-center hover:text-white transition-colors">
            {t('No.', 'No.')}<SortIcon column="number" />
          </button>
          <button onClick={() => handleSort('rank')} className="flex items-center hover:text-white transition-colors">
            {t('Rank', 'Rank')}<SortIcon column="rank" />
          </button>
          <div className="col-span-3">{t('Nombre', 'Name')}</div>
          <button onClick={() => handleSort('s1Time')} className="flex items-center hover:text-white transition-colors">
            <Timer className="w-3 h-3 mr-1" />{t('S1', 'S1')}<SortIcon column="s1Time" />
          </button>
          <button onClick={() => handleSort('pitStops')} className="flex items-center hover:text-white transition-colors">
            <Gauge className="w-3 h-3 mr-1" />{t('Pit', 'Pit')}<SortIcon column="pitStops" />
          </button>
          <div className="col-span-2">{t('Vehículo', 'Vehicle')}</div>
          <div>{t('Diferencia', 'Gap')}</div>
        </div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-racing-light/10 max-h-[600px] overflow-y-auto">
        {sortedEntrants.map((entrant) => (
          <div
            key={`${entrant.number}-${entrant.position}`}
            className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-racing-dark/30 transition-colors cursor-pointer"
          >
            {/* Position */}
            <div className={`font-bold text-sm ${entrant.position <= 3 ? 'text-racing-red' : entrant.position <= 10 ? 'text-semantic-success' : 'text-white'}`}>
              {entrant.position}
            </div>

            {/* Number */}
            <div className="text-white font-mono text-sm font-bold">
              {entrant.number}
            </div>

            {/* Rank */}
            <div className="text-racing-muted font-mono text-sm">
              {entrant.rank}
            </div>

            {/* Name */}
            <div className="col-span-3">
              <p className="font-semibold text-white text-sm truncate">{entrant.name}</p>
              <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${getCategoryColor(entrant.category)}`}>
                {entrant.category}
              </span>
            </div>

            {/* S1 Time */}
            <div className="text-semantic-success font-mono text-sm">
              {entrant.s1Time}
            </div>

            {/* Pit Stops */}
            <div className="text-white font-mono text-sm">
              {entrant.pitStops}
            </div>

            {/* Vehicle */}
            <div className="col-span-2 text-racing-muted text-xs truncate" title={entrant.vehicle}>
              {entrant.vehicle}
            </div>

            {/* Gap to Category Behind */}
            <div className={`font-mono text-sm ${entrant.gapToCategoryBehind.startsWith('+') ? 'text-semantic-warning' : entrant.gapToCategoryBehind.startsWith('-') ? 'text-semantic-success' : 'text-racing-muted'}`}>
              {entrant.gapToCategoryBehind || '-'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}