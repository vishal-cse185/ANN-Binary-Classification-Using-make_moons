import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import {
  Crosshair,
  Target,
  Sparkles,
  ArrowRight,
  HelpCircle,
  RotateCcw,
  Compass,
} from 'lucide-react';
import { PredictResponse, EvaluationResponse } from '../../types';
import { api } from '../../api/client';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface PredictionPlaygroundProps {
  onNavigateToExplain: (x1: number, x2: number) => void;
}

export const PredictionPlayground: React.FC<PredictionPlaygroundProps> = ({
  onNavigateToExplain,
}) => {
  const [x1, setX1] = useState<number>(0.5);
  const [x2, setX2] = useState<number>(0.2);
  const [prediction, setPrediction] = useState<PredictResponse | null>(null);
  const [evalData, setEvalData] = useState<EvaluationResponse | null>(null);
  const [predicting, setPredicting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Quick preset test points
  const presets = [
    { label: 'Deep Class 0', x1: 0.0, x2: 0.8 },
    { label: 'Deep Class 1', x1: 1.0, x2: -0.4 },
    { label: 'Decision Frontier', x1: 0.5, x2: 0.25 },
    { label: 'Upper Moon Tip', x1: 1.8, x2: 0.2 },
    { label: 'Lower Moon Tip', x1: -0.8, x2: 0.3 },
  ];

  const handlePredict = async (customX1?: number, customX2?: number) => {
    const queryX1 = customX1 !== undefined ? customX1 : x1;
    const queryX2 = customX2 !== undefined ? customX2 : x2;

    try {
      setPredicting(true);
      const res = await api.predict(queryX1, queryX2);
      setPrediction(res);
    } catch (err) {
      console.error('Prediction failed', err);
    } finally {
      setPredicting(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [evalRes, predRes] = await Promise.all([
          api.getEvaluation(),
          api.predict(0.5, 0.2),
        ]);
        setEvalData(evalRes);
        setPrediction(predRes);
      } catch (err) {
        console.error('Init error', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const selectPreset = (pX1: number, pX2: number) => {
    setX1(pX1);
    setX2(pX2);
    handlePredict(pX1, pX2);
  };

  if (loading) {
    return <LoadingSpinner label="Calibrating Decision Playground..." size="lg" />;
  }

  // Plotly data: Contour surface + Test points + Highlighting Current Input Point
  const contourData: any[] = [];
  if (evalData) {
    contourData.push({
      x: evalData.decision_boundary.x_vals,
      y: evalData.decision_boundary.y_vals,
      z: evalData.decision_boundary.grid_z,
      type: 'contour',
      colorscale: [
        [0.0, '#312e81'],
        [0.45, '#4338ca'],
        [0.5, '#ffffff'], // boundary
        [0.55, '#0891b2'],
        [1.0, '#06b6d4'],
      ],
      contours: {
        coloring: 'heatmap',
        showlines: true,
      },
      showscale: false,
      hoverinfo: 'none',
    });

    // Current query point crosshair
    contourData.push({
      x: [x1],
      y: [x2],
      mode: 'markers+text',
      type: 'scatter',
      name: 'Query Point',
      text: [`(${x1.toFixed(2)}, ${x2.toFixed(2)})`],
      textposition: 'top right',
      textfont: { color: '#ffffff', size: 12, family: 'monospace' },
      marker: {
        color: prediction?.predicted_class === 1 ? '#06b6d4' : '#6366f1',
        size: 16,
        symbol: 'cross',
        line: { color: '#ffffff', width: 2.5 },
      },
    });
  }

  const isClass1 = prediction?.predicted_class === 1;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Crosshair className="w-5 h-5 text-rose-400" />
              <h2 className="text-xl font-bold text-white">Interactive Prediction Playground</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Input coordinates (X1, X2) or click directly on the manifold chart to compute instant forward propagation predictions.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              Inference Mode: <span className="text-cyan-400 font-bold">Sub-millisecond</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Playground Grid: Left Controls & Output, Right Interactive Decision Space */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form, Presets, and Detailed Prediction Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Coordinates Input Form */}
          <div className="glass-panel rounded-2xl p-6 space-y-5">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Input Feature Vector</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex justify-between">
                  <span>Feature X1:</span>
                  <span className="font-mono text-cyan-400">{x1.toFixed(2)}</span>
                </label>
                <input
                  type="number"
                  step={0.05}
                  value={x1}
                  onChange={(e) => setX1(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex justify-between">
                  <span>Feature X2:</span>
                  <span className="font-mono text-indigo-400">{x2.toFixed(2)}</span>
                </label>
                <input
                  type="number"
                  step={0.05}
                  value={x2}
                  onChange={(e) => setX2(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Quick Coordinate Presets */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400">Quick Presets:</span>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectPreset(preset.x1, preset.x2)}
                    className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handlePredict()}
              disabled={predicting}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              <Target className="w-4 h-4" />
              <span>{predicting ? 'Computing Neural Output...' : 'Run Forward Propagation'}</span>
            </button>
          </div>

          {/* Visual Prediction Outcome Card */}
          {prediction && (
            <div
              className={`glass-panel-elevated rounded-2xl p-6 space-y-5 border-2 transition-all duration-300 ${
                isClass1 ? 'border-cyan-500/40 shadow-glow-cyan' : 'border-indigo-500/40 shadow-glow-primary'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Prediction Classification
                </span>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold font-mono border ${
                    isClass1
                      ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                      : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                  }`}
                >
                  Class {prediction.predicted_class}
                </span>
              </div>

              <div className="text-center py-3 space-y-1">
                <h4 className="text-3xl font-extrabold text-white tracking-tight">
                  {prediction.label_text}
                </h4>
                <p className="text-xs text-slate-400 font-mono">
                  Coordinates: ({prediction.x1.toFixed(3)}, {prediction.x2.toFixed(3)})
                </p>
              </div>

              {/* Probability Meter */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-indigo-400 font-semibold">
                    P(C0): {(prediction.probability_class_0 * 100).toFixed(1)}%
                  </span>
                  <span className="text-cyan-400 font-semibold">
                    P(C1): {(prediction.probability_class_1 * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-4 w-full rounded-full bg-slate-900 border border-slate-800 overflow-hidden flex">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-300"
                    style={{ width: `${prediction.probability_class_0 * 100}%` }}
                  />
                  <div
                    className="bg-cyan-400 h-full transition-all duration-300"
                    style={{ width: `${prediction.probability_class_1 * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Class 0 Crescent</span>
                  <span className="text-white font-bold font-mono">
                    Certainty: {prediction.confidence.toFixed(1)}%
                  </span>
                  <span>Class 1 Crescent</span>
                </div>
              </div>

              {/* Distance to Decision Boundary */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex justify-between items-center">
                <span className="text-slate-400">Boundary Margin:</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  Δp = {prediction.distance_to_boundary.toFixed(4)} from threshold
                </span>
              </div>

              {/* Action Button to Explainability */}
              <button
                onClick={() => onNavigateToExplain(x1, x2)}
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition group"
              >
                <span>Explain Why Model Classified This Point</span>
                <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition" />
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Visual Decision Boundary Contour Map with Click-to-Predict (7 Cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Target className="w-4 h-4 text-cyan-400" />
                <span>Decision Manifold & Point Location</span>
              </h3>
              <p className="text-xs text-slate-400">
                Click anywhere inside the chart canvas to move crosshairs and re-predict
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              White Line = Boundary (p=0.5)
            </span>
          </div>

          <div className="w-full h-[450px] rounded-xl overflow-hidden bg-slate-950/80 border border-slate-800">
            {evalData && (
              <Plot
                data={contourData}
                layout={{
                  autosize: true,
                  margin: { l: 45, r: 25, t: 25, b: 40 },
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'transparent',
                  xaxis: {
                    title: { text: 'Feature X1', font: { color: '#94a3b8', size: 10 } },
                    gridcolor: 'rgba(255,255,255,0.06)',
                    tickfont: { color: '#64748b', size: 9 },
                  },
                  yaxis: {
                    title: { text: 'Feature X2', font: { color: '#94a3b8', size: 10 } },
                    gridcolor: 'rgba(255,255,255,0.06)',
                    tickfont: { color: '#64748b', size: 9 },
                  },
                  showlegend: false,
                }}
                config={{ responsive: true, displayModeBar: false }}
                onClick={(e: any) => {
                  if (e.points && e.points[0]) {
                    const clickX = e.points[0].x;
                    const clickY = e.points[0].y;
                    if (typeof clickX === 'number' && typeof clickY === 'number') {
                      setX1(Number(clickX.toFixed(2)));
                      setX2(Number(clickY.toFixed(2)));
                      handlePredict(clickX, clickY);
                    }
                  }
                }}
                style={{ width: '100%', height: '100%', cursor: 'crosshair' }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
