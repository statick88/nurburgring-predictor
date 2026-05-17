'use client';

import { Flag, AlertTriangle, Wrench, Clock, Gauge, Thermometer, CloudRain, Trophy } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useRace } from './RaceContext';

interface RaceEvent {
  id: string;
  time: number;
  type: 'pit_stop' | 'incident' | 'flag' | 'milestone';
  title: string;
  teamName?: string;
  description?: string;
}

interface CategoryLeader {
  category: string;
  team: string;
  position: number;
  laps: number;
  gap: string;
}

const mockEvents: RaceEvent[] = [
  { 
    id: '1', 
    time: 3.5, 
    type: 'pit_stop', 
    title: 'Pit Stop', 
    teamName: 'Falken Motorsports',
    description: 'Cambio de neumáticos y repostaje - 23.4s'
  },
  { 
    id: '2', 
    time: 6.2, 
    type: 'incident', 
    title: 'Minor Incident', 
    teamName: 'BMW M Motorsport',
    description: 'Contacto en Flugplatz - daño menor en alerón'
  },
  { 
    id: '3', 
    time: 12, 
    type: 'flag', 
    title: 'Red Flag', 
    description: 'Carrera detenida 45min por lluvia intensa'
  },
];

const categoryLeaders: CategoryLeader[] = [
  { category: 'GT3', team: 'Mercedes-AMG #3', position: 1, laps: 142, gap: 'Líder' },
  { category: 'TCR', team: 'BMW M3 #81', position: 6, laps: 138, gap: '+4 vueltas' },
  { category: 'GT4', team: 'BMW M4 #888', position: 32, laps: 128, gap: '+14 vueltas' },
  { category: 'Cup2', team: 'Porsche 911 #900', position: 21, laps: 135, gap: '+7 vueltas' },
];

export default function RaceDashboard() {
  const { t } = useLanguage();
  const { currentHour, progress, remainingSeconds } = useRace();
  
  const currentHourFormatted = Math.floor(currentHour);
  const currentMinuteFormatted = Math.floor((currentHour % 1) * 60);
  
  // Format remaining time as HH:MM:SS
  const remainingHours = Math.floor(remainingSeconds / 3600);
  const remainingMinutes = Math.floor((remainingSeconds % 3600) / 60);
  const remainingSecs = Math.floor(remainingSeconds % 60);
  const remainingTimeFormatted = `${String(remainingHours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'pit_stop': return <Wrench className="w-4 h-4" />;
      case 'incident': return <AlertTriangle className="w-4 h-4" />;
      case 'flag': return <Flag className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'pit_stop': return 'text-semantic-success bg-semantic-success/10';
      case 'incident': return 'text-semantic-warning bg-semantic-warning/10';
      case 'flag': return 'text-semantic-danger bg-semantic-danger/10';
      default: return 'text-racing-red bg-racing-red/10';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'GT3': return 'bg-racing-red/20 text-racing-red';
      case 'TCR': return 'bg-yellow-500/20 text-yellow-400';
      case 'GT4': return 'bg-semantic-success/20 text-semantic-success';
      case 'Cup2': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-racing-muted/20 text-racing-muted';
    }
  };

  return (
    <div className="bg-racing-dark rounded-lg border border-racing-light/10 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">{t('Panel de Carrera', 'Race Dashboard')}</h2>
          <p className="text-sm text-racing-muted">
            {t('Hora actual', 'Current time')}: {String(currentHourFormatted).padStart(2, '0')}:{String(currentMinuteFormatted).padStart(2, '0')}h
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Time to End */}
          <div className="flex items-center gap-2 bg-racing-darker px-4 py-2 rounded-lg border border-racing-red/30">
            <Clock className="w-4 h-4 text-racing-red" />
            <div className="flex flex-col">
              <span className="text-xs text-racing-muted uppercase">{t('Tiempo para finalizar', 'Time to end')}</span>
              <span className="text-lg font-mono font-bold text-racing-red">{remainingTimeFormatted}</span>
            </div>
          </div>
          {/* Weather */}
          <div className="flex items-center gap-2 bg-racing-darker px-3 py-2 rounded-lg">
            <CloudRain className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-white">18°C</span>
          </div>
          {/* Track Temp */}
          <div className="flex items-center gap-2 bg-racing-darker px-3 py-2 rounded-lg">
            <Thermometer className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-white">24°C</span>
          </div>
        </div>
      </div>

      {/* Race Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-white">{t('Progreso de Carrera', 'Race Progress')}</span>
          <span className="text-sm font-mono text-racing-red">{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full h-3 bg-racing-darker rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-racing-red via-semantic-warning to-semantic-success rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-racing-muted">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>24:00</span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-racing-darker rounded-lg p-4 border border-racing-light/10">
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="w-4 h-4 text-semantic-success" />
            <span className="text-xs text-racing-muted uppercase">{t('Vueltas', 'Laps')}</span>
          </div>
          <p className="text-2xl font-bold text-white">142</p>
          <p className="text-xs text-racing-muted">de ~160 estimadas</p>
        </div>
        
        <div className="bg-racing-darker rounded-lg p-4 border border-racing-light/10">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-racing-red" />
            <span className="text-xs text-racing-muted uppercase">{t('Ritmo', 'Pace')}</span>
          </div>
          <p className="text-2xl font-bold text-white">8:24</p>
          <p className="text-xs text-racing-muted">min/vuelta</p>
        </div>

        <div className="bg-racing-darker rounded-lg p-4 border border-racing-light/10">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-racing-muted uppercase">{t('Paradas', 'Stops')}</span>
          </div>
          <p className="text-2xl font-bold text-white">15</p>
          <p className="text-xs text-racing-muted">promedio por equipo</p>
        </div>

        <div className="bg-racing-darker rounded-lg p-4 border border-racing-light/10">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-semantic-warning" />
            <span className="text-xs text-racing-muted uppercase">{t('Incidentes', 'Incidents')}</span>
          </div>
          <p className="text-2xl font-bold text-white">3</p>
          <p className="text-xs text-racing-muted">banderas amarillas</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Leaders */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            {t('Líderes por Categoría', 'Category Leaders')}
          </h3>
          <div className="space-y-3">
            {categoryLeaders.map((leader) => (
              <div key={leader.category} className="bg-racing-darker rounded-lg p-4 border border-racing-light/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getCategoryColor(leader.category)}`}>
                      {leader.category}
                    </span>
                    <div>
                      <p className="font-semibold text-white text-sm">{leader.team}</p>
                      <p className="text-xs text-racing-muted">Pos. #{leader.position}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-white">{leader.laps} vueltas</p>
                    <p className="text-xs text-racing-muted">{leader.gap}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Race Events Timeline */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Flag className="w-5 h-5 text-racing-red" />
            {t('Eventos de Carrera', 'Race Events')}
          </h3>
          <div className="space-y-4 border-l-2 border-racing-light/20 pl-4">
            {mockEvents.map((event) => (
              <div key={event.id} className="relative">
                <div className={`absolute -left-6 top-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-racing-light ${getEventColor(event.type)}`}>
                  {getEventIcon(event.type)}
                </div>
                <div className="ml-2">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-white">{event.title}</p>
                    <span className="text-xs text-racing-muted bg-racing-dark px-2 py-0.5 rounded">
                      {Math.floor(event.time)}h {Math.floor((event.time % 1) * 60)}m
                    </span>
                  </div>
                  {event.teamName && (
                    <p className="text-xs text-racing-muted mb-1">{event.teamName}</p>
                  )}
                  {event.description && (
                    <p className="text-xs text-racing-light/70">{event.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
