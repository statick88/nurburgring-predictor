'use client';

import { Clock, Hourglass, TrendingUp } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import LanguageToggle from './LanguageToggle';
import { useRace } from './RaceContext';

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function Header() {
  const { elapsedSeconds, remainingSeconds, progress, isLive } = useRace();
  const { language, setLanguage, t } = useLanguage();

  const elapsedTime = formatTime(elapsedSeconds);
  const remainingTime = formatTime(remainingSeconds);

  return (
    <header className="bg-racing-dark border-b border-racing-light/10 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo + Title */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-racing-red rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{t('Nürburgring 24h', 'Nürburgring 24h')}</h1>
            <p className="text-sm text-racing-muted">{t('Predictor en Vivo', 'Live Predictor')}</p>
          </div>
        </div>

        {/* Race Info */}
        <div className="flex items-center gap-6">
          {/* Live Indicator */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-semantic-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-semantic-success"></span>
            </span>
            <span className="text-sm font-medium text-semantic-success">
              {isLive ? t('EN VIVO', 'LIVE') : t('OFFLINE', 'OFFLINE')}
            </span>
          </div>

          {/* Race Timer - Elapsed */}
          <div className="flex items-center gap-2 bg-racing-darker px-4 py-2 rounded-lg">
            <Clock className="w-5 h-5 text-racing-muted" />
            <div className="flex flex-col">
              <span className="text-lg font-mono font-bold text-white">
                {elapsedTime}
              </span>
              <span className="text-xs text-racing-muted">{t('Transcurrido', 'Elapsed')}</span>
            </div>
          </div>

          {/* Race Timer - Remaining */}
          <div className="flex items-center gap-2 bg-racing-darker px-4 py-2 rounded-lg">
            <Hourglass className="w-5 h-5 text-racing-red" />
            <div className="flex flex-col">
              <span className="text-lg font-mono font-bold text-racing-red">
                {remainingTime}
              </span>
              <span className="text-xs text-racing-muted">{t('Restante', 'Remaining')}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-racing-darker rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-racing-red to-semantic-success rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-racing-muted w-12">
              {progress.toFixed(1)}%
            </span>
          </div>

          {/* Language Toggle */}
          <LanguageToggle language={language} setLanguage={setLanguage} />
        </div>
      </div>
    </header>
  );
}