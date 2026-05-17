'use client';

import { useMemo } from 'react';
import PredictionCard from './PredictionCard';
import { useLanguage } from './LanguageContext';
import { useFilters } from './FilterContext';
import { generatePredictions, modelMetadata, groupByTeam } from '@/lib/prediction-engine';
import { getRaceData } from '@/lib/race-data-service';

const CATEGORIES = ['all', 'GT3', 'TCR', 'GT4', 'Cup2'] as const;
type Category = (typeof CATEGORIES)[number];

interface Prediction {
  id: string;
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

/**
 * Transform prediction engine output to component format
 */
function transformPredictions(predictions: ReturnType<typeof generatePredictions>, raceData: Awaited<ReturnType<typeof getRaceData>>): Prediction[] {
  const teams = groupByTeam(raceData);
  const teamMap = new Map(teams.map(t => [t.teamId, t]));

  return predictions.map((pred) => {
    const team = teamMap.get(pred.id);
    return {
      id: pred.id,
      teamId: pred.id,
      teamName: `#${pred.id.replace('team-', '')} ${pred.vehicle}`,
      driverNames: team?.drivers || [pred.driverName],
      category: pred.category,
      currentPosition: pred.currentPosition,
      predictedFinishPosition: pred.predictedFinish,
      finishProbability: pred.confidencePercentage,
      topFiveOdds: Math.round(pred.top5Odds * 100),
      dnfProbability: pred.dnfProbability,
      lastUpdated: new Date(pred.predictionTimestamp),
    };
  });
}

const CATEGORY_LABELS: Record<Category, { es: string; en: string }> = {
  all: { es: 'Todas', en: 'All' },
  GT3: { es: 'GT3', en: 'GT3' },
  TCR: { es: 'TCR', en: 'TCR' },
  GT4: { es: 'GT4', en: 'GT4' },
  Cup2: { es: 'Cup 2', en: 'Cup 2' },
};

export default function PredictionCards() {
  const { t, language } = useLanguage();
  const { filters, updateCategory } = useFilters();

  // Get race data from service
  const raceData = useMemo(() => {
    try {
      return getRaceData();
    } catch {
      return [];
    }
  }, []);

  // Generate predictions synchronously
  const allPredictions: Prediction[] = useMemo(
    () => transformPredictions(generatePredictions(raceData), raceData),
    [raceData]
  );

  // Filter by category using FilterContext
  const filteredPredictions = useMemo(
    () => {
      if (filters.categories.length === 0) {
        return allPredictions;
      }
      return allPredictions.filter(p => filters.categories.includes(p.category));
    },
    [allPredictions, filters.categories]
  );

  // Map FilterContext categories to local category type for display
  const selectedCategory = filters.categories.length === 0 
    ? 'all' 
    : filters.categories[0] as Category || 'all';

  if (allPredictions.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">{t('Predicciones', 'Predictions')}</h3>
        <div className="text-center p-8 text-racing-muted">
          {t('No hay predicciones disponibles', 'No predictions available')}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h3 className="text-lg font-semibold text-white">
          {t('Predicciones por Equipo', 'Team Predictions')}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-racing-muted bg-racing-darker px-2 py-1 rounded">
            {modelMetadata.modelName} {modelMetadata.modelVersion}
          </span>
        </div>
      </div>
      
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              if (cat === 'all') {
                // Reset to show all categories
                filters.categories.forEach(c => updateCategory(c));
              } else {
                updateCategory(cat);
              }
            }}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              (cat === 'all' && filters.categories.length === 0) || filters.categories.includes(cat)
                ? 'bg-racing-red text-white'
                : 'bg-racing-darker text-racing-muted hover:text-white hover:bg-racing-dark'
            }`}
          >
            {language === 'es' ? CATEGORY_LABELS[cat].es : CATEGORY_LABELS[cat].en}
            {cat !== 'all' && (
              <span className="ml-1 text-xs opacity-60">
                ({allPredictions.filter(p => p.category === cat).length})
              </span>
            )}
          </button>
        ))}
      </div>
      
      {/* Prediction Cards */}
      {filteredPredictions.length === 0 ? (
        <div className="text-center p-8 text-racing-muted">
          {t('No hay predicciones para esta categoría', 'No predictions for this category')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPredictions.map((prediction) => (
            <PredictionCard key={prediction.id} {...prediction} />
          ))}
        </div>
      )}

      <p className="text-xs text-racing-muted mt-4 text-right">
        {t('Mostrando', 'Showing')} {filteredPredictions.length} {t('de', 'of')} {allPredictions.length} {t('equipos', 'teams')} — {t('Última actualización', 'Last updated')}: {new Date().toLocaleString()}
      </p>
    </div>
  );
}
