import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Cpu,
  Zap,
  TrendingDown,
  Layers,
  ArrowRight,
  HelpCircle,
  Activity,
  Calculator,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import { ExplainResponse } from '../../types';
import { api } from '../../api/client';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface ExplainabilityModuleProps {
  initialX1?: number;
  initialX2?: number;
}

export const ExplainabilityModule: React.FC<ExplainabilityModuleProps> = ({
  initialX1 = 0.5,
  initialX2 = 0.2,
}) => {
  const [x1, setX1] = useState<number>(initialX1);
  const [x2, setX2] = useState<number>(initialX2);
  const [explainData, setExplainData] = useState<ExplainResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [calculating, setCalculating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'trace' | 'concepts'>('trace');

  const loadExplanation = async (targetX1: number, targetX2: number) => {
    try {
      setCalculating(true);
      const res = await api.explain(targetX1, targetX2);
      setExplainData(res);
    } catch (err) {
      console.error('Explanation error', err);
    } finally {
      setCalculating(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    setX1(initialX1);
    setX2(initialX2);
    loadExplanation(initialX1, initialX2);
  }, [initialX1, initialX2]);

  if (loading) {
    return <LoadingSpinner label="Tracing Forward Propagation & Neuron Gradients..." size="lg" />;
  }

  const isClass1 = explainData?.predicted_class === 1;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white">Model Explainability & Calculus Studio</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Step-by-step mathematical decomposition of forward propagation, non-linear activation states, loss computation, and backpropagation mechanics.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-1 text-xs">
            <button
              onClick={() => setActiveTab('trace')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                activeTab === 'trace'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Forward Prop Trace
            </button>
            <button
              onClick={() => setActiveTab('concepts')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                activeTab === 'concepts'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Theory & Concepts
            </button>
          </div>
        </div>
      </div>

      {/* Coordinate Query Bar */}
      <div className="glass-panel rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Compass className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-white">Active Evaluation Coordinate:</span>
            <span className="ml-2 font-mono text-cyan-400 font-bold">
              ({x1.toFixed(2)}, {x2.toFixed(2)})
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs">
            <label className="text-slate-400">X1:</label>
            <input
              type="number"
              step={0.1}
              value={x1}
              onChange={(e) => setX1(parseFloat(e.target.value) || 0)}
              className="w-20 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <label className="text-slate-400">X2:</label>
            <input
              type="number"
              step={0.1}
              value={x2}
              onChange={(e) => setX2(parseFloat(e.target.value) || 0)}
              className="w-20 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            onClick={() => loadExplanation(x1, x2)}
            disabled={calculating}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition disabled:opacity-50"
          >
            {calculating ? 'Tracing...' : 'Recompute Trace'}
          </button>
        </div>
      </div>

      {activeTab === 'trace' && explainData && (
        <div className="space-y-6">
          {/* Decision Rationale Card */}
          <div
            className={`glass-panel-elevated rounded-2xl p-6 border-l-4 ${
              isClass1 ? 'border-l-cyan-500' : 'border-l-indigo-500'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <CheckCircle2 className={`w-5 h-5 ${isClass1 ? 'text-cyan-400' : 'text-indigo-400'}`} />
                <span>Classification Decision Rationale</span>
              </h3>
              <span
                className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                  isClass1
                    ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                    : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                }`}
              >
                Assigned: Class {explainData.predicted_class} ({(explainData.probability * 100).toFixed(2)}% probability)
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              {explainData.decision_rational}
            </p>
          </div>

          {/* Layer-by-Layer Forward Propagation Tracer */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>Step-by-Step Forward Propagation Trace</span>
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {explainData.layer_traces.map((trace) => {
                const isOutput = trace.layer_index === 4;
                const activeCount = trace.post_activations.filter((a) => a > 0).length;

                return (
                  <div
                    key={trace.layer_index}
                    className="glass-panel rounded-xl p-5 space-y-4 hover:border-slate-700 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 font-mono text-xs font-bold border border-indigo-500/30">
                          {trace.layer_index}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white font-mono">
                            {trace.layer_name.toUpperCase()}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            {trace.num_neurons} Neurons • Activation: <strong className="text-cyan-400">{trace.activation_type}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-xs font-mono">
                        {!isOutput && (
                          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                            Active Neurons: <strong className="text-emerald-400">{activeCount}</strong> / {trace.num_neurons} ({((activeCount / trace.num_neurons) * 100).toFixed(0)}%)
                          </span>
                        )}
                        {isOutput && (
                          <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                            Sigmoid Output Probability: {trace.post_activations[0].toFixed(4)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Neuron Post-Activation Heatmap / Grid */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Neuron Activation Values: a = {trace.activation_type}(z)
                      </span>
                      <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-16 gap-2">
                        {trace.post_activations.map((val, nIdx) => {
                          const isActive = val > 0;
                          return (
                            <div
                              key={nIdx}
                              className={`p-2 rounded-lg border text-center transition-all ${
                                isActive
                                  ? 'bg-indigo-950/40 border-indigo-500/40 text-cyan-300 shadow-[0_0_10px_-2px_rgba(6,182,212,0.3)]'
                                  : 'bg-slate-900/60 border-slate-800 text-slate-600'
                              }`}
                            >
                              <span className="text-[9px] block text-slate-500 font-mono">N{nIdx + 1}</span>
                              <span className="text-xs font-mono font-bold block mt-0.5">
                                {val.toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Pre-activation z formula snippet */}
                    <div className="text-[11px] text-slate-400 font-mono bg-slate-950/50 p-2.5 rounded-lg border border-slate-900">
                      <span>z[{trace.layer_index}] = W[{trace.layer_index}] · a[{trace.layer_index - 1}] + b[{trace.layer_index}]</span>
                      <span className="ml-4 text-slate-500">
                        (Pre-activation range: [{Math.min(...trace.pre_activations).toFixed(2)}, {Math.max(...trace.pre_activations).toFixed(2)}])
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Loss Calculation & Penalties */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2 pb-3 border-b border-slate-800">
              <Calculator className="w-5 h-5 text-emerald-400" />
              <span>Loss Function Evaluation for Selected Coordinate</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-xs font-semibold text-slate-400">If Ground Truth was Class 0:</span>
                <p className="text-2xl font-bold font-mono text-indigo-400">
                  L = {explainData.mathematical_breakdown.binary_cross_entropy.loss_if_true_label_0.toFixed(4)}
                </p>
                <span className="text-[10px] text-slate-500">-log(1 - p) logarithmic penalty</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-xs font-semibold text-slate-400">If Ground Truth was Class 1:</span>
                <p className="text-2xl font-bold font-mono text-cyan-400">
                  L = {explainData.mathematical_breakdown.binary_cross_entropy.loss_if_true_label_1.toFixed(4)}
                </p>
                <span className="text-[10px] text-slate-500">-log(p) logarithmic penalty</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Theory & Concepts Tab */}
      {activeTab === 'concepts' && explainData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(explainData.concepts_summary).map(([title, desc], idx) => (
            <div key={idx} className="glass-panel rounded-2xl p-6 space-y-3">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-indigo-400" />
                <h4 className="text-base font-bold text-white">{title}</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{desc}</p>
            </div>
          ))}

          {/* Adam Moment Equations Card */}
          <div className="glass-panel rounded-2xl p-6 space-y-3 md:col-span-2">
            <h4 className="text-base font-bold text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-400" />
              <span>Adam Optimizer: First & Second Moment Adaptive Gradient Equations</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono pt-2">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-slate-400">1st Moment (Mean):</span>
                <p className="text-indigo-300 font-bold">m_t = β1·m_(t-1) + (1-β1)·g_t</p>
                <span className="text-[10px] text-slate-500 font-sans">Accumulates momentum</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-slate-400">2nd Moment (Variance):</span>
                <p className="text-cyan-300 font-bold">v_t = β2·v_(t-1) + (1-β2)·g_t²</p>
                <span className="text-[10px] text-slate-500 font-sans">Scales step size</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-slate-400">Parameter Update:</span>
                <p className="text-emerald-300 font-bold">θ_t = θ_(t-1) - α·m̂_t / (√v̂_t + ε)</p>
                <span className="text-[10px] text-slate-500 font-sans">Adaptive per-weight update</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
