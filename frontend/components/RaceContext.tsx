'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { connectToLiveTiming, subscribeToRaceData, disconnectFromLiveTiming, type LiveRaceData } from '@/lib/live-race-timer';

const RACE_DURATION_SECONDS = 24 * 60 * 60; // 24 hours in seconds

interface RaceContextType {
  elapsedSeconds: number;
  remainingSeconds: number;
  currentHour: number;
  progress: number;
  isLive: boolean;
  lastSynced: Date | null;
}

const RaceContext = createContext<RaceContextType | undefined>(undefined);

export function RaceProvider({ children }: { children: ReactNode }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isLive, setIsLive] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Handle live data updates
  const handleLiveData = useCallback((data: LiveRaceData) => {
    setElapsedSeconds(data.elapsedSeconds);
    setIsLive(data.isLive);
    setLastSynced(data.lastSynced);

    // Reset the tick timer so it counts from the synced value
    if (tickRef.current) {
      clearInterval(tickRef.current);
    }

    // Start local tick for smooth second-by-second updates between syncs
    if (data.isLive) {
      tickRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
  }, []);

  useEffect(() => {
    // Connect to live timing
    const initialData = connectToLiveTiming();
    handleLiveData(initialData);

    // Subscribe to updates
    const unsubscribe = subscribeToRaceData(handleLiveData);

    return () => {
      unsubscribe();
      disconnectFromLiveTiming();
      if (tickRef.current) {
        clearInterval(tickRef.current);
      }
    };
  }, [handleLiveData]);

  const remainingSeconds = Math.max(0, RACE_DURATION_SECONDS - elapsedSeconds);
  const currentHour = elapsedSeconds / 3600;
  const progress = (elapsedSeconds / RACE_DURATION_SECONDS) * 100;

  return (
    <RaceContext.Provider value={{ elapsedSeconds, remainingSeconds, currentHour, progress, isLive, lastSynced }}>
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
