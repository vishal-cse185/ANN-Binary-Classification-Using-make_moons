import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: string;
  glow?: 'primary' | 'cyan' | 'emerald' | 'amber' | 'rose';
  trend?: string;
  trendPositive?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  glow = 'primary',
  trend,
  trendPositive = true,
}) => {
  const glowColors = {
    primary: 'border-indigo-500/20 hover:border-indigo-500/40 hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.25)]',
    cyan: 'border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-[0_0_25px_-5px_rgba(6,182,212,0.25)]',
    emerald: 'border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.25)]',
    amber: 'border-amber-500/20 hover:border-amber-500/40 hover:shadow-[0_0_25px_-5px_rgba(245,158,11,0.25)]',
    rose: 'border-rose-500/20 hover:border-rose-500/40 hover:shadow-[0_0_25px_-5px_rgba(244,63,94,0.25)]',
  };

  const iconColors = {
    primary: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-900/60 backdrop-blur-md border p-5 transition-all duration-300 ${glowColors[glow]}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold tracking-tight text-white font-mono">{value}</h3>
            {badge && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-lg border ${iconColors[glow]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 flex items-center text-xs">
          <span className={`font-semibold mr-1.5 ${trendPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trendPositive ? '↑' : '↓'} {trend}
          </span>
          <span className="text-slate-500">vs benchmark</span>
        </div>
      )}
    </div>
  );
};
