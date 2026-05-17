'use client';

import { useMemo } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import RaceDashboard from '@/components/RaceDashboard';
import RaceLeaderboard from '@/components/RaceLeaderboard';
import PredictionCards from '@/components/PredictionCards';
import StatsPanel from '@/components/StatsPanel';
import { useLanguage } from '@/components/LanguageContext';
import { getRaceData } from '@/lib/race-data-service';

export default function Home() {
  const { t } = useLanguage();

  // Get race data for StatsPanel
  const raceData = useMemo(() => getRaceData(), []);

  return (
    <div className="min-h-screen bg-racing-darker">
      {/* Header */}
      <Header />

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
          {/* Race Dashboard (full width) */}
          <RaceDashboard />

          {/* Leaderboard + Stats Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
            <div className="lg:col-span-3">
              <RaceLeaderboard />
            </div>
            <div className="lg:col-span-2">
              <StatsPanel raceData={raceData} />
            </div>
          </div>

          {/* Prediction Cards */}
          <PredictionCards />
        </main>
      </div>
    </div>
  );
}