'use client';

import { useMemo } from 'react';
import { useLanguage } from './LanguageContext';
import type { RaceEntrant } from './RaceLeaderboard';
import { Trophy, Timer, Gauge, Users, Car } from 'lucide-react';

interface StatsPanelProps {
  raceData: RaceEntrant[];
}

interface RaceStats {
  totalEntrants: number;
  totalPitStops: number;
  fastestLap: string;
  fastestDriver: string;
  categoryLeaders: { category: string; driver: string; time: string }[];
}

export default function StatsPanel({ raceData }: StatsPanelProps) {
  const { t } = useLanguage();

  const stats: RaceStats = useMemo(() => {
    if (!raceData || raceData.length === 0) {
      return {
        totalEntrants: 0,
        totalPitStops: 0,
        fastestLap: '--:--.---',
        fastestDriver: '-',
        categoryLeaders: [],
      };
    }

    // Calculate total entrants
    const totalEntrants = raceData.length;

    // Calculate total pit stops
    const totalPitStops = raceData.reduce((sum, entrant) => sum + entrant.pitStops, 0);

    // Find fastest S1 time
    let fastestTime = Infinity;
    let fastestDriver = '';
    raceData.forEach((entrant) => {
      const s1Parts = entrant.s1Time.split(':');
      let seconds = 0;
      if (s1Parts.length === 2) {
        const minutes = parseInt(s1Parts[0] || '0', 10);
        const secondsParts = (s1Parts[1] || '0').split('.');
        const sec = parseInt(secondsParts[0] || '0', 10);
        const ms = parseInt(secondsParts[1] || '0', 10);
        seconds = minutes * 60 + sec + ms / 1000;
      } else {
        const secondsParts = entrant.s1Time.split('.');
        const sec = parseInt(secondsParts[0] || '0', 10);
        const ms = parseInt(secondsParts[1] || '0', 10);
        seconds = sec + ms / 1000;
      }

      if (seconds > 0 && seconds < fastestTime) {
        fastestTime = seconds;
        fastestDriver = entrant.name;
      }
    });

    // Format fastest lap time
    let fastestLap = '--:--.---';
    if (fastestTime !== Infinity) {
      if (fastestTime >= 60) {
        const minutes = Math.floor(fastestTime / 60);
        const remaining = fastestTime % 60;
        fastestLap = `${minutes}:${remaining.toFixed(3).padStart(6, '0')}`;
      } else {
        fastestLap = fastestTime.toFixed(3);
      }
    }

    // Get category leaders (first position in each category)
    const categories = ['GT3', 'GT4', 'Cup2', 'TCR'];
    const categoryLeaders: { category: string; driver: string; time: string }[] = [];

    categories.forEach((category) => {
      const categoryEntrants = raceData.filter((e) => e.category === category);
      if (categoryEntrants.length > 0) {
        // Sort by position to get the leader
        categoryEntrants.sort((a, b) => a.position - b.position);
        const leader = categoryEntrants[0]!;
        categoryLeaders.push({
          category,
          driver: leader.name,
          time: leader.s1Time,
        });
      }
    });

    return {
      totalEntrants,
      totalPitStops,
      fastestLap,
      fastestDriver,
      categoryLeaders,
    };
  }, [raceData]);

  const StatItem = ({
    icon: Icon,
    label,
    value,
    subValue,
  }: {
    icon: React.ElementType;
    label: string;
    value: string;
    subValue?: string;
  }) => (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-racing-red/10 rounded-lg">
        <Icon className="w-5 h-5 text-racing-red" />
      </div>
      <div>
        <p className="text-xs text-racing-muted uppercase tracking-wide">{label}</p>
        <p className="text-lg font-bold text-white">{value}</p>
        {subValue && <p className="text-xs text-racing-muted">{subValue}</p>}
      </div>
    </div>
  );

  return (
    <div className="bg-racing-dark rounded-lg border border-racing-light/10 p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white">{t('Estadísticas de Carrera', 'Race Statistics')}</h3>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatItem
          icon={Users}
          label={t('Participantes', 'Entrants')}
          value={stats.totalEntrants.toString()}
        />
        <StatItem
          icon={Gauge}
          label={t('Paradas en Boxes', 'Pit Stops')}
          value={stats.totalPitStops.toString()}
        />
        <StatItem
          icon={Timer}
          label={t('Vuelta Rápida S1', 'Fastest S1')}
          value={stats.fastestLap}
          subValue={stats.fastestDriver}
        />
        <StatItem
          icon={Trophy}
          label={t('Categorías', 'Categories')}
          value={stats.categoryLeaders.length.toString()}
        />
      </div>

      {/* Category Leaders */}
      {stats.categoryLeaders.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-racing-muted mb-3">
            {t('Líderes por Categoría', 'Category Leaders')}
          </h4>
          <div className="space-y-2">
            {stats.categoryLeaders.map((leader) => (
              <div
                key={leader.category}
                className="flex items-center justify-between bg-racing-darker/50 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-racing-red" />
                  <span className="text-sm font-medium text-white">{leader.category}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-racing-muted">{leader.driver}</span>
                  <span className="text-xs text-semantic-success ml-2 font-mono">{leader.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Update */}
      <p className="text-xs text-racing-muted text-right">
        {t('Actualizado', 'Updated')}: {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
}