import React, { useState, useEffect } from 'react';
import { Activity, BrainCircuit, RefreshCw, Cpu, Layers } from 'lucide-react';
import { api } from '../../api/client';

interface NavbarProps {
  activeModuleTitle: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeModuleTitle,
  onRefresh,
  isRefreshing = false,
}) => {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        await api.checkHealth();
        setBackendOnline(true);
      } catch {
        setBackendOnline(false);
      }
    };
    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-6 backdrop-blur-xl">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/25">
            <BrainCircuit className="h-6 w-6 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white">
                NEURAL NETWORK INTELLIGENCE STUDIO
              </h1>
              <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                PROD v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium tracking-wide">
              Interactive Binary Classification & ANN Analysis Platform
            </p>
          </div>
        </div>

        <div className="hidden lg:flex items-center space-x-2 pl-4 border-l border-slate-800 text-xs text-slate-400">
          <span className="text-slate-500">Current View:</span>
          <span className="font-semibold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/40">
            {activeModuleTitle}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Model Spec Badge */}
        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400">Arch:</span>
          <span className="font-mono font-medium text-slate-200">2→16→32→16→1</span>
        </div>

        {/* Backend Status indicator */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <span className="relative flex h-2 w-2">
            {backendOnline === true ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </>
            ) : backendOnline === false ? (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 animate-pulse"></span>
            )}
          </span>
          <span className="text-slate-300 font-medium">
            {backendOnline === true ? 'FastAPI & TF Active' : backendOnline === false ? 'Connecting...' : 'Verifying...'}
          </span>
        </div>

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh Studio Data"
            className="flex items-center justify-center h-9 w-9 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        )}
      </div>
    </header>
  );
};
