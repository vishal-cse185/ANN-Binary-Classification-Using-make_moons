import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Network,
  Cpu,
  Layers,
  Zap,
  Info,
  CheckCircle,
  HelpCircle,
  Hash,
  Activity,
} from 'lucide-react';
import { ArchitectureResponse, LayerDetail } from '../../types';
import { api } from '../../api/client';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const ArchitectureStudio: React.FC = () => {
  const [arch, setArch] = useState<ArchitectureResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLayer, setSelectedLayer] = useState<number>(1); // default Hidden 1
  const [hoveredNeuron, setHoveredNeuron] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.getArchitecture();
        setArch(res);
      } catch (err) {
        console.error('Arch load error', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Constructing Neural Architecture Blueprint..." size="lg" />;
  }

  // Network topology layers to render in diagram
  // Layer 0: Input (2), Layer 1: H1 (16), Layer 2: H2 (32), Layer 3: H3 (16), Layer 4: Output (1)
  const layerDefs = [
    { id: 0, title: 'Input Layer', neurons: 2, displayNeurons: 2, activation: 'Linear / Raw', color: '#06b6d4', role: 'Feature Inputs (X1, X2)' },
    { id: 1, title: 'Hidden Layer 1', neurons: 16, displayNeurons: 8, activation: 'ReLU', color: '#6366f1', role: 'Initial Manifold Unfolding' },
    { id: 2, title: 'Hidden Layer 2', neurons: 32, displayNeurons: 10, activation: 'ReLU', color: '#a855f7', role: 'High-Dimensional Non-Linear Mapping' },
    { id: 3, title: 'Hidden Layer 3', neurons: 16, displayNeurons: 8, activation: 'ReLU', color: '#6366f1', role: 'Bottleneck Feature Extraction' },
    { id: 4, title: 'Output Layer', neurons: 1, displayNeurons: 1, activation: 'Sigmoid', color: '#10b981', role: 'Binary Probability P(Class=1)' },
  ];

  const currentLayer = arch?.layers[selectedLayer] || arch?.layers[0];

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel rounded-xl p-5 border-l-4 border-l-indigo-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Total Parameters</p>
              <h3 className="text-2xl font-bold font-mono text-white mt-1">{arch?.total_params || 1137}</h3>
            </div>
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-mono">100% Trainable weights</p>
        </div>

        <div className="glass-panel rounded-xl p-5 border-l-4 border-l-cyan-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Layers Depth</p>
              <h3 className="text-2xl font-bold font-mono text-white mt-1">5 Layers</h3>
            </div>
            <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">1 Input • 3 Hidden • 1 Output</p>
        </div>

        <div className="glass-panel rounded-xl p-5 border-l-4 border-l-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Hidden Activations</p>
              <h3 className="text-2xl font-bold font-mono text-white mt-1">ReLU</h3>
            </div>
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-mono">f(z) = max(0, z)</p>
        </div>

        <div className="glass-panel rounded-xl p-5 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Optimizer & Loss</p>
              <h3 className="text-xl font-bold text-white mt-1 truncate">Adam / BCE</h3>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-mono">Binary Crossentropy</p>
        </div>
      </div>

      {/* Interactive Neural Network Architecture Canvas */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Network className="w-5 h-5 text-indigo-400" />
              <span>Interactive ANN Computation Graph</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any layer column to inspect its parameter calculations, matrix dimensions, and activation mechanics.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>Signals Propagating Left → Right</span>
            </span>
          </div>
        </div>

        {/* SVG Diagram Canvas */}
        <div className="relative w-full h-[440px] mt-6 bg-slate-950/80 rounded-xl border border-slate-800/90 overflow-hidden flex items-center justify-center p-4">
          <svg className="w-full h-full" viewBox="0 0 900 400" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="connGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="activeConnGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* Render Synapse Connections between adjacent layers */}
            {layerDefs.slice(0, -1).map((srcLayer, lIdx) => {
              const tgtLayer = layerDefs[lIdx + 1];
              const x1 = 100 + lIdx * 175;
              const x2 = 100 + (lIdx + 1) * 175;

              return (
                <g key={`layer-conn-${lIdx}`}>
                  {Array.from({ length: srcLayer.displayNeurons }).map((_, sIdx) => {
                    const y1 = 200 + (sIdx - (srcLayer.displayNeurons - 1) / 2) * 36;
                    return Array.from({ length: tgtLayer.displayNeurons }).map((_, tIdx) => {
                      const y2 = 200 + (tIdx - (tgtLayer.displayNeurons - 1) / 2) * 36;
                      const isHighlighted = selectedLayer === lIdx + 1;
                      return (
                        <line
                          key={`synapse-${lIdx}-${sIdx}-${tIdx}`}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={isHighlighted ? 'url(#activeConnGrad)' : 'rgba(99, 102, 241, 0.08)'}
                          strokeWidth={isHighlighted ? 0.9 : 0.4}
                          strokeDasharray={isHighlighted ? '4 2' : 'none'}
                        />
                      );
                    });
                  })}
                </g>
              );
            })}

            {/* Render Layer Columns & Neurons */}
            {layerDefs.map((layer, lIdx) => {
              const cx = 100 + lIdx * 175;
              const isSelected = selectedLayer === lIdx;

              return (
                <g
                  key={`layer-col-${lIdx}`}
                  className="cursor-pointer"
                  onClick={() => setSelectedLayer(lIdx)}
                >
                  {/* Layer Header Label */}
                  <rect
                    x={cx - 65}
                    y={16}
                    width={130}
                    height={38}
                    rx={8}
                    fill={isSelected ? 'rgba(99,102,241,0.25)' : 'rgba(15,23,42,0.8)'}
                    stroke={isSelected ? layer.color : 'rgba(255,255,255,0.1)'}
                    strokeWidth={isSelected ? 1.5 : 1}
                  />
                  <text
                    x={cx}
                    y={32}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="700"
                  >
                    {layer.title}
                  </text>
                  <text
                    x={cx}
                    y={46}
                    textAnchor="middle"
                    fill={layer.color}
                    fontSize="9.5"
                    fontFamily="monospace"
                  >
                    {layer.neurons} Neurons ({layer.activation})
                  </text>

                  {/* Neurons */}
                  {Array.from({ length: layer.displayNeurons }).map((_, nIdx) => {
                    const cy = 200 + (nIdx - (layer.displayNeurons - 1) / 2) * 36;
                    const neuronId = `L${lIdx}-N${nIdx}`;

                    return (
                      <g
                        key={neuronId}
                        onMouseEnter={() => setHoveredNeuron(neuronId)}
                        onMouseLeave={() => setHoveredNeuron(null)}
                      >
                        {/* Glow halo */}
                        {isSelected && (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={14}
                            fill={layer.color}
                            opacity={0.2}
                            className="animate-pulse"
                          />
                        )}
                        <circle
                          cx={cx}
                          cy={cy}
                          r={10}
                          fill="#0f172a"
                          stroke={layer.color}
                          strokeWidth={2}
                          className="transition-all hover:scale-125"
                        />
                        <circle
                          cx={cx}
                          cy={cy}
                          r={4}
                          fill={layer.color}
                        />
                      </g>
                    );
                  })}

                  {/* Dots indicator if neurons > displayNeurons */}
                  {layer.neurons > layer.displayNeurons && (
                    <text
                      x={cx}
                      y={365}
                      textAnchor="middle"
                      fill="#64748b"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      ... +{layer.neurons - layer.displayNeurons} more units ...
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Layer Detail Inspector & Mathematical Foundation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Layer Specification Inspector */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>Layer Inspector: {layerDefs[selectedLayer].title}</span>
            </h3>
            <span
              className="text-xs font-mono font-bold px-2.5 py-0.5 rounded border"
              style={{
                color: layerDefs[selectedLayer].color,
                borderColor: `${layerDefs[selectedLayer].color}40`,
                backgroundColor: `${layerDefs[selectedLayer].color}15`,
              }}
            >
              Layer {selectedLayer} of 4
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Neuron Count</span>
              <p className="text-xl font-bold font-mono text-white">
                {layerDefs[selectedLayer].neurons} Units
              </p>
              <span className="text-[10px] text-slate-400">
                Shape: [batch, {layerDefs[selectedLayer].neurons}]
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Activation Function</span>
              <p className="text-xl font-bold font-mono text-cyan-400">
                {layerDefs[selectedLayer].activation}
              </p>
              <span className="text-[10px] text-slate-400">
                {selectedLayer === 4 ? 'Compresses to [0, 1]' : 'Piecewise Linear Non-Linearity'}
              </span>
            </div>
          </div>

          {/* Parameter calculation explanation */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-300">Parameter Formula & Count:</span>
            {selectedLayer === 0 ? (
              <p className="text-xs font-mono text-slate-400">
                Input layer: 0 trainable parameters (direct ingestion of feature vector x = [x1, x2]).
              </p>
            ) : selectedLayer === 1 ? (
              <div className="text-xs font-mono text-slate-300 space-y-1">
                <p className="text-indigo-300">W: (2 inputs × 16 neurons) = 32 weights</p>
                <p className="text-indigo-300">b: 16 biases</p>
                <p className="text-white font-bold">Total: 32 + 16 = 48 parameters</p>
              </div>
            ) : selectedLayer === 2 ? (
              <div className="text-xs font-mono text-slate-300 space-y-1">
                <p className="text-purple-300">W: (16 inputs × 32 neurons) = 512 weights</p>
                <p className="text-purple-300">b: 32 biases</p>
                <p className="text-white font-bold">Total: 512 + 32 = 544 parameters</p>
              </div>
            ) : selectedLayer === 3 ? (
              <div className="text-xs font-mono text-slate-300 space-y-1">
                <p className="text-indigo-300">W: (32 inputs × 16 neurons) = 512 weights</p>
                <p className="text-indigo-300">b: 16 biases</p>
                <p className="text-white font-bold">Total: 512 + 16 = 528 parameters</p>
              </div>
            ) : (
              <div className="text-xs font-mono text-slate-300 space-y-1">
                <p className="text-emerald-300">W: (16 inputs × 1 neuron) = 16 weights</p>
                <p className="text-emerald-300">b: 1 bias</p>
                <p className="text-white font-bold">Total: 16 + 1 = 17 parameters</p>
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-300 flex items-start space-x-2">
            <HelpCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Layer Role:</strong> {layerDefs[selectedLayer].role}. This topology provides sufficient degrees of freedom to fold and separate intertwining moon crescents without overfitting.
            </p>
          </div>
        </div>

        {/* Activation & Loss Math Cards */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Zap className="w-4 h-4 text-purple-400" />
            <span>Mathematical Formulations</span>
          </h3>

          {/* ReLU Card */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white">Hidden Activation: ReLU</span>
              <span className="text-[11px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                f(z) = max(0, z)
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              ReLU (Rectified Linear Unit) avoids vanishing gradient phenomena for positive activations and introduces sparse neuron representations that sculpt non-linear classification boundaries.
            </p>
          </div>

          {/* Sigmoid Card */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white">Output Activation: Sigmoid</span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                σ(z) = 1 / (1 + e^-z)
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Compresses the raw scalar logit output into a well-calibrated posterior probability in the interval <code className="font-mono text-emerald-300">(0, 1)</code>.
            </p>
          </div>

          {/* Loss Card */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white">Loss: Binary Cross-Entropy</span>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                L = -[y log p + (1-y) log(1-p)]
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Measures negative log-likelihood of Bernoulli trials. Drives parameters via Adam optimizer with gradient backpropagation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
