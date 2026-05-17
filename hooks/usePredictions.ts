/**
 * React Query hook for fetching race predictions
 * 
 * For static export (GitHub Pages), predictions are generated
 * directly from the prediction engine using mock race data.
 * 
 * In production, this would call an ML API endpoint.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Prediction, PredictionsResponse, PredictionParams } from '@/types/predictions';
import { generatePredictions, modelMetadata } from '@/lib/prediction-engine';
import { mockRaceData, type RaceEntrant } from '@/components/RaceLeaderboard';

const PREDICTIONS_QUERY_KEY = 'predictions';

/**
 * Generate predictions using the prediction engine directly
 * (for static export compatibility)
 */
async function generatePredictionsFromEngine(params?: PredictionParams): Promise<PredictionsResponse> {
  // Get race data - in production this would come from an API
  const raceData: RaceEntrant[] = mockRaceData;
  
  // Generate predictions using the prediction engine
  const predictions = generatePredictions(raceData);
  
  // Filter by category if specified
  const filteredPredictions = params?.category && params.category !== 'all'
    ? predictions.filter(p => p.category === params.category)
    : predictions;

  return {
    success: true,
    data: {
      raceId: 'nurburgring-24h-2026',
      predictions: filteredPredictions,
      modelMetadata: modelMetadata,
      generatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Hook to fetch race predictions
 */
export function usePredictions(params?: PredictionParams) {
  return useQuery<PredictionsResponse, Error>({
    queryKey: [PREDICTIONS_QUERY_KEY, params],
    queryFn: () => generatePredictionsFromEngine(params),
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get predictions by category
 */
export function usePredictionsByCategory(category?: string) {
  return usePredictions({ category });
}

/**
 * Hook to manually refetch predictions
 */
export function useRefetchPredictions() {
  const queryClient = useQueryClient();
  
  return () => queryClient.invalidateQueries({ queryKey: [PREDICTIONS_QUERY_KEY] });
}

/**
 * Hook to get individual driver prediction
 */
export function useDriverPrediction(driverId: string) {
  const { data, ...rest } = usePredictions();
  
  const driverPrediction = data?.data?.predictions.find(
    (p: Prediction) => p.id === driverId
  );

  return {
    ...rest,
    prediction: driverPrediction,
  };
}

/**
 * Transform API response to PredictionCards format
 * Used for backward compatibility with existing UI components
 */
export function transformPredictionsForCards(predictions: Prediction[]) {
  return predictions.map((pred) => ({
    id: pred.id,
    teamId: pred.id,
    teamName: pred.driverName,
    driverNames: [pred.driverName],
    currentPosition: pred.currentPosition,
    predictedFinishPosition: pred.predictedFinish,
    finishProbability: pred.confidencePercentage,
    topFiveOdds: Math.round(pred.top5Odds * 100),
    lastUpdated: new Date(pred.predictionTimestamp),
  }));
}