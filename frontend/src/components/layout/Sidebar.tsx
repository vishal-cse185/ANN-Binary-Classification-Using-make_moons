import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Database,
  Network,
  PlayCircle,
  LineChart,
  Crosshair,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export type ModuleId =
  | 'overview'
  | 'explorer'
  | 'architecture'
  | 'training'
  | 'evaluation'
  | 'playground'
  | 'explainability';

interface SidebarProps {
  activeModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  collapsed,
  onToggleCollapse,
}) => {
  const navItems = [
    {
      id: 'overview' as ModuleId,
      name: 'Overview Dashboard',
      shortName: 'Overview',
      icon: LayoutDashboard,
      badge: 'Metrics',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      description: 'System health & summary statistics',
    },
    {
      id: 'explorer' as ModuleId,
      name: 'Data Explorer',
      shortName: 'Data',
      icon: Database,
      badge: 'Moons',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      description: 'make_moons generator & distributions',
    },
    {
      id: 'architecture' as ModuleId,
      name: 'ANN Architecture Studio',
      shortName: 'Architecture',
      icon: Network,
      badge: '5 Layers',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      description: '2→16→32→16→1 Network graph',
    },
    {
      id: 'training' as ModuleId,
      name: 'Model Training Center',
      shortName: 'Training',
      icon: PlayCircle,
      badge: 'Adam+BCE',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      description: 'Epoch curves & early stopping',
    },
    {
      id: 'evaluation' as ModuleId,
      name: 'Model Evaluation Center',
      shortName: 'Evaluation',
      icon: LineChart,
      badge: 'ROC/AUC',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      description: 'Confusion matrix & decision boundary',
    },
    {
      id: 'playground' as ModuleId,
      name: 'Prediction Playground',
      shortName: 'Playground',
      icon: Crosshair,
      badge: 'Interactive',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      description: 'Real-time coordinate classification',
    },
    {
      id: 'explainability' as ModuleId,
      name: 'Model Explainability',
      shortName: 'Explain',
      icon: Lightbulb,
      badge: 'Math Trace',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      description: 'Forward prop & activation calculus',
    },
  ];

  return (
    <aside
      className={`relative z-20 flex flex-col border-r border-slate-800/80 bg-slate-950/95 transition-all duration-300 select-none ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      <div className="flex flex-col flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-3">
          {!collapsed ? (
            <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              STUDIO MODULES
            </p>
          ) : (
            <div className="w-full flex justify-center pb-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
          )}
        </div>

        {navItems.map((item) => {
          const isActive = activeModule === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              className={`group relative flex items-center w-full rounded-xl p-3 text-left transition-all ${
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavBackground"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600/30 via-indigo-500/20 to-transparent border border-indigo-500/40 shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)]"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}

              <div
                className={`relative z-10 flex items-center justify-center rounded-lg p-2 transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
                    : 'bg-slate-900 text-slate-400 group-hover:text-indigo-400 group-hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
              </div>

              {!collapsed && (
                <div className="relative z-10 ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold truncate leading-tight">
                      {item.name}
                    </span>
                    <span
                      className={`ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {item.description}
                  </p>
                </div>
              )}

              {/* Tooltip on collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-3 hidden group-hover:flex items-center px-3 py-1.5 rounded-lg bg-slate-900 text-slate-200 text-xs whitespace-nowrap shadow-xl border border-slate-700 z-50">
                  {item.name}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Collapse / Expand Toggle */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          onClick={onToggleCollapse}
          className="flex items-center justify-center w-full py-2 px-3 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-medium transition"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center space-x-2">
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse Sidebar</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
