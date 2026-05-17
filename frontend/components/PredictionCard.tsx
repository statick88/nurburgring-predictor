'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

interface PredictionCardProps {
  teamId: string;
  teamName: string;
  driverNames: string[];
  category: string;
  currentPosition: number;
  predictedFinishPosition: number;
  finishProbability: number;
  topFiveOdds: number;
  dnfProbability: number;
  lastUpdated: Date;
}

export default function PredictionCard({
  teamName,
  driverNames,
  category,
  currentPosition,
  predictedFinishPosition,
  finishProbability,
  topFiveOdds,
  dnfProbability,
  lastUpdated,
}: PredictionCardProps) {
  const { t, language } = useLanguage();
  const [timeAgo, setTimeAgo] = useState(language === 'es' ? 'hace 0s' : '0s ago');

  useEffect(() => {
    const updateTime = () => {
      const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
      if (language === 'es') {
        setTimeAgo(seconds < 60 ? `hace ${seconds}s` : `hace ${Math.floor(seconds / 60)}m`);
      } else {
        setTimeAgo(seconds < 60 ? `${seconds}s ago` : `${Math.floor(seconds / 60)}m ago`);
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated, language]);

  const getConfidenceColor = (probability: number) => {
    if (probability > 75) return 'text-semantic-success';
    if (probability > 50) return 'text-semantic-warning';
    return 'text-racing-muted';
  };

  const getDnfColor = (probability: number) => {
    if (probability < 0.05) return 'text-semantic-success';
    if (probability < 0.10) return 'text-semantic-warning';
    return 'text-semantic-error';
  };

  const getCategoryBadgeStyle = (cat: string) => {
    switch (cat) {
      case 'GT3': return 'bg-racing-red/20 text-racing-red border-racing-red/30';
      case 'TCR': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'GT4': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Cup2': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-racing-muted/20 text-racing-muted border-racing-muted/30';
    }
  };

  const getFinishTrend = (current: number, predicted: number) => {
    if (predicted < current) return { label: t('Sube', 'Up'), color: 'text-semantic-success', icon: '▲' };
    if (predicted > current) return { label: t('Baja', 'Down'), color: 'text-semantic-error', icon: '▼' };
    return { label: t('Estable', 'Stable'), color: 'text-racing-muted', icon: '●' };
  };

  const trend = getFinishTrend(currentPosition, predictedFinishPosition);

  return (
    <div className="bg-racing-dark rounded-lg border border-racing-light/10 hover:border-racing-red/30 transition-colors">
      {/* Header */}
      <div className="p-4 sm:p-6 pb-3 sm:pb-4">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-bold text-base sm:text-lg text-white truncate">{teamName}</h3>
              <span className={`text-[10px] sm:text-xs font-mono px-1.5 sm:px-2 py-0.5 rounded border flex-shrink-0 ${getCategoryBadgeStyle(category)}`}>
                {category}
              </span>
            </div>
            <p className="text-xs text-racing-muted truncate">
              {t('Pilotos', 'Drivers')}: {driverNames.join(', ')}
            </p>
          </div>
          <span className="text-[10px] sm:text-xs text-racing-muted bg-racing-darker px-2 py-1 rounded flex-shrink-0">
            {timeAgo}
          </span>
        </div>
      </div>

      {/* Position Metrics - 2 cols mobile, 4 cols desktop */}
      <div className="px-4 sm:px-6 pb-3 sm:pb-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <MetricBox
            label={t('Actual', 'Current')}
            value={`#${currentPosition}`}
            color="text-white"
          />
          <MetricBox
            label={t('Predicho', 'Predicted')}
            value={`#${predictedFinishPosition}`}
            color="text-racing-red"
            borderColor="border-racing-red/30"
          />
          <MetricBox
            label={t('Confianza', 'Confidence')}
            value={`${finishProbability}%`}
            color={getConfidenceColor(finishProbability)}
          />
          <MetricBox
            label="DNF"
            value={`${(dnfProbability * 100).toFixed(1)}%`}
            color={getDnfColor(dnfProbability)}
          />
        </div>
      </div>

      {/* Trend + Probability Bar */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3">
        {/* Trend */}
        <div className="flex items-center gap-2">
          <span className={`text-xs sm:text-sm font-medium ${trend.color}`}>
            {trend.icon} {trend.label} {Math.abs(predictedFinishPosition - currentPosition)} {t('pos.', 'pos.')}
          </span>
        </div>

        {/* Probability Bar */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-racing-muted">{t('Prob. Top-5', 'Top-5 Prob.')}</span>
            <span className="text-xs sm:text-sm font-mono text-racing-red">{topFiveOdds}%</span>
          </div>
          <div className="w-full bg-racing-darker rounded-full h-1.5 sm:h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-racing-red to-semantic-success h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, topFiveOdds)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <button className="w-full bg-racing-red/10 hover:bg-racing-red/20 text-racing-red py-2 rounded text-xs sm:text-sm font-medium transition-colors">
          {t('Ver Análisis', 'View Analysis')}
        </button>
      </div>
    </div>
  );
}

function MetricBox({ label, value, color, borderColor }: { label: string; value: string; color: string; borderColor?: string }) {
  return (
    <div className={`bg-racing-darker p-2 sm:p-3 rounded border ${borderColor || 'border-transparent'}`}>
      <p className="text-[10px] sm:text-xs text-racing-muted uppercase mb-0.5 sm:mb-1">{label}</p>
      <p className={`text-lg sm:text-2xl font-bold ${color} truncate`}>{value}</p>
    </div>
  );
}
