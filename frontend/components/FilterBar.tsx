'use client';

import { useLanguage } from './LanguageContext';
import { useFilters } from './FilterContext';

interface FilterBarProps {
  onFilterChange: () => void;
  availableCategories: string[];
  availableCountries: string[];
}

export default function FilterBar({
  onFilterChange,
  availableCategories,
}: FilterBarProps) {
  const { t } = useLanguage();
  const { filters, updateCategory, updateConfidence, togglePredicted, resetFilters } = useFilters();

  return (
    <div className="bg-racing-darker rounded-lg p-4 border border-racing-light/10 space-y-4">
      {/* Category Filter */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">{t('Categoría', 'Category')}</label>
        <div className="flex flex-wrap gap-2">
          {availableCategories.slice(0, 4).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                updateCategory(cat);
                onFilterChange();
              }}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                filters.categories.includes(cat)
                  ? 'bg-racing-red text-white'
                  : 'bg-racing-dark/50 text-racing-light hover:bg-racing-dark border border-racing-light/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Confidence Slider */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          {t('Confianza Mínima', 'Min Confidence')}: {filters.minConfidence}%
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="100"
            value={filters.minConfidence}
            onChange={(e) => {
              updateConfidence(Number(e.target.value));
              onFilterChange();
            }}
            className="flex-1 h-2 bg-racing-dark/50 rounded-full appearance-none cursor-pointer accent-racing-red"
          />
          <span className="text-sm font-mono text-racing-red w-12 text-right">
            {filters.minConfidence}%
          </span>
        </div>
      </div>

      {/* Only Predicted Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-white">{t('Solo Top-5 Predicciones', 'Top-5 Predictions Only')}</label>
        <button
          onClick={() => {
            togglePredicted();
            onFilterChange();
          }}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            filters.onlyPredicted ? 'bg-racing-red/30' : 'bg-racing-dark'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-racing-red transition-transform ${
              filters.onlyPredicted ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          resetFilters();
          onFilterChange();
        }}
        className="w-full py-2 border border-racing-light/30 rounded text-racing-light text-sm font-medium hover:bg-racing-light/10 transition-colors"
      >
        {t('Restablecer Filtros', 'Reset Filters')}
      </button>
    </div>
  );
}