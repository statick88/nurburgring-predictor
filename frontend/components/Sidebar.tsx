'use client';

import FilterBar from './FilterBar';
import CategorySelector from './CategorySelector';
import { useLanguage } from './LanguageContext';
import { useFilters } from './FilterContext';

const RACE_CATEGORIES = ['GT3', 'TCR', 'GT4', 'Cup2'];

export default function Sidebar() {
  const { t } = useLanguage();
  const { filters, updateCategory, updateConfidence, togglePredicted, resetFilters } = useFilters();

  return (
    <aside className="w-72 bg-racing-dark border-r border-racing-light/10 p-4 space-y-6 hidden lg:block">
      {/* Race Info */}
      <div className="bg-racing-darker rounded-lg p-4 border border-racing-light/10">
        <h3 className="text-sm font-semibold text-racing-muted uppercase mb-3">
          {t('Información de Carrera', 'Race Info')}
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-racing-muted">{t('Evento', 'Event')}</span>
            <span className="text-white font-medium">52. ADAC Zurich 24h-Rennen</span>
          </div>
          <div className="flex justify-between">
            <span className="text-racing-muted">{t('Circuito', 'Track')}</span>
            <span className="text-white font-medium">Nordschleife</span>
          </div>
          <div className="flex justify-between">
            <span className="text-racing-muted">{t('Longitud', 'Length')}</span>
            <span className="text-white font-mono">25.947 km</span>
          </div>
          <div className="flex justify-between">
            <span className="text-racing-muted">{t('Equipos', 'Teams')}</span>
            <span className="text-white font-mono">105</span>
          </div>
        </div>
      </div>

      {/* Category Selector */}
      <CategorySelector
        categories={RACE_CATEGORIES}
        value=""
        onChange={updateCategory}
        variant="tabs"
      />

      {/* Filter Bar */}
      <FilterBar
        onFilterChange={() => {}}
        availableCategories={RACE_CATEGORIES}
        availableCountries={[]}
      />

      {/* Quick Stats */}
      <div className="bg-racing-darker rounded-lg p-4 border border-racing-light/10">
        <h3 className="text-sm font-semibold text-racing-muted uppercase mb-3">
          {t('Estadísticas Rápidas', 'Quick Stats')}
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-racing-muted text-sm">{t('Precisión del Modelo', 'Model Accuracy')}</span>
            <span className="text-semantic-success font-bold">78%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-racing-muted text-sm">{t('Pilotos Activos', 'Active Drivers')}</span>
            <span className="text-white font-mono">312</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-racing-muted text-sm">{t('Paradas en Boxes', 'Pit Stops')}</span>
            <span className="text-white font-mono">847</span>
          </div>
        </div>
      </div>
    </aside>
  );
}