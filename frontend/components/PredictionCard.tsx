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
    <div className="bg-racing-dark p-6 rounded-lg border border-racing-light/10 hover:border-racing-red/30 transition-colors">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg text-white">{teamName}</h3>
            <span className={`text-xs font-mono px-2 py-0.5 rounded border ${getCategoryBadgeStyle(category)}`}>
              {category}
            </span>
          </div>
          <p className="text-xs text-racing-muted">
            {t('Pilotos', 'Drivers')}: {driverNames.join(', ')}
          </p>
        </div>
        <span className="text-xs text-racing-muted bg-racing-darker px-2 py-1 rounded ml-2">
          {timeAgo}
        </span>
      </div>

      {/* Position Metrics */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {/* Current Position */}
        <div className="bg-racing-darker p-3 rounded">
          <p className="text-xs text-racing-muted uppercase mb-1">{t('Actual', 'Current')}</p>
          <p className="text-2xl font-bold text-white">#{currentPosition}</p>
        </div>

        {/* Predicted Finish */}
        <div className="bg-racing-darker p-3 rounded border border-racing-red/30">
          <p className="text-xs text-racing-muted uppercase mb-1">{t('Predicho', 'Predicted')}</p>
          <p className="text-2xl font-bold text-racing-red">#{predictedFinishPosition}</p>
        </div>

        {/* Confidence */}
        <div className="bg-racing-darker p-3 rounded">
          <p className="text-xs text-racing-muted uppercase mb-1">{t('Confianza', 'Confidence')}</p>
          <p className={`text-2xl font-bold ${getConfidenceColor(finishProbability)}`}>
            {finishProbability}%
          </p>
        </div>

        {/* DNF */}
        <div className="bg-racing-darker p-3 rounded">
          <p className="text-xs text-racing-muted uppercase mb-1">DNF</p>
          <p className={`text-2xl font-bold ${getDnfColor(dnfProbability)}`}>
            {(dnfProbability * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Trend */}
      <div className="mb-4 flex items-center gap-2">
        <span className={`text-sm font-medium ${trend.color}`}>
          {trend.icon} {trend.label} {Math.abs(predictedFinishPosition - currentPosition)} {t('posiciones', 'positions')}
        </span>
      </div>

      {/* Probability Visualization */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-racing-muted">{t('Prob. Top-5', 'Top-5 Probability')}</span>
          <span className="text-sm font-mono text-racing-red">{topFiveOdds}%</span>
        </div>
        <div className="w-full bg-racing-darker rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-racing-red to-semantic-success h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, topFiveOdds)}%` }}
          />
        </div>
      </div>

      {/* Footer CTA */}
      <button className="w-full bg-racing-red/10 hover:bg-racing-red/20 text-racing-red py-2 rounded text-sm font-medium transition-colors">
        {t('Ver Análisis Detallado', 'View Detailed Analysis')}
      </button>
    </div>
  );
}
