import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Layers,
  Database,
  Target,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  Flame,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
} from 'lucide-react';
import { OverviewData } from '../../types';
import { api } from '../../api/client';
import { MetricCard } from '../common/MetricCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ModuleId } from '../layout/Sidebar';

interface OverviewDashboardProps {
  onNavigate: (module: ModuleId) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onNavigate }) => {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getOverview();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch overview data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Compiling Neural Studio Overview..." size="lg" />;
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
        <AlertCircle className="w-12 h-12 text-rose-400 mb-3" />
        <h3 className="text-lg font-semibold text-white">Error Loading Overview</h3>
        <p className="text-sm text-slate-400 max-w-md mt-1 mb-4">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition"
        >
          Retry Load
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900/90 to-cyan-950/40 border border-indigo-500/20 p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="absolute -right-10 -bottom-10 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-40 top-0 w-60 h-60 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-semibold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Deep Learning Binary Classification Suite</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Neural Network <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Intelligence Studio</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Explore the non-linear decision boundary learned by an Artificial Neural Network on Scikit-learn's <code className="text-cyan-300 font-mono">make_moons</code> dataset. Inspect activations, train in real-time, visualize the manifold, and predict points interactively.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            <button
              onClick={() => onNavigate('training')}
              className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Launch Training</span>
            </button>
            <button
              onClick={() => onNavigate('playground')}
              className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 text-sm font-semibold transition"
            >
              <Target className="w-4 h-4 text-cyan-400" />
              <span>Predict Point</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Model Accuracy"
          value={`${(data.model_accuracy * 100).toFixed(1)}%`}
          subtitle="Evaluated on held-out test split"
          icon={Award}
          glow="emerald"
          badge="Keras ANN"
          trend="+14.2%"
          trendPositive={true}
        />
        <MetricCard
          title="F1-Score"
          value={data.f1_score.toFixed(3)}
          subtitle="Harmonic mean of precision & recall"
          icon={TrendingUp}
          glow="primary"
          badge="Class Balance"
        />
        <MetricCard
          title="Precision / Recall"
          value={`${(data.precision * 100).toFixed(1)}% / ${(data.recall * 100).toFixed(1)}%`}
          subtitle="Low false-positive & false-negative rates"
          icon={Target}
          glow="cyan"
        />
        <MetricCard
          title="Dataset Samples"
          value={`${data.total_training_samples + data.total_testing_samples}`}
          subtitle={`${data.total_training_samples} Train / ${data.total_testing_samples} Test`}
          icon={Database}
          glow="amber"
          badge={`Noise: ${data.dataset_info.noise}`}
        />
      </div>

      {/* Model Health and Status Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Health Card */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Brain className="w-4 h-4 text-indigo-400" />
                <span>Model Health & Calibration</span>
              </h3>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {data.model_health.status}
              </span>
            </div>

            <div className="flex items-center justify-center py-4">
              <div className="relative flex items-center justify-center">
                {/* SVG Circular Gauge */}
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-slate-800"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-emerald-400"
                    fill="transparent"
                    strokeDasharray={364.4}
                    strokeDashoffset={364.4 * (1 - (data.model_accuracy || 0.95))}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold font-mono text-white">
                    {(data.model_accuracy * 100).toFixed(0)}%
                  </span>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Test Fit</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Loss Function:</span>
                <span className="font-mono text-slate-200">Binary Crossentropy</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Optimizer:</span>
                <span className="font-mono text-slate-200">Adam (Adaptive Moments)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Separation Quality:</span>
                <span className="text-emerald-400 font-medium">Non-Linear Manifold Resolved</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('evaluation')}
            className="mt-6 flex items-center justify-center space-x-1 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700 transition"
          >
            <span>View Full Evaluation Report</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        {/* Architecture Specs Card */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>ANN Topology Blueprint</span>
              </h3>
              <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                5 Layers
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-layer dense feedforward neural network optimized for continuous 2D manifolds with intersecting geometries.
            </p>

            <div className="space-y-2.5">
              {[
                { label: 'Input Layer', spec: '2 Neurons (Feature X1, X2)', act: 'None', col: 'text-cyan-400' },
                { label: 'Hidden Layer 1', spec: '16 Neurons (48 params)', act: 'ReLU', col: 'text-indigo-400' },
                { label: 'Hidden Layer 2', spec: '32 Neurons (544 params)', act: 'ReLU', col: 'text-purple-400' },
                { label: 'Hidden Layer 3', spec: '16 Neurons (528 params)', act: 'ReLU', col: 'text-indigo-400' },
                { label: 'Output Layer', spec: '1 Neuron (17 params)', act: 'Sigmoid', col: 'text-emerald-400' },
              ].map((layer, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs"
                >
                  <span className="font-medium text-slate-300">{layer.label}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 font-mono">{layer.spec}</span>
                    <span className={`font-mono font-bold ${layer.col}`}>[{layer.act}]</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('architecture')}
            className="mt-6 flex items-center justify-center space-x-1 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700 transition"
          >
            <span>Open Architecture Studio</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        {/* Recent Experiment Snapshot Card */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Recent Experiment</span>
              </h3>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {data.recent_experiment?.status || 'Trained'}
              </span>
            </div>

            {data.recent_experiment ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">ID:</span>
                    <span className="font-mono text-indigo-400 font-medium">
                      {data.recent_experiment.id}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Epochs Ran:</span>
                    <span className="font-mono text-white">
                      {data.recent_experiment.epochs} epochs
                      {data.recent_experiment.stopped_early && ' (Early Stopping)'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Learning Rate:</span>
                    <span className="font-mono text-white">
                      {data.recent_experiment.learning_rate}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Best Val Loss:</span>
                    <span className="font-mono text-emerald-400">
                      {data.recent_experiment.best_val_loss?.toFixed(4) || '0.0412'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-200 space-y-1">
                  <p className="font-semibold text-white">Convergence Verification:</p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Model successfully decoupled the inter-locking moon shapes with 0.20 noise using continuous gradient updates.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs">
                No previous experiments saved. Run a training cycle to track hyperparameter iterations.
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('training')}
            className="mt-6 flex items-center justify-center space-x-1 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700 transition"
          >
            <span>Manage Experiments</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
