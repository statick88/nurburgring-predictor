'use client';

import { Fuel, Gauge, Timer, Zap } from 'lucide-react';

interface StatIndicatorProps {
  label: string;
  value: number; // 0-100
  unit?: string;
  variant?: 'circular' | 'linear';
  status?: 'normal' | 'warning' | 'critical';
  icon?: 'fuel' | 'tire' | 'temp' | 'battery';
  showTrend?: boolean;
}

export default function StatIndicator({
  label,
  value,
  unit = '%',
  variant = 'linear',
  status,
  icon = 'fuel',
  showTrend = false,
}: StatIndicatorProps) {
  // Determine status based on value if not provided
  const getStatus = () => {
    if (status) return status;
    if (value > 70) return 'normal';
    if (value > 40) return 'warning';
    return 'critical';
  };

  const currentStatus = getStatus();
  
  const getStatusColor = () => {
    switch (currentStatus) {
      case 'normal':
        return 'text-semantic-success';
      case 'warning':
        return 'text-semantic-warning';
      case 'critical':
        return 'text-semantic-danger';
    }
  };

  const getGradientColor = () => {
    switch (currentStatus) {
      case 'normal':
        return 'from-semantic-success to-semantic-success';
      case 'warning':
        return 'from-semantic-warning to-semantic-success';
      case 'critical':
        return 'from-semantic-danger to-semantic-warning';
    }
  };

  const getIcon = () => {
    switch (icon) {
      case 'fuel':
        return <Fuel className="w-4 h-4" />;
      case 'tire':
        return <Gauge className="w-4 h-4" />;
      case 'temp':
        return <Timer className="w-4 h-4" />;
      case 'battery':
        return <Zap className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // SVG circle calculations for circular variant
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  if (variant === 'circular') {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        {/* Circular Progress */}
        <div className="relative w-24 h-24 mb-3">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#374151"
              strokeWidth="8"
            />
            {/* Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={`${getStatusColor()} transition-all duration-500`}
            />
          </svg>
          {/* Center Value */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className={`text-2xl font-bold ${getStatusColor()}`}>
                {value}
              </span>
              <span className="text-xs text-racing-muted">{unit}</span>
            </div>
          </div>
        </div>
        
        {/* Label */}
        <div className="flex items-center gap-1">
          <span className={getStatusColor()}>{getIcon()}</span>
          <p className="text-sm font-semibold text-white">{label}</p>
        </div>
      </div>
    );
  }

  // Linear variant
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className={getStatusColor()}>{getIcon()}</span>
          <span className="text-sm font-semibold text-white">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-mono font-bold ${getStatusColor()}`}>
            {value}{unit}
          </span>
          {showTrend && (
            <span className={`text-xs ${value > 50 ? 'text-semantic-success' : 'text-semantic-danger'}`}>
              {value > 50 ? '↑' : '↓'}
            </span>
          )}
        </div>
      </div>
      <div className="w-full bg-racing-darker rounded-full h-3 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all bg-gradient-to-r ${getGradientColor()}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}