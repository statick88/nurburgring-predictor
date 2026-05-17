'use client';

import { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { useFilters } from './FilterContext';
import { ChevronDown, ChevronUp, Info, BarChart3 } from 'lucide-react';

const RACE_CATEGORIES = ['GT3', 'TCR', 'GT4', 'Cup2'];

export default function MobileFilters() {
  const { t } = useLanguage();
  const { filters, updateCategory, updateConfidence, togglePredicted, resetFilters } = useFilters();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="lg:hidden">
      {/* Collapsible Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-racing-dark border-b border-racing-light/10"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-racing-red" />
          <span className="text-sm font-semibold text-white">
            {t('Filtros y Estadísticas', 'Filters & Stats')}
          </span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-racing-muted" /> : <ChevronDown className="w-4 h-4 text-racing-muted" />}
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="bg-racing-dark border-b border-racing-light/10 p-4 space-y-4">
          {/* Race Info */}
          <div className="bg-racing-darker rounded-lg p-3 border border-racing-light/10">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-racing-red" />
              <h3 className="text-xs font-semibold text-racing-muted uppercase">
                {t('Información de Carrera', 'Race Info')}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-racing-muted block">{t('Evento', 'Event')}</span>
                <span className="text-white font-medium">52. ADAC Zurich 24h</span>
              </div>
              <div>
                <span className="text-racing-muted block">{t('Circuito', 'Track')}</span>
                <span className="text-white font-medium">Nordschleife</span>
              </div>
              <div>
                <span className="text-racing-muted block">{t('Longitud', 'Length')}</span>
                <span className="text-white font-mono">25.947 km</span>
              </div>
              <div>
                <span className="text-racing-muted block">{t('Equipos', 'Teams')}</span>
                <span className="text-white font-mono">105</span>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <h3 className="text-xs font-semibold text-racing-muted uppercase mb-2">
              {t('Categorías', 'Categories')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {RACE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => updateCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    filters.categories.includes(cat)
                      ? 'bg-racing-red text-white'
                      : 'bg-racing-darker text-racing-muted border border-racing-light/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
              {filters.categories.length > 0 && (
                <button
                  onClick={resetFilters}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-racing-darker text-racing-muted border border-racing-light/10"
                >
                  {t('Limpiar', 'Clear')}
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-racing-darker rounded-lg p-3 border border-racing-light/10">
            <h3 className="text-xs font-semibold text-racing-muted uppercase mb-2">
              {t('Estadísticas Rápidas', 'Quick Stats')}
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-semantic-success font-bold text-sm">78%</span>
                <span className="text-racing-muted text-xs block">{t('Precisión', 'Accuracy')}</span>
              </div>
              <div>
                <span className="text-white font-mono font-bold text-sm">312</span>
                <span className="text-racing-muted text-xs block">{t('Pilotos', 'Drivers')}</span>
              </div>
              <div>
                <span className="text-white font-mono font-bold text-sm">847</span>
                <span className="text-racing-muted text-xs block">{t('Pit Stops', 'Pit Stops')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
