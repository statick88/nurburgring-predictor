'use client';

import { Flag, AlertTriangle, Wrench, Milestone } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useRace } from './RaceContext';

interface RaceEvent {
  id: string;
  time: number;
  type: 'pit_stop' | 'incident' | 'flag' | 'milestone';
  title: string;
  teamName?: string;
}

interface RaceTimelineProps {
  raceStartTime?: Date;
  events?: RaceEvent[];
}

const mockEvents: RaceEvent[] = [
  { id: '1', time: 3.5, type: 'pit_stop', title: 'Pit Stop', teamName: 'Falken Motorsports' },
  { id: '2', time: 6.2, type: 'incident', title: 'Minor Incident', teamName: 'BMW M Motorsport' },
  { id: '3', time: 12, type: 'flag', title: 'Red Flag' },
];

export default function RaceTimeline({
  events = mockEvents,
}: RaceTimelineProps) {
  const { t } = useLanguage();
  const { currentHour } = useRace();
  const progress = (currentHour / 24) * 100;

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'pit_stop':
        return <Wrench className="w-3 h-3" />;
      case 'incident':
        return <AlertTriangle className="w-3 h-3" />;
      case 'flag':
        return <Flag className="w-3 h-3" />;
      default:
        return <Milestone className="w-3 h-3" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'pit_stop':
        return 'bg-semantic-success';
      case 'incident':
        return 'bg-semantic-warning';
      case 'flag':
        return 'bg-semantic-danger';
      default:
        return 'bg-racing-red';
    }
  };

  return (
    <div className="bg-racing-dark rounded-lg border border-racing-light/10 p-6">
      {/* Timeline Bar */}
      <div className="relative mb-8">
        <div className="flex items-center gap-4">
          {/* Start */}
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 bg-semantic-success rounded-full border-2 border-racing-light"></div>
            <p className="text-xs text-racing-muted mt-1 w-12 text-center">00:00</p>
          </div>

          {/* Progress Bar */}
          <div className="flex-1 h-2 bg-racing-darker rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-racing-red to-semantic-success rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
            {/* Event Markers */}
            {events.map((event) => (
              <div
                key={event.id}
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-racing-light ${getEventColor(event.type)}`}
                style={{ left: `${(event.time / 24) * 100}%` }}
                title={`${event.title} @ ${event.time}h`}
              />
            ))}
          </div>

          {/* Current */}
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 bg-racing-red rounded-full border-2 border-racing-light animate-pulse"></div>
            <p className="text-xs text-racing-red mt-1 w-12 text-center font-bold">
              {String(Math.floor(currentHour)).padStart(2, '0')}:00
            </p>
          </div>

          {/* End */}
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 bg-racing-darker rounded-full border-2 border-racing-light/30"></div>
            <p className="text-xs text-racing-muted mt-1 w-12 text-center">24:00</p>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-3 border-l-2 border-racing-light/20 pl-4">
        {events.map((event) => (
          <div key={event.id} className="flex gap-3">
            <div className={`w-3 h-3 rounded-full border-2 border-racing-light mt-1.5 -ml-5.5 ${getEventColor(event.type)}`}>
              {getEventIcon(event.type)}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{event.title}</p>
              <p className="text-xs text-racing-muted">
                {event.teamName && `${event.teamName} @ `}
                {Math.floor(event.time)}h {Math.floor((event.time % 1) * 60)}m
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}