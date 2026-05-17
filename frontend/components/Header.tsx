'use client';

import { useState, useEffect } from 'react';
import { Clock, Hourglass, TrendingUp, Menu, X, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import LanguageToggle from './LanguageToggle';
import { useRace } from './RaceContext';
import { trackVisit, type VisitorStats } from '@/lib/visitor-counter';

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function Header() {
  const { elapsedSeconds, remainingSeconds, progress, isLive } = useRace();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timerExpanded, setTimerExpanded] = useState(false);
  const [visitorStats, setVisitorStats] = useState<VisitorStats | null>(null);

  // Track visit on mount
  useEffect(() => {
    trackVisit().then(setVisitorStats);
  }, []);

  const elapsedTime = formatTime(elapsedSeconds);
  const remainingTime = formatTime(remainingSeconds);

  return (
    <header className="bg-racing-dark border-b border-racing-light/10">
      {/* Top Bar */}
      <div className="px-3 py-2 sm:px-6 sm:py-3 landscape:px-3 landscape:py-2">
        <div className="flex items-center justify-between">
          {/* Logo + Title */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-racing-red rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-xl font-bold text-white truncate">
                {t('Nürburgring 24h', 'Nürburgring 24h')}
              </h1>
              <p className="text-[10px] sm:text-sm text-racing-muted hidden sm:block landscape:hidden">
                {t('Predictor en Vivo', 'Live Predictor')}
              </p>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-1.5 sm:gap-4">
            {/* Live Indicator + Visitor Count */}
            <div className="flex items-center gap-1 sm:gap-3">
              <div className="flex items-center gap-1">
                <span className="relative flex h-2 w-2 sm:h-3 sm:w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-semantic-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-semantic-success"></span>
                </span>
                <span className="text-[10px] sm:text-sm font-medium text-semantic-success hidden sm:inline landscape:hidden">
                  {isLive ? t('EN VIVO', 'LIVE') : t('OFFLINE', 'OFFLINE')}
                </span>
              </div>

              {/* Visitor Counter */}
              {visitorStats && (
                <div className="flex items-center gap-1 bg-racing-darker px-1.5 py-1 rounded-lg">
                  <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400" />
                  <span className="text-[10px] sm:text-xs font-mono font-bold text-white">
                    {visitorStats.estimatedConcurrent}
                  </span>
                  <span className="text-[10px] text-racing-muted hidden sm:inline landscape:hidden">
                    {t('viendo', 'watching')}
                  </span>
                </div>
              )}
            </div>

            {/* Mobile Timer Toggle - Hidden in landscape to save space */}
            <button
              onClick={() => setTimerExpanded(!timerExpanded)}
              className="sm:hidden landscape:hidden flex items-center gap-1.5 bg-racing-darker px-2 py-1 rounded-lg"
            >
              <Clock className="w-3.5 h-3.5 text-racing-muted" />
              <span className="text-xs font-mono font-bold text-white">{elapsedTime}</span>
              {timerExpanded ? <ChevronUp className="w-3 h-3 text-racing-muted" /> : <ChevronDown className="w-3 h-3 text-racing-muted" />}
            </button>

            {/* Desktop Timers */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-2 bg-racing-darker px-3 py-1.5 rounded-lg">
                <Clock className="w-4 h-4 text-racing-muted" />
                <div className="flex flex-col">
                  <span className="text-base font-mono font-bold text-white">{elapsedTime}</span>
                  <span className="text-[10px] text-racing-muted">{t('Transcurrido', 'Elapsed')}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-racing-darker px-3 py-1.5 rounded-lg">
                <Hourglass className="w-4 h-4 text-racing-red" />
                <div className="flex flex-col">
                  <span className="text-base font-mono font-bold text-racing-red">{remainingTime}</span>
                  <span className="text-[10px] text-racing-muted">{t('Restante', 'Remaining')}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-racing-darker rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-racing-red to-semantic-success rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-[10px] text-racing-muted w-10">
                  {progress.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Language Toggle */}
            <div className="hidden sm:block">
              <LanguageToggle language={language} setLanguage={setLanguage} />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-1.5 rounded-lg hover:bg-racing-darker transition-colors"
              aria-label={t('Menú', 'Menu')}
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-white" /> : <Menu className="w-4 h-4 text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile Timer Expanded */}
        {timerExpanded && (
          <div className="sm:hidden mt-2 grid grid-cols-2 gap-2">
            <div className="bg-racing-darker px-3 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <Hourglass className="w-4 h-4 text-racing-red" />
                <div>
                  <span className="text-xs text-racing-muted block">{t('Restante', 'Remaining')}</span>
                  <span className="text-sm font-mono font-bold text-racing-red">{remainingTime}</span>
                </div>
              </div>
            </div>
            <div className="bg-racing-darker px-3 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-racing-muted" />
                <div>
                  <span className="text-xs text-racing-muted block">{t('Progreso', 'Progress')}</span>
                  <span className="text-sm font-mono font-bold text-white">{progress.toFixed(1)}%</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-racing-dark rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-gradient-to-r from-racing-red to-semantic-success rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-2 pt-2 border-t border-racing-light/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-racing-muted">{t('Predictor en Vivo', 'Live Predictor')}</span>
              <LanguageToggle language={language} setLanguage={setLanguage} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-racing-darker px-3 py-2 rounded-lg">
                <span className="text-xs text-racing-muted block">{t('Transcurrido', 'Elapsed')}</span>
                <span className="text-sm font-mono font-bold text-white">{elapsedTime}</span>
              </div>
              <div className="bg-racing-darker px-3 py-2 rounded-lg">
                <span className="text-xs text-racing-muted block">{t('Restante', 'Remaining')}</span>
                <span className="text-sm font-mono font-bold text-racing-red">{remainingTime}</span>
              </div>
            </div>
            <div className="bg-racing-darker px-3 py-2 rounded-lg">
              <span className="text-xs text-racing-muted block mb-1">{t('Progreso', 'Progress')}</span>
              <div className="w-full h-2 bg-racing-dark rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-racing-red to-semantic-success rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-racing-muted mt-1 block">{progress.toFixed(1)}%</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
