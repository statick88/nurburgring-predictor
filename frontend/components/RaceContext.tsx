'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const RACE_DURATION_SECONDS = 24 * 60 * 60; // 24 hours in seconds

interface RaceContextType {
  elapsedSeconds: number;
  remainingSeconds: number;
  currentHour: number;
  progress: number;
  isLive: boolean;
}

const RaceContext = createContext<RaceContextType | undefined>(undefined);

export function RaceProvider({ children }: { children: ReactNode }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Race started at 12:00, external timer shows 04:53:48 remaining
  // So elapsed = 24:00:00 - 04:53:48 = 19:06:12
  useEffect(() => {
    setElapsedSeconds(19 * 3600 + 6 * 60 + 12); // ~19:06:12 elapsed
    
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const remainingSeconds = Math.max(0, RACE_DURATION_SECONDS - elapsedSeconds);
  const currentHour = elapsedSeconds / 3600;
  const progress = (elapsedSeconds / RACE_DURATION_SECONDS) * 100;

  return (
    <RaceContext.Provider value={{ elapsedSeconds, remainingSeconds, currentHour, progress, isLive: true }}>
      {children}
    </RaceContext.Provider>
  );
}

export function useRace() {
  const context = useContext(RaceContext);
  if (context === undefined) {
    throw new Error('useRace must be used within a RaceProvider');
  }
  return context;
}
