import React from 'react';
import clsx from 'clsx';

interface GaugeProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: 'cyan' | 'yellow' | 'red' | 'green' | 'blue';
  icon?: React.ReactNode;
}

const Gauge: React.FC<GaugeProps> = ({ label, value, max, unit, color, icon }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colorClasses = {
    cyan: 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]',
    yellow: 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]',
    red: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]',
    green: 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]',
    blue: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]',
  };

  const textClasses = {
    cyan: 'text-cyan-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
    green: 'text-green-400',
    blue: 'text-blue-400',
  };

  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium uppercase tracking-wider">
          {icon}
          {label}
        </div>
        <div className={clsx("font-mono font-bold text-lg", textClasses[color])}>
          {value.toFixed(1)} <span className="text-xs opacity-70">{unit}</span>
        </div>
      </div>
      
      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={clsx("h-full transition-all duration-300 ease-out rounded-full", colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default Gauge;
