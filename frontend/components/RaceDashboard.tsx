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
  
  const remainingHours = Math.floor(remainingSeconds / 3600);
  const remainingMinutes = Math.floor((remainingSeconds % 3600) / 60);
  const remainingSecs = Math.floor(remainingSeconds % 60);
  const remainingTimeFormatted = `${String(remainingHours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'pit_stop': return <Wrench className="w-3.5 h-3.5" />;
      case 'incident': return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'flag': return <Flag className="w-3.5 h-3.5" />;
      default: return <Clock className="w-3.5 h-3.5" />;
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
    <div className="bg-racing-dark rounded-lg border border-racing-light/10">
      {/* Header - Mobile First */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">{t('Panel de Carrera', 'Race Dashboard')}</h2>
            <p className="text-xs sm:text-sm text-racing-muted">
              {t('Hora actual', 'Current time')}: {String(currentHourFormatted).padStart(2, '0')}:{String(currentMinuteFormatted).padStart(2, '0')}h
            </p>
          </div>
          
          {/* Weather + Time to End - Stacked on mobile, row on desktop */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Time to End */}
            <div className="flex items-center gap-2 bg-racing-darker px-3 py-2 rounded-lg border border-racing-red/30 flex-1 sm:flex-none">
              <Clock className="w-4 h-4 text-racing-red flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs text-racing-muted uppercase block truncate">{t('Tiempo para finalizar', 'Time to end')}</span>
                <span className="text-base sm:text-lg font-mono font-bold text-racing-red">{remainingTimeFormatted}</span>
              </div>
            </div>
            {/* Weather */}
            <div className="flex items-center gap-1.5 bg-racing-darker px-2.5 py-2 rounded-lg">
              <CloudRain className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white">18°C</span>
            </div>
            {/* Track Temp */}
            <div className="flex items-center gap-1.5 bg-racing-darker px-2.5 py-2 rounded-lg">
              <Thermometer className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-white">24°C</span>
            </div>
          </div>
        </div>

        {/* Race Progress Bar */}
        <div className="mb-6 sm:mb-8">
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
          <div className="flex justify-between mt-1 text-[10px] sm:text-xs text-racing-muted">
            <span>00:00</span>
            <span className="hidden sm:inline">06:00</span>
            <span>12:00</span>
            <span className="hidden sm:inline">18:00</span>
            <span>24:00</span>
          </div>
        </div>

        {/* Key Metrics Grid - 2 cols mobile, 4 cols desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <MetricCard
            icon={<Gauge className="w-4 h-4 text-semantic-success" />}
            label={t('Vueltas', 'Laps')}
            value="142"
            sub="de ~160 est."
          />
          <MetricCard
            icon={<Clock className="w-4 h-4 text-racing-red" />}
            label={t('Ritmo', 'Pace')}
            value="8:24"
            sub="min/vuelta"
          />
          <MetricCard
            icon={<Wrench className="w-4 h-4 text-blue-400" />}
            label={t('Paradas', 'Stops')}
            value="15"
            sub="prom/equipo"
          />
          <MetricCard
            icon={<AlertTriangle className="w-4 h-4 text-semantic-warning" />}
            label={t('Incidentes', 'Incidents')}
            value="3"
            sub="banderas"
          />
        </div>

        {/* Two Column Layout - Stack on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Leaders */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              {t('Líderes por Categoría', 'Category Leaders')}
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {categoryLeaders.map((leader) => (
                <div key={leader.category} className="bg-racing-darker rounded-lg p-3 sm:p-4 border border-racing-light/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <span className={`px-2 py-1 rounded text-[10px] sm:text-xs font-bold flex-shrink-0 ${getCategoryColor(leader.category)}`}>
                        {leader.category}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-white text-xs sm:text-sm truncate">{leader.team}</p>
                        <p className="text-[10px] sm:text-xs text-racing-muted">Pos. #{leader.position}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-xs sm:text-sm font-mono text-white">{leader.laps} v.</p>
                      <p className="text-[10px] sm:text-xs text-racing-muted">{leader.gap}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Race Events Timeline */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Flag className="w-4 h-4 sm:w-5 sm:h-5 text-racing-red" />
              {t('Eventos de Carrera', 'Race Events')}
            </h3>
            <div className="space-y-3 sm:space-y-4 border-l-2 border-racing-light/20 pl-3 sm:pl-4">
              {mockEvents.map((event) => (
                <div key={event.id} className="relative">
                  <div className={`absolute -left-[21px] sm:-left-6 top-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 border-racing-light ${getEventColor(event.type)}`}>
                    {getEventIcon(event.type)}
                  </div>
                  <div className="ml-1 sm:ml-2">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-xs sm:text-sm font-semibold text-white">{event.title}</p>
                      <span className="text-[10px] sm:text-xs text-racing-muted bg-racing-dark px-1.5 py-0.5 rounded">
                        {Math.floor(event.time)}h {Math.floor((event.time % 1) * 60)}m
                      </span>
                    </div>
                    {event.teamName && (
                      <p className="text-[10px] sm:text-xs text-racing-muted mb-1">{event.teamName}</p>
                    )}
                    {event.description && (
                      <p className="text-[10px] sm:text-xs text-racing-light/70">{event.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="bg-racing-darker rounded-lg p-3 sm:p-4 border border-racing-light/10">
      <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
        {icon}
        <span className="text-[10px] sm:text-xs text-racing-muted uppercase">{label}</span>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-white">{value}</p>
      <p className="text-[10px] sm:text-xs text-racing-muted">{sub}</p>
    </div>
  );
}
