/**
 * Live Race Timer Service
 * 
 * Connects to the official Nürburgring Live Timing WebSocket
 * to get real-time race data including time remaining.
 * 
 * WebSocket URL: wss://livetiming.azurewebsites.net
 * Protocol: Send { eventId, eventPid, clientLocalTime }
 * Receives: PID "0" messages with race state including time remaining
 * 
 * For static sites (GitHub Pages), we use the browser's native WebSocket API.
 * Falls back to hardcoded values if WebSocket connection fails.
 */

const WS_URL = 'wss://livetiming.azurewebsites.net';
const EVENT_ID = 50;
const SYNC_INTERVAL_MS = 30_000; // Re-sync every 30 seconds

export interface LiveRaceData {
  remainingSeconds: number;
  elapsedSeconds: number;
  session: string;
  trackName: string;
  cup: string;
  isLive: boolean;
  lastSynced: Date;
}

interface WebSocketMessage {
  PID: string;
  EXPORTID?: number;
  SESSION?: string;
  TRACKNAME?: string;
  CUP?: string;
  TOD?: number; // Time of day in seconds
  RESULT?: RaceResult[];
  serverLocalTime?: number;
  clientLocalTime?: number;
  [key: string]: unknown;
}

interface RaceResult {
  STNR: string;
  POS: number;
  NAME: string;
  LAPS: number;
  GAP?: string;
  LASTLAPTIME?: string;
  BESTLAPTIME?: string;
  VEHICLE?: string;
  CLASS?: string;
  [key: string]: unknown;
}

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let syncTimer: ReturnType<typeof setTimeout> | null = null;
let listeners: Set<(data: LiveRaceData) => void> = new Set();
let currentData: LiveRaceData | null = null;
let raceStartTimestamp: number | null = null; // TOD from first message
let localOffsetMs = 0; // Difference between server and local time

/**
 * Connect to the Live Timing WebSocket and start receiving race data.
 * Returns the current data immediately (or fallback if not yet connected).
 */
export function connectToLiveTiming(): LiveRaceData {
  if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
    return currentData || getFallbackData();
  }

  connect();
  return currentData || getFallbackData();
}

/**
 * Subscribe to live race data updates.
 * Returns an unsubscribe function.
 */
export function subscribeToRaceData(listener: (data: LiveRaceData) => void): () => void {
  listeners.add(listener);
  
  // Send current data immediately if available
  if (currentData) {
    listener(currentData);
  }

  return () => {
    listeners.delete(listener);
  };
}

/**
 * Disconnect from the Live Timing WebSocket.
 */
export function disconnectFromLiveTiming(): void {
  if (ws) {
    ws.close();
    ws = null;
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (syncTimer) {
    clearTimeout(syncTimer);
    syncTimer = null;
  }
}

function connect(): void {
  try {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('[LiveRaceTimer] WebSocket connected');
      subscribeToEvent();
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        handleMessage(message);
      } catch (e) {
        console.warn('[LiveRaceTimer] Failed to parse message:', e);
      }
    };

    ws.onerror = (error) => {
      console.warn('[LiveRaceTimer] WebSocket error:', error);
    };

    ws.onclose = (event) => {
      console.log('[LiveRaceTimer] WebSocket closed, reconnecting in 5s...', event.code, event.reason);
      scheduleReconnect();
    };
  } catch (e) {
    console.warn('[LiveRaceTimer] Failed to create WebSocket:', e);
    scheduleReconnect();
  }
}

function subscribeToEvent(): void {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  ws.send(JSON.stringify({
    eventId: EVENT_ID,
    eventPid: 0,
    clientLocalTime: Date.now(),
  }));
}

function handleMessage(message: WebSocketMessage): void {
  // Handle time sync
  if (message.PID === 'LTS_TIMESYNC') {
    if (message.serverLocalTime && message.clientLocalTime) {
      localOffsetMs = (message.serverLocalTime as number) - (message.clientLocalTime as number);
    }
    return;
  }

  // Handle not found
  if (message.PID === 'LTS_NOT_FOUND') {
    console.warn('[LiveRaceTimer] Event not found');
    return;
  }

  // Handle main race data (PID "0")
  if (message.PID === '0') {
    processRaceData(message);
  }
}

function processRaceData(message: WebSocketMessage): void {
  const tod = message.TOD; // Time of day in seconds since midnight (server time)
  
  // Store race start time on first message
  if (tod && !raceStartTimestamp) {
    raceStartTimestamp = tod;
  }

  // Calculate elapsed time from TOD
  // TOD = seconds since midnight of race day
  // Race started at 12:00 (43200 seconds)
  const RACE_START_TOD = 12 * 3600; // 12:00 in seconds
  const RACE_DURATION = 24 * 3600; // 24 hours in seconds
  
  let elapsedSeconds = 0;
  let remainingSeconds = RACE_DURATION;
  let isLive = false;

  if (tod) {
    elapsedSeconds = tod - RACE_START_TOD;
    
    // Handle day wrap (if TOD < RACE_START_TOD, race is on day 2)
    if (elapsedSeconds < 0) {
      elapsedSeconds += 24 * 3600;
    }
    
    // Clamp to race duration
    elapsedSeconds = Math.max(0, Math.min(elapsedSeconds, RACE_DURATION));
    remainingSeconds = RACE_DURATION - elapsedSeconds;
    isLive = elapsedSeconds > 0 && remainingSeconds > 0;
  }

  const newData: LiveRaceData = {
    remainingSeconds,
    elapsedSeconds,
    session: message.SESSION || 'R',
    trackName: message.TRACKNAME || 'Nürburgring',
    cup: message.CUP || '',
    isLive,
    lastSynced: new Date(),
  };

  currentData = newData;
  notifyListeners(newData);

  // Schedule periodic re-subscription to keep data fresh
  scheduleResubscribe();
}

function scheduleResubscribe(): void {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    subscribeToEvent();
  }, SYNC_INTERVAL_MS);
}

function scheduleReconnect(): void {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(() => {
    raceStartTimestamp = null; // Reset on reconnect
    connect();
  }, 5000);
}

function notifyListeners(data: LiveRaceData): void {
  listeners.forEach(listener => {
    try {
      listener(data);
    } catch (e) {
      console.warn('[LiveRaceTimer] Listener error:', e);
    }
  });
}

function getFallbackData(): LiveRaceData {
  // Fallback: calculate from a known reference point
  // This was the state at approximately 09:14 UTC on May 17, 2026
  // with ~03:45:40 remaining
  const FALLBACK_REMAINING_AT = new Date('2026-05-17T09:14:00Z');
  const FALLBACK_REMAINING_SECONDS = 3 * 3600 + 45 * 60 + 40; // 03:45:40
  const RACE_DURATION = 24 * 3600;

  const now = new Date();
  const secondsSinceFallback = (now.getTime() - FALLBACK_REMAINING_AT.getTime()) / 1000;
  
  const remainingSeconds = Math.max(0, FALLBACK_REMAINING_SECONDS - secondsSinceFallback);
  const elapsedSeconds = RACE_DURATION - remainingSeconds;

  return {
    remainingSeconds,
    elapsedSeconds,
    session: 'R',
    trackName: 'Nürburgring',
    cup: '',
    isLive: remainingSeconds > 0,
    lastSynced: now,
  };
}
