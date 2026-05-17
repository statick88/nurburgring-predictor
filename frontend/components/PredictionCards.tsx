'use client';

import PredictionCard from './PredictionCard';

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

const mockPredictions: Prediction[] = [
  {
    id: '1',
    teamId: 'falken',
    teamName: 'Falken Motorsports',
    driverNames: ['A. Murray', 'T. Blqvist', 'M. Werner'],
    currentPosition: 1,
    predictedFinishPosition: 1,
    finishProbability: 92,
    topFiveOdds: 98,
    lastUpdated: new Date(),
  },
  {
    id: '2',
    teamId: 'bmw',
    teamName: 'BMW M Motorsport',
    driverNames: ['M. van der Linde', 'A. Farfus', 'M. Hesse'],
    currentPosition: 3,
    predictedFinishPosition: 2,
    finishProbability: 67,
    topFiveOdds: 85,
    lastUpdated: new Date(),
  },
  {
    id: '3',
    teamId: 'porsche',
    teamName: 'Porsche 911 GT3 R',
    driverNames: ['M. J. Christensen', 'L. Vanthoor', 'K. Bachler'],
    currentPosition: 2,
    predictedFinishPosition: 3,
    finishProbability: 78,
    topFiveOdds: 92,
    lastUpdated: new Date(),
  },
];

export default function PredictionCards() {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">Predictions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockPredictions.map((prediction) => (
          <PredictionCard key={prediction.id} {...prediction} />
        ))}
      </div>
    </div>
  );
}