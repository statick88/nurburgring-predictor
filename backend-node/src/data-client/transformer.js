/**
 * Data Transformer - Normaliza JSON de Azure al schema interno (CommonJS)
 */

class DataTransformer {
  transformStandings(data) {
    if (!data || !data.entries) {
      console.warn('[DataTransformer] No standings data to transform');
      return [];
    }

    const entries = Array.isArray(data.entries) ? data.entries : [];

    return entries
      .map((entry, index) => this._transformCompetitor(entry, index + 1))
      .filter(c => c !== null);
  }

  _transformCompetitor(entry, fallbackPosition) {
    try {
      const teamName = this._getString(entry, ['Name', 'TeamName', 'name', 'teamName', 'Team']);
      const teamCode = this._getString(entry, ['Number', 'number', 'CarNumber', 'Bib']);
      const category = this._getString(entry, ['Class', 'Category', 'CategoryName', 'class', 'category']);

      const position = this._getNumber(entry, ['Position', 'Pos', 'Rank', 'position', 'pos', 'rank']);
      const laps = this._getNumber(entry, ['Laps', 'LapsCompleted', 'laps', 'lapsCompleted']);
      const gap = this._getString(entry, ['Gap', 'GapToLeader', 'gap', 'gapToLeader']);
      const gapToPrev = this._getString(entry, ['GapToPrev', 'gapToPrev']);
      const pitTime = this._getString(entry, ['PitTime', 'TotalPitTime', 'pitTime', 'totalPitTime']);
      const lastLap = this._getString(entry, ['LastLapTime', 'LastLap', 'lastLapTime', 'lastLap']);
      const status = this._getString(entry, ['Status', 'status']);

      const driversRaw = entry.Drivers || entry.drivers || entry.DriverNames;
      const drivers = Array.isArray(driversRaw)
        ? driversRaw
        : typeof driversRaw === 'string'
          ? driversRaw.split(',').map(d => d.trim()).filter(Boolean)
          : [];

      return {
        teamName: teamName || 'Unknown Team',
        teamCode: teamCode || '',
        category: this._normalizeCategory(category || 'GT'),
        currentPosition: position || fallbackPosition,
        lapsCompleted: laps || 0,
        gapToLeader: gap || 'Leader',
        gapToPrev: gapToPrev || '',
        totalPitTimeSeconds: this._parsePitTime(pitTime),
        lastLapTimeSeconds: this._parseLapTime(lastLap),
        status: this._normalizeStatus(status),
        drivers,
      };
    } catch (error) {
      console.error('[DataTransformer] Error transforming competitor:', error);
      return null;
    }
  }

  transformEvents(data) {
    if (!data || !data.events) return [];

    const events = Array.isArray(data.events) ? data.events : [];
    return events
      .map(event => this._transformEvent(event))
      .filter(e => e !== null);
  }

  _transformEvent(event) {
    try {
      return {
        timestamp: this._getString(event, ['Time', 'timestamp', 'time']) || new Date().toISOString(),
        eventType: this._normalizeEventType(this._getString(event, ['Type', 'type'])),
        teamId: this._getString(event, ['TeamId', 'teamId']) || '',
        teamName: this._getString(event, ['TeamName', 'teamName']) || '',
        description: this._getString(event, ['Desc', 'description', 'Description']) || '',
        severity: this._normalizeSeverity(this._getString(event, ['Severity', 'severity'])),
      };
    } catch (error) {
      console.error('[DataTransformer] Error transforming event:', error);
      return null;
    }
  }

  transformWeather(data) {
    if (!data) return null;

    try {
      const d = data;
      const temperature = this._getNumber(d, ['Temperature', 'temperature', 'Temp', 'temp']) || 0;
      const humidity = this._getNumber(d, ['Humidity', 'humidity']) || 0;
      const windSpeed = this._getNumber(d, ['Wind', 'WindSpeed', 'wind', 'windSpeed']) || 0;
      const surface = this._getString(d, ['TrackCondition', 'SurfaceCondition', 'trackCondition', 'surfaceCondition']);

      return {
        temperature,
        humidity,
        windSpeed,
        surfaceCondition: this._normalizeSurfaceCondition(surface),
      };
    } catch (error) {
      console.error('[DataTransformer] Error transforming weather:', error);
      return null;
    }
  }

  transformRaceInfo(data) {
    if (!data) return null;

    try {
      const d = data;
      return {
        status: this._normalizeRaceStatus(this._getString(d, ['Status', 'status'])),
        elapsedHours: this._parseRaceTime(this._getString(d, ['RaceTime', 'ElapsedTime', 'raceTime', 'elapsedTime'])),
        eventName: this._getString(d, ['EventName', 'eventName', 'Event', 'event']) || 'Nürburgring 24h',
      };
    } catch (error) {
      console.error('[DataTransformer] Error transforming raceInfo:', error);
      return null;
    }
  }

  // ========== Helpers ==========

  _getString(obj, keys) {
    for (const key of keys) {
      const value = obj[key];
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
    return '';
  }

  _getNumber(obj, keys) {
    for (const key of keys) {
      const value = obj[key];
      if (typeof value === 'number') return value;
      if (typeof value === 'string' && value.trim()) {
        const parsed = parseFloat(value);
        if (!isNaN(parsed)) return parsed;
      }
    }
    return null;
  }

  _normalizeCategory(category) {
    const map = {
      'GT3': 'SP9', 'GT2': 'SP8', 'GT1': 'SP10',
      'SP10': 'SP10', 'SP9': 'SP9', 'SP8': 'SP8',
      'CUP': 'Cup', 'TCR': 'TCR',
    };
    return map[category?.toUpperCase()] || 'GT';
  }

  _normalizeStatus(status) {
    if (!status) return 'running';
    const upper = status.toUpperCase();
    if (upper.includes('RUN') || upper.includes('ACTIVE')) return 'running';
    if (upper.includes('PIT')) return 'pit';
    if (upper.includes('FINISH')) return 'finished';
    if (upper.includes('DNF') || upper.includes('RETIRE')) return 'dnf';
    if (upper.includes('DSQ') || upper.includes('EXCLUDED')) return 'dsq';
    return 'running';
  }

  _normalizeEventType(type) {
    if (!type) return 'incident';
    const upper = type.toUpperCase();
    if (upper.includes('PIT')) return 'pit_stop';
    if (upper.includes('INCIDENT') || upper.includes('ACCIDENT')) return 'incident';
    if (upper === 'RED' || upper.includes('RED FLAG')) return 'red_flag';
    if (upper === 'YELLOW' || upper.includes('YELLOW FLAG')) return 'yellow_flag';
    if (upper.includes('SAFETY') || upper === 'SC') return 'safety_car';
    return 'incident';
  }

  _normalizeSeverity(severity) {
    if (!severity) return 'info';
    const upper = severity.toUpperCase();
    if (upper.includes('CRITICAL') || upper.includes('RED')) return 'critical';
    if (upper.includes('WARNING') || upper.includes('YELLOW')) return 'warning';
    return 'info';
  }

  _normalizeSurfaceCondition(condition) {
    if (!condition) return 'unknown';
    const upper = condition.toUpperCase();
    if (upper.includes('DRY')) return 'dry';
    if (upper.includes('WET') || upper.includes('RAIN')) return 'wet';
    return 'unknown';
  }

  _normalizeRaceStatus(status) {
    if (!status) return 'unknown';
    const upper = status.toUpperCase();
    if (upper.includes('RUN') || upper.includes('LIVE')) return 'running';
    if (upper.includes('FINISH')) return 'finished';
    if (upper.includes('PAUSE') || upper.includes('RED')) return 'paused';
    return 'unknown';
  }

  _parsePitTime(timeStr) {
    if (!timeStr) return 0;
    const colonCount = (timeStr.match(/:/g) || []).length;
    if (colonCount === 2) {
      const parts = timeStr.split(':').map(Number);
      return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
    } else if (colonCount === 1) {
      const parts = timeStr.split(':').map(Number);
      return (parts[0] || 0) * 60 + (parts[1] || 0);
    }
    return parseFloat(timeStr) || 0;
  }

  _parseLapTime(timeStr) {
    if (!timeStr) return 0;
    if (timeStr.includes(':')) {
      const parts = timeStr.split(':');
      return parseFloat(parts[0] || '0') * 60 + parseFloat(parts[1] || '0');
    }
    return parseFloat(timeStr) || 0;
  }

  _parseRaceTime(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) {
      return parts[0] + parts[1] / 60 + parts[2] / 3600;
    }
    return 0;
  }
}

const dataTransformer = new DataTransformer();

module.exports = { DataTransformer, dataTransformer };