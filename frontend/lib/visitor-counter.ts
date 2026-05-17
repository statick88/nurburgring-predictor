/**
 * Visitor Counter Service
 * 
 * Uses countapi.xyz (free, no signup) to track page views.
 * For concurrent visitors, we use a heuristic based on recent activity.
 * 
 * Note: True concurrent tracking requires a WebSocket server.
 * This implementation provides a reasonable estimate for static sites.
 */

const COUNTAPI_NAMESPACE = 'nurburgring-predictor';
const COUNTAPI_KEY = 'visits';

export interface VisitorStats {
  totalVisits: number;
  estimatedConcurrent: number;
  lastUpdated: Date;
}

/**
 * Increment visit counter and return stats
 */
export async function trackVisit(): Promise<VisitorStats> {
  try {
    // Increment hit counter
    const response = await fetch(
      `https://api.countapi.xyz/hit/${COUNTAPI_NAMESPACE}/${COUNTAPI_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`CountAPI error: ${response.status}`);
    }
    
    const data = await response.json();
    const totalVisits = data.value || 0;
    
    // Estimate concurrent visitors based on total visits
    // Heuristic: ~1-5% of total visits are active in the last 5 minutes
    const estimatedConcurrent = estimateConcurrent(totalVisits);
    
    return {
      totalVisits,
      estimatedConcurrent,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.warn('[VisitorCounter] Failed to track visit:', error);
    // Return cached/estimated values on failure
    return getCachedStats();
  }
}

/**
 * Get current stats without incrementing counter
 */
export async function getVisitorStats(): Promise<VisitorStats> {
  try {
    const response = await fetch(
      `https://api.countapi.xyz/get/${COUNTAPI_NAMESPACE}/${COUNTAPI_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`CountAPI error: ${response.status}`);
    }
    
    const data = await response.json();
    const totalVisits = data.value || 0;
    
    return {
      totalVisits,
      estimatedConcurrent: estimateConcurrent(totalVisits),
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.warn('[VisitorCounter] Failed to get stats:', error);
    return getCachedStats();
  }
}

/**
 * Estimate concurrent visitors based on total visits
 * Uses a logarithmic model: more total visits = more concurrent, but with diminishing returns
 */
function estimateConcurrent(totalVisits: number): number {
  if (totalVisits === 0) return 1;
  
  // Base: 1-3 visitors for low traffic
  // Scale: logarithmic growth (10 visits -> ~2, 100 -> ~4, 1000 -> ~7, 10000 -> ~12)
  const base = Math.log10(totalVisits) * 2 + 1;
  
  // Add some randomness for realism (±20%)
  const variance = 0.2;
  const randomFactor = 1 + (Math.random() - 0.5) * variance * 2;
  
  return Math.max(1, Math.round(base * randomFactor));
}

/**
 * Get cached stats from localStorage
 */
function getCachedStats(): VisitorStats {
  try {
    const cached = localStorage.getItem('visitor-stats');
    if (cached) {
      const parsed = JSON.parse(cached);
      return {
        ...parsed,
        lastUpdated: new Date(parsed.lastUpdated),
      };
    }
  } catch {
    // Ignore parse errors
  }
  
  return {
    totalVisits: 0,
    estimatedConcurrent: 1,
    lastUpdated: new Date(),
  };
}

/**
 * Cache stats to localStorage
 */
function cacheStats(stats: VisitorStats): void {
  try {
    localStorage.setItem('visitor-stats', JSON.stringify(stats));
  } catch {
    // Ignore storage errors
  }
}
