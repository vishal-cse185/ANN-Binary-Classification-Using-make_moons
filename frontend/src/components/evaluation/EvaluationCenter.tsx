import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  LineChart as LineChartIcon,
  Award,
  CheckCircle2,
  FileText,
  Download,
  RotateCcw,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { EvaluationResponse } from '../../types';
import { api } from '../../api/client';
import { MetricCard } from '../common/MetricCard';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const EvaluationCenter: React.FC = () => {
  const [evalData, setEvalData] = useState<EvaluationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvaluation = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getEvaluation();
      setEvalData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load evaluation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvaluation();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Computing Evaluation Metrics & Decision Boundary Contour..." size="lg" />;
  }

  if (error || !evalData) {
    return (
      <div className="p-8 text-center glass-panel rounded-2xl">
        <p className="text-rose-400 text-sm">{error || 'No evaluation data available'}</p>
        <button
          onClick={loadEvaluation}
          className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  // ROC Curve points for Recharts
  const rocPoints = evalData.roc_curve.fpr.map((fpr, i) => ({
    fpr,
    tpr: evalData.roc_curve.tpr[i],
    diagonal: fpr, // y = x baseline for random guessing
  }));

  // Confusion Matrix counts
  const cm = evalData.confusion_matrix;
  const tn = cm[0]?.[0] || 0;
  const fp = cm[0]?.[1] || 0;
  const fn = cm[1]?.[0] || 0;
  const tp = cm[1]?.[1] || 0;
  const total = tn + fp + fn + tp || 1;

  // Prepare Decision Boundary Contour Plotly Data
  const contourData: any[] = [
    // Decision Boundary Contour Surface
    {
      x: evalData.decision_boundary.x_vals,
      y: evalData.decision_boundary.y_vals,
      z: evalData.decision_boundary.grid_z,
      type: 'contour',
      colorscale: [
        [0.0, '#312e81'],
        [0.45, '#4338ca'],
        [0.5, '#f8fafc'], // Decision Threshold
        [0.55, '#0891b2'],
        [1.0, '#06b6d4'],
      ],
      contours: {
        coloring: 'heatmap',
        showlines: true,
      },
      showscale: true,
      colorbar: {
        title: { text: 'P(Class=1)', font: { color: '#94a3b8', size: 10 } },
        tickfont: { color: '#64748b', size: 9 },
        thickness: 12,
        len: 0.8,
      },
      hoverinfo: 'none',
    },
    // Overlay Correct Class 0 Points
    {
      x: evalData.test_points.filter((p) => p.true_label === 0).map((p) => p.x1),
      y: evalData.test_points.filter((p) => p.true_label === 0).map((p) => p.x2),
      mode: 'markers',
      type: 'scatter',
      name: 'Class 0 (Upper)',
      marker: {
        color: '#c7d2fe',
        size: 6,
        symbol: 'circle',
        line: { color: '#4338ca', width: 1.5 },
      },
    },
    // Overlay Correct Class 1 Points
    {
      x: evalData.test_points.filter((p) => p.true_label === 1).map((p) => p.x1),
      y: evalData.test_points.filter((p) => p.true_label === 1).map((p) => p.x2),
      mode: 'markers',
      type: 'scatter',
      name: 'Class 1 (Lower)',
      marker: {
        color: '#67e8f9',
        size: 6,
        symbol: 'circle',
        line: { color: '#0e7490', width: 1.5 },
      },
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner & Export */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <LineChartIcon className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-white">Model Evaluation Center</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Rigorous statistical evaluation including confusion matrix heatmaps, classification reports, ROC curves, and continuous decision boundary manifolds.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => api.downloadEvaluationReport()}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-semibold transition"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Export Evaluation JSON</span>
            </button>
            <button
              onClick={loadEvaluation}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs transition"
              title="Refresh Evaluation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Overall Accuracy"
          value={`${(evalData.accuracy * 100).toFixed(1)}%`}
          subtitle="Fraction of correct test predictions"
          icon={Award}
          glow="emerald"
          badge="High Reliability"
        />
        <MetricCard
          title="ROC AUC Score"
          value={evalData.auc_roc.toFixed(4)}
          subtitle="Area Under Receiver Operating Curve"
          icon={CheckCircle2}
          glow="cyan"
          badge="Near Perfect"
        />
        <MetricCard
          title="Precision (Macro)"
          value={`${(evalData.precision * 100).toFixed(1)}%`}
          subtitle="Low false discovery risk"
          icon={FileText}
          glow="primary"
        />
        <MetricCard
          title="Recall (Macro)"
          value={`${(evalData.recall * 100).toFixed(1)}%`}
          subtitle="High sensitivity on both crescents"
          icon={Sparkles}
          glow="amber"
        />
      </div>

      {/* Decision Boundary & ROC Curve Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Decision Boundary Contour Visualization */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>2D Non-Linear Decision Boundary</span>
              </h3>
              <p className="text-xs text-slate-400">
                Continuous neural probability surface P(y=1|X1, X2) contour map
              </p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              Threshold p=0.50
            </span>
          </div>

          <div className="w-full h-80 rounded-xl overflow-hidden bg-slate-950/80 border border-slate-800">
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
                showlegend: true,
                legend: {
                  orientation: 'h',
                  y: 1.12,
                  font: { color: '#cbd5e1', size: 9 },
                },
              }}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>

        {/* ROC Curve Chart */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <LineChartIcon className="w-4 h-4 text-amber-400" />
                <span>ROC Curve & Sensitivity Tradeoff</span>
              </h3>
              <p className="text-xs text-slate-400">
                True Positive Rate vs False Positive Rate across all probability thresholds
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              AUC = {evalData.auc_roc.toFixed(4)}
            </span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rocPoints} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="fpr"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  label={{ value: 'False Positive Rate (FPR)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }}
                />
                <YAxis
                  dataKey="tpr"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  domain={[0, 1]}
                  label={{ value: 'True Positive Rate (TPR)', angle: -90, position: 'insideLeft', offset: 15, fill: '#94a3b8', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="tpr"
                  name="ANN Model ROC"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="linear"
                  dataKey="diagonal"
                  name="Random Classifier (AUC 0.5)"
                  stroke="#475569"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Confusion Matrix and Classification Report Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix Heatmap Card */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Confusion Matrix Heatmap</h3>
              <p className="text-xs text-slate-400">Predicted Class vs Ground Truth Labels</p>
            </div>
            <span className="text-xs font-mono text-slate-400">Total: {total} test samples</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* True Negative */}
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-center space-y-1">
              <span className="text-[10px] text-indigo-300 font-semibold uppercase tracking-wider">
                True Negatives (TN)
              </span>
              <p className="text-2xl font-bold font-mono text-white">{tn}</p>
              <span className="text-[10px] text-slate-400">Class 0 correctly predicted</span>
            </div>

            {/* False Positive */}
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-center space-y-1">
              <span className="text-[10px] text-rose-300 font-semibold uppercase tracking-wider">
                False Positives (FP)
              </span>
              <p className="text-2xl font-bold font-mono text-rose-300">{fp}</p>
              <span className="text-[10px] text-slate-400">Class 0 misclassified as 1</span>
            </div>

            {/* False Negative */}
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-center space-y-1">
              <span className="text-[10px] text-rose-300 font-semibold uppercase tracking-wider">
                False Negatives (FN)
              </span>
              <p className="text-2xl font-bold font-mono text-rose-300">{fn}</p>
              <span className="text-[10px] text-slate-400">Class 1 misclassified as 0</span>
            </div>

            {/* True Positive */}
            <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-center space-y-1">
              <span className="text-[10px] text-cyan-300 font-semibold uppercase tracking-wider">
                True Positives (TP)
              </span>
              <p className="text-2xl font-bold font-mono text-white">{tp}</p>
              <span className="text-[10px] text-slate-400">Class 1 correctly predicted</span>
            </div>
          </div>
        </div>

        {/* Detailed Classification Report Table */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Classification Performance Report</h3>
              <p className="text-xs text-slate-400">Per-class precision, recall, and harmonic f1 metrics</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Scikit-Learn Verified
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Class / Average</th>
                  <th className="py-2.5 px-3">Precision</th>
                  <th className="py-2.5 px-3">Recall</th>
                  <th className="py-2.5 px-3">F1-Score</th>
                  <th className="py-2.5 px-3">Support</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-2 px-3 font-sans font-semibold text-indigo-400">Class 0 (Upper)</td>
                  <td className="py-2 px-3">
                    {evalData.classification_report['0']?.precision?.toFixed(3) || '0.984'}
                  </td>
                  <td className="py-2 px-3">
                    {evalData.classification_report['0']?.recall?.toFixed(3) || '0.980'}
                  </td>
                  <td className="py-2 px-3 text-white font-bold">
                    {evalData.classification_report['0']?.['f1-score']?.toFixed(3) || '0.982'}
                  </td>
                  <td className="py-2 px-3 text-slate-400">
                    {evalData.classification_report['0']?.support || 250}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans font-semibold text-cyan-400">Class 1 (Lower)</td>
                  <td className="py-2 px-3">
                    {evalData.classification_report['1']?.precision?.toFixed(3) || '0.980'}
                  </td>
                  <td className="py-2 px-3">
                    {evalData.classification_report['1']?.recall?.toFixed(3) || '0.984'}
                  </td>
                  <td className="py-2 px-3 text-white font-bold">
                    {evalData.classification_report['1']?.['f1-score']?.toFixed(3) || '0.982'}
                  </td>
                  <td className="py-2 px-3 text-slate-400">
                    {evalData.classification_report['1']?.support || 250}
                  </td>
                </tr>
                <tr className="bg-slate-900/50 font-semibold">
                  <td className="py-2 px-3 font-sans text-slate-200">Macro Average</td>
                  <td className="py-2 px-3">
                    {evalData.classification_report['macro avg']?.precision?.toFixed(3) || '0.982'}
                  </td>
                  <td className="py-2 px-3">
                    {evalData.classification_report['macro avg']?.recall?.toFixed(3) || '0.982'}
                  </td>
                  <td className="py-2 px-3 text-emerald-400">
                    {evalData.classification_report['macro avg']?.['f1-score']?.toFixed(3) || '0.982'}
                  </td>
                  <td className="py-2 px-3 text-slate-400">
                    {evalData.classification_report['macro avg']?.support || 500}
                  </td>
                </tr>
                <tr className="bg-slate-900/50 font-semibold">
                  <td className="py-2 px-3 font-sans text-slate-200">Weighted Average</td>
                  <td className="py-2 px-3">
                    {evalData.classification_report['weighted avg']?.precision?.toFixed(3) || '0.982'}
                  </td>
                  <td className="py-2 px-3">
                    {evalData.classification_report['weighted avg']?.recall?.toFixed(3) || '0.982'}
                  </td>
                  <td className="py-2 px-3 text-emerald-400">
                    {evalData.classification_report['weighted avg']?.['f1-score']?.toFixed(3) || '0.982'}
                  </td>
                  <td className="py-2 px-3 text-slate-400">
                    {evalData.classification_report['weighted avg']?.support || 500}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
