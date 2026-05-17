'use client';

import PredictionCard from './PredictionCard';
import { useLanguage } from './LanguageContext';
import { usePredictions, transformPredictionsForCards } from '@/hooks/usePredictions';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface Prediction {
  id: string;
  teamId: string;
  teamName: string;
  driverNames: string[];
  currentPosition: number;
  predictedFinishPosition: number;
  finishProbability: number;
  topFiveOdds: number;
  lastUpdated: Date;
}

export default function PredictionCards() {
  const { t } = useLanguage();
  
  // Fetch predictions using React Query hook
  const { 
    data, 
    isLoading, 
    isError, 
    error, 
    refetch,
    isFetching 
  } = usePredictions({ includeFactors: false });

  // Transform API response to component format
  const predictions: Prediction[] = data?.data?.predictions 
    ? transformPredictionsForCards(data.data.predictions)
    : [];

  if (isLoading) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">{t('Predicciones', 'Predictions')}</h3>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-racing-red" />
          <span className="ml-3 text-racing-muted">{t('Cargando predicciones...', 'Loading predictions...')}</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">{t('Predicciones', 'Predictions')}</h3>
        <div className="bg-racing-dark/50 border border-racing-red/20 rounded-lg p-6 text-center">
          <AlertCircle className="w-10 h-10 text-racing-red mx-auto mb-3" />
          <p className="text-racing-muted mb-4">
            {t('Error al cargar predicciones', 'Error loading predictions')}: {error?.message || 'Unknown error'}
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center px-4 py-2 bg-racing-red/10 hover:bg-racing-red/20 text-racing-red rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            {t('Reintentar', 'Retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">
          {t('Predicciones', 'Predictions')}
        </h3>
        {data?.data?.modelMetadata && (
          <span className="text-xs text-racing-muted bg-racing-darker px-2 py-1 rounded">
            {data.data.modelMetadata.modelName} {data.data.modelMetadata.modelVersion}
          </span>
        )}
      </div>
      
      {predictions.length === 0 ? (
        <div className="text-center p-8 text-racing-muted">
          {t('No hay predicciones disponibles', 'No predictions available')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {predictions.map((prediction) => (
            <PredictionCard key={prediction.id} {...prediction} />
          ))}
        </div>
      )}

      {data?.data?.generatedAt && (
        <p className="text-xs text-racing-muted mt-4 text-right">
          {t('Última actualización', 'Last updated')}: {new Date(data.data.generatedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}