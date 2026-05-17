'use client';

import { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';

interface TeamStanding {
  rank: number;
  teamName: string;
  drivers: string[];
  position: number;
  lapsCompleted: number;
  gapToLeader: string;
  predictedFinish: number;
  finishProbability: number;
  status: 'running' | 'pit' | 'finished' | 'dnf';
}

const mockTeams: TeamStanding[] = [
  {
    rank: 1,
    teamName: 'Falken Motorsports',
    drivers: ['A. Murray', 'T. Blqvist', 'M. Werner'],
    position: 1,
    lapsCompleted: 487,
    gapToLeader: 'Leader',
    predictedFinish: 1,
    finishProbability: 92,
    status: 'running',
  },
  {
    rank: 2,
    teamName: 'BMW M Motorsport',
    drivers: ['M. van der Linde', 'A. Farfus', 'M. Hesse'],
    position: 3,
    lapsCompleted: 486,
    gapToLeader: '+1L',
    predictedFinish: 2,
    finishProbability: 67,
    status: 'pit',
  },
  {
    rank: 3,
    teamName: 'Porsche 911 GT3 R',
    drivers: ['M. J. Christensen', 'L. Vanthoor', 'K. Bachler'],
    position: 2,
    lapsCompleted: 487,
    gapToLeader: '+0.5L',
    predictedFinish: 3,
    finishProbability: 78,
    status: 'running',
  },
  {
    rank: 4,
    teamName: 'Mercedes-AMG Team',
    drivers: ['M. Goetz', 'B. M. Schmidt', 'F. Widmer'],
    position: 4,
    lapsCompleted: 485,
    gapToLeader: '+2L',
    predictedFinish: 5,
    finishProbability: 45,
    status: 'running',
  },
  {
    rank: 5,
    teamName: 'Audi Sport Team',
    drivers: ['R. Rast', 'N. Lapierre', 'M. Vaidis'],
    position: 5,
    lapsCompleted: 484,
    gapToLeader: '+3L',
    predictedFinish: 4,
    finishProbability: 52,
    status: 'running',
  },
];

interface RaceLeaderboardProps {
  teams?: TeamStanding[];
  sortBy?: 'position' | 'probability' | 'confidence';
  showPredictions?: boolean;
}

export default function RaceLeaderboard({
  teams = mockTeams,
  showPredictions = true,
}: RaceLeaderboardProps) {
  const { t } = useLanguage();
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedTeams = [...teams].sort((a, b) => {
    if (!sortConfig) return a.rank - b.rank;
    const aValue = a[sortConfig.key as keyof TeamStanding];
    const bValue = b[sortConfig.key as keyof TeamStanding];
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig?.key !== column) {
      return <ArrowUpDown className="w-3 h-3 ml-1 opacity-30" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-3 h-3 ml-1" />
      : <ChevronDown className="w-3 h-3 ml-1" />;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'running': return t('En Pista', 'Running');
      case 'pit': return t('En Boxes', 'Pit');
      case 'finished': return t('Finalizado', 'Finished');
      case 'dnf': return t('DNF', 'DNF');
      default: return status.toUpperCase();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-semantic-success/20 text-semantic-success';
      case 'pit':
        return 'bg-semantic-warning/20 text-semantic-warning';
      case 'finished':
        return 'bg-racing-red/20 text-racing-red';
      case 'dnf':
        return 'bg-semantic-danger/20 text-semantic-danger';
      default:
        return 'bg-racing-muted/20 text-racing-muted';
    }
  };

  return (
    <div className="bg-racing-darker rounded-lg border border-racing-light/10 overflow-hidden">
      {/* Table Header */}
      <div className="bg-racing-dark/50 border-b border-racing-light/10">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 text-xs font-semibold text-racing-muted uppercase">
          <button onClick={() => handleSort('rank')} className="flex items-center hover:text-white transition-colors">
            {t('Pos', 'Rank')}<SortIcon column="rank" />
          </button>
          <div className="col-span-3">{t('Equipo', 'Team')}</div>
          <button onClick={() => handleSort('position')} className="flex items-center hover:text-white transition-colors">
            {t('Puesto', 'Pos')}<SortIcon column="position" />
          </button>
          <button onClick={() => handleSort('lapsCompleted')} className="flex items-center hover:text-white transition-colors">
            {t('Vueltas', 'Laps')}<SortIcon column="lapsCompleted" />
          </button>
          <div>{t('Diferencia', 'Gap')}</div>
          {showPredictions && (
            <button onClick={() => handleSort('predictedFinish')} className="flex items-center hover:text-white transition-colors">
              {t('Pred', 'Pred')}<SortIcon column="predictedFinish" />
            </button>
          )}
          {showPredictions && (
            <button onClick={() => handleSort('finishProbability')} className="flex items-center hover:text-white transition-colors">
              {t('Prob', 'Prob')}<SortIcon column="finishProbability" />
            </button>
          )}
          <button onClick={() => handleSort('status')} className="flex items-center hover:text-white transition-colors">
            {t('Estado', 'Status')}<SortIcon column="status" />
          </button>
        </div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-racing-light/10">
        {sortedTeams.map((team) => (
          <div
            key={team.rank}
            className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-racing-dark/30 transition-colors"
          >
            {/* Rank */}
            <div className="text-white font-bold">{team.rank}</div>

            {/* Team */}
            <div className="col-span-3">
              <p className="font-semibold text-white">{team.teamName}</p>
              <p className="text-xs text-racing-muted">
                {team.drivers.slice(0, 2).join(', ')}
                {team.drivers.length > 2 && '...'}
              </p>
            </div>

            {/* Position */}
            <div className={`font-bold text-lg ${team.position <= 3 ? 'text-semantic-success' : 'text-white'}`}>
              #{team.position}
            </div>

            {/* Laps */}
            <div className="text-white font-mono">{team.lapsCompleted}</div>

            {/* Gap */}
            <div className="text-racing-muted">{team.gapToLeader}</div>

            {/* Prediction */}
            {showPredictions && (
              <div className="bg-racing-red/20 text-racing-red px-2 py-1 rounded text-sm font-mono text-center">
                #{team.predictedFinish}
              </div>
            )}

            {/* Probability */}
            {showPredictions && (
              <div className={`font-bold ${team.finishProbability > 75 ? 'text-semantic-success' : team.finishProbability > 50 ? 'text-semantic-warning' : 'text-racing-muted'}`}>
                {team.finishProbability}%
              </div>
            )}

            {/* Status */}
            <div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(team.status)}`}>
                {getStatusLabel(team.status)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}