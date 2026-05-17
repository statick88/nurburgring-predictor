'use client';

import { useLanguage } from './LanguageContext';

interface CategorySelectorProps {
  categories: string[];
  value: string;
  onChange: (category: string) => void;
  variant?: 'tabs' | 'dropdown';
}

export default function CategorySelector({
  categories,
  value,
  onChange,
  variant = 'tabs',
}: CategorySelectorProps) {
  const { t } = useLanguage();
  const label = t('Categoría', 'Category');

  if (variant === 'dropdown') {
    return (
      <div className="bg-racing-darker rounded-lg p-4 border border-racing-light/10">
        <label className="block text-sm font-semibold text-white mb-2">{label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-racing-dark text-white border border-racing-light/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-racing-red"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="bg-racing-darker rounded-lg p-4 border border-racing-light/10">
      <label className="block text-sm font-semibold text-racing-muted mb-3">{label}</label>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              cat === value
                ? 'bg-racing-red text-white'
                : 'border border-racing-light/20 text-racing-light hover:bg-racing-dark'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}