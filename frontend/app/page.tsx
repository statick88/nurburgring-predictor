import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import RaceTimeline from '@/components/RaceTimeline';
import RaceLeaderboard from '@/components/RaceLeaderboard';
import PredictionCards from '@/components/PredictionCards';

export default function Home() {
  return (
    <div className="min-h-screen bg-racing-darker">
      {/* Header */}
      <Header />

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6">
          {/* Race Timeline (full width) */}
          <RaceTimeline />

          {/* Leaderboard + Stats Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <RaceLeaderboard />
            </div>
            <div className="lg:col-span-2">
              {/* Stats Panel placeholder */}
              <div className="bg-racing-dark rounded-lg border border-racing-light/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Top 3 Predictions</h3>
                <div className="text-racing-muted text-sm">
                  Stats panel - connecting to API...
                </div>
              </div>
            </div>
          </div>

          {/* Prediction Cards */}
          <PredictionCards />
        </main>
      </div>
    </div>
  );
}