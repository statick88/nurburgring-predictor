'use client';

import { useState, useEffect } from 'react';
import { Clock, TrendingUp } from 'lucide-react';

export default function Header() {
  const [raceTime, setRaceTime] = useState('00:00:00');
  const [isLive] = useState(true);

  // Simulated race time - replace with actual API
  useEffect(() => {
    const interval = setInterval(() => {
      // Mock: increment time for demo
      setRaceTime((prev) => {
        const parts = prev.split(':');
        const h = Number(parts[0] ?? 0);
        const m = Number(parts[1] ?? 0);
        const s = Number(parts[2] ?? 0);
        const newS = s + 1;
        if (newS >= 60) {
          const newM = m + 1;
          if (newM >= 60) {
            const newH = h + 1;
            return `${String(newH).padStart(2, '0')}:${String(newM % 60).padStart(2, '0')}:${String(newS % 60).padStart(2, '0')}`;
          }
          return `${String(h).padStart(2, '0')}:${String(newM).padStart(2, '0')}:${String(newS % 60).padStart(2, '0')}`;
        }
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(newS).padStart(2, '0')}`;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-racing-dark border-b border-racing-light/10 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo + Title */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-racing-red rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Nürburgring 24h</h1>
            <p className="text-sm text-racing-muted">Live Predictor</p>
          </div>
        </div>

        {/* Race Info */}
        <div className="flex items-center gap-6">
          {/* Live Indicator */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-semantic-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-semantic-success"></span>
            </span>
            <span className="text-sm font-medium text-semantic-success">
              {isLive ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>

          {/* Race Timer */}
          <div className="flex items-center gap-2 bg-racing-darker px-4 py-2 rounded-lg">
            <Clock className="w-5 h-5 text-racing-muted" />
            <span className="text-2xl font-mono font-bold text-white">
              {raceTime}
            </span>
            <span className="text-sm text-racing-muted">/ 24:00:00</span>
          </div>
        </div>
      </div>
    </header>
  );
}