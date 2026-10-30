import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ModuleId } from './components/layout/Sidebar';
import { OverviewDashboard } from './components/overview/OverviewDashboard';
import { DataExplorer } from './components/explorer/DataExplorer';
import { ArchitectureStudio } from './components/architecture/ArchitectureStudio';
import { TrainingCenter } from './components/training/TrainingCenter';
import { EvaluationCenter } from './components/evaluation/EvaluationCenter';
import { PredictionPlayground } from './components/playground/PredictionPlayground';
import { ExplainabilityModule } from './components/explainability/ExplainabilityModule';

export function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [explainCoords, setExplainCoords] = useState<{ x1: number; x2: number }>({
    x1: 0.5,
    x2: 0.2,
  });
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleNavigateToExplain = (x1: number, x2: number) => {
    setExplainCoords({ x1, x2 });
    setActiveModule('explainability');
  };

  const moduleTitles: Record<ModuleId, string> = {
    overview: 'Overview Dashboard',
    explorer: 'Data Explorer',
    architecture: 'ANN Architecture Studio',
    training: 'Model Training Center',
    evaluation: 'Model Evaluation Center',
    playground: 'Prediction Playground',
    explainability: 'Model Explainability',
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080c14] text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={(id) => setActiveModule(id)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Sticky Top Navbar */}
        <Navbar
          activeModuleTitle={moduleTitles[activeModule]}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Dynamic Module Content Viewport */}
        <main className="flex-1 overflow-y-auto px-6 py-8 bg-mesh-glow">
          <div className="max-w-7xl mx-auto pb-16">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeModule}-${refreshKey}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {activeModule === 'overview' && (
                  <OverviewDashboard onNavigate={(m) => setActiveModule(m)} />
                )}
                {activeModule === 'explorer' && <DataExplorer />}
                {activeModule === 'architecture' && <ArchitectureStudio />}
                {activeModule === 'training' && <TrainingCenter />}
                {activeModule === 'evaluation' && <EvaluationCenter />}
                {activeModule === 'playground' && (
                  <PredictionPlayground onNavigateToExplain={handleNavigateToExplain} />
                )}
                {activeModule === 'explainability' && (
                  <ExplainabilityModule
                    initialX1={explainCoords.x1}
                    initialX2={explainCoords.x2}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <footer className="border-t border-slate-800/80 pt-6 pb-8 text-center text-xs text-slate-500">
            <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto px-4 gap-3">
              <p>
                NEURAL NETWORK INTELLIGENCE STUDIO • Interactive Binary Classification & ANN Analysis Platform
              </p>
              <div className="flex items-center space-x-3 font-mono text-[11px] text-slate-400">
                <span>TensorFlow 2.21</span>
                <span>•</span>
                <span>Scikit-Learn 1.7</span>
                <span>•</span>
                <span>FastAPI + Vite</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default App;
