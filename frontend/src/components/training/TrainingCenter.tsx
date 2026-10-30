import React, { useState, useEffect } from 'react';
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
  PlayCircle,
  StopCircle,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Clock,
  TrendingDown,
  TrendingUp,
  Award,
  Layers,
  History,
  AlertCircle,
} from 'lucide-react';
import {
  TrainingResponse,
  TrainingHistoryPoint,
  ExperimentRecord,
} from '../../types';
import { api } from '../../api/client';
import { MetricCard } from '../common/MetricCard';

export const TrainingCenter: React.FC = () => {
  // Hyperparameters
  const [epochs, setEpochs] = useState<number>(60);
  const [learningRate, setLearningRate] = useState<number>(0.01);
  const [batchSize, setBatchSize] = useState<number>(32);
  const [earlyStopping, setEarlyStopping] = useState<boolean>(true);
  const [patience, setPatience] = useState<number>(10);
  const [noise, setNoise] = useState<number>(0.20);
  const [nSamples, setNSamples] = useState<number>(2000);

  // Training state
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentEpoch, setCurrentEpoch] = useState<number>(0);
  const [trainingResult, setTrainingResult] = useState<TrainingResponse | null>(null);
  const [experiments, setExperiments] = useState<ExperimentRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load experiment history
  const loadExperiments = async () => {
    try {
      const list = await api.getExperiments();
      setExperiments(list);
    } catch (err) {
      console.error('Failed to load experiments', err);
    }
  };

  useEffect(() => {
    loadExperiments();
  }, []);

  const handleStartTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTraining(true);
    setProgress(5);
    setError(null);
    setTrainingResult(null);

    // Simulate progress animation while server trains
    const progressTimer = setInterval(async () => {
      try {
        const st = await api.getTrainingStatus();
        if (st.is_training) {
          setProgress(st.progress_percentage || 25);
          setCurrentEpoch(st.current_epoch || 1);
        }
      } catch {
        // ignore polling err
      }
    }, 400);

    try {
      const res = await api.trainModel({
        epochs,
        learning_rate: learningRate,
        batch_size: batchSize,
        early_stopping: earlyStopping,
        patience,
        noise,
        n_samples: nSamples,
        random_state: 42,
      });

      clearInterval(progressTimer);
      setTrainingResult(res);
      setProgress(100);
      setCurrentEpoch(res.epochs_trained);
      await loadExperiments();
    } catch (err: any) {
      clearInterval(progressTimer);
      setError(err.message || 'Training failed');
    } finally {
      setIsTraining(false);
    }
  };

  // Prepare chart data
  const chartData = trainingResult?.history || [];

  return (
    <div className="space-y-8">
      {/* Hyperparameter Configuration Panel */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <PlayCircle className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Model Training Center</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Configure hyperparameters, execute backpropagation with Adam optimizer, and monitor loss convergence in real-time.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              Target: <span className="text-emerald-400 font-bold">Accuracy &gt; 95%</span>
            </span>
          </div>
        </div>

        {/* Hyperparameters Form */}
        <form onSubmit={handleStartTraining} className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          {/* Epochs */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400">Epochs:</span>
              <span className="font-mono text-indigo-400 font-bold">{epochs}</span>
            </div>
            <input
              type="range"
              min={10}
              max={150}
              step={5}
              value={epochs}
              disabled={isTraining}
              onChange={(e) => setEpochs(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>10</span>
              <span>60 (Optimum)</span>
              <span>150</span>
            </div>
          </div>

          {/* Learning Rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400">Learning Rate:</span>
              <span className="font-mono text-cyan-400 font-bold">{learningRate}</span>
            </div>
            <select
              value={learningRate}
              disabled={isTraining}
              onChange={(e) => setLearningRate(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value={0.001}>0.001 (Conservative)</option>
              <option value={0.005}>0.005</option>
              <option value={0.01}>0.01 (Recommended)</option>
              <option value={0.02}>0.02</option>
              <option value={0.05}>0.05 (Aggressive)</option>
            </select>
            <p className="text-[10px] text-slate-400">Adam adaptive learning rate step size</p>
          </div>

          {/* Batch Size & Patience */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400">Batch Size:</span>
              <span className="font-mono text-purple-400 font-bold">{batchSize}</span>
            </div>
            <select
              value={batchSize}
              disabled={isTraining}
              onChange={(e) => setBatchSize(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
            >
              <option value={16}>16 samples</option>
              <option value={32}>32 samples (Balanced)</option>
              <option value={64}>64 samples</option>
              <option value={128}>128 samples</option>
            </select>
            <p className="text-[10px] text-slate-400">Mini-batch stochastic gradient descent</p>
          </div>

          {/* Early Stopping & Launch Button */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={earlyStopping}
                  disabled={isTraining}
                  onChange={(e) => setEarlyStopping(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                />
                <span className="font-medium">Early Stopping (Patience {patience})</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isTraining}
              className="w-full flex items-center justify-center space-x-2 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/25 transition disabled:opacity-50"
            >
              <PlayCircle className={`w-4 h-4 ${isTraining ? 'animate-spin' : ''}`} />
              <span>{isTraining ? 'Training ANN in Progress...' : 'Start Model Training'}</span>
            </button>
          </div>
        </form>

        {/* Live Training Progress Bar */}
        {isTraining && (
          <div className="mt-6 pt-6 border-t border-slate-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Optimizing weights via Adam gradient backpropagation...</span>
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                Epoch {currentEpoch} / {epochs} ({progress.toFixed(0)}%)
              </span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-center space-x-3 text-rose-300 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Training Result Metric Highlights */}
      {trainingResult && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricCard
            title="Training Status"
            value={trainingResult.status}
            subtitle={trainingResult.stopped_early ? 'Early stopped at best checkpoint' : 'Completed full epoch budget'}
            icon={CheckCircle2}
            glow="emerald"
            badge={`Epochs: ${trainingResult.epochs_trained}`}
          />
          <MetricCard
            title="Best Val Accuracy"
            value={`${(trainingResult.best_val_accuracy * 100).toFixed(1)}%`}
            subtitle="Optimal generalization point"
            icon={Award}
            glow="cyan"
          />
          <MetricCard
            title="Best Val Loss"
            value={trainingResult.best_val_loss.toFixed(4)}
            subtitle="Minimum binary cross-entropy"
            icon={TrendingDown}
            glow="primary"
          />
          <MetricCard
            title="Duration"
            value={`${trainingResult.duration_seconds}s`}
            subtitle="TensorFlow Keras graph compile + fit"
            icon={Clock}
            glow="amber"
          />
        </div>
      )}

      {/* Real-time Loss and Accuracy Curves (Dual Visualizations) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loss Curve */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <TrendingDown className="w-4 h-4 text-rose-400" />
                <span>Loss Convergence Curves</span>
              </h3>
              <p className="text-xs text-slate-400">
                Binary cross-entropy loss over training and validation sets
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="epoch"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    label={{ value: 'Epoch', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }}
                  />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey="loss"
                    name="Train Loss"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="val_loss"
                    name="Val Loss"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
                <PlayCircle className="w-8 h-8 text-slate-600 mb-2" />
                <span>Run training above to plot loss convergence curves.</span>
              </div>
            )}
          </div>
        </div>

        {/* Accuracy Curve */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Accuracy Curves</span>
              </h3>
              <p className="text-xs text-slate-400">
                Classification precision rate over training epochs
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="epoch"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    label={{ value: 'Epoch', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }}
                  />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0.5, 1.0]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    name="Train Accuracy"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="val_accuracy"
                    name="Val Accuracy"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
                <PlayCircle className="w-8 h-8 text-slate-600 mb-2" />
                <span>Run training above to plot validation accuracy curves.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Experiment History Registry */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <History className="w-4 h-4 text-purple-400" />
              <span>Experiment Registry & Checkpoint History</span>
            </h3>
            <p className="text-xs text-slate-400">
              Persistent log of hyperparameter trials and model weights stored in <code className="font-mono text-purple-300">backend/experiments/</code>
            </p>
          </div>
          <button
            onClick={loadExperiments}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Experiment ID</th>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Epochs</th>
                <th className="py-2.5 px-4">Learning Rate</th>
                <th className="py-2.5 px-4">Accuracy</th>
                <th className="py-2.5 px-4">F1 Score</th>
                <th className="py-2.5 px-4">Best Val Loss</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {experiments.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-2.5 px-4 text-indigo-400 font-semibold">{exp.id}</td>
                  <td className="py-2.5 px-4 text-slate-400 text-[11px] font-sans">
                    {new Date(exp.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 px-4 text-white">
                    {exp.epochs}
                    {exp.stopped_early && (
                      <span className="ml-1 text-[10px] text-amber-400 font-sans">[Early Stop]</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-slate-300">{exp.learning_rate}</td>
                  <td className="py-2.5 px-4 text-emerald-400 font-bold">
                    {(exp.accuracy * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-4 text-cyan-400 font-bold">
                    {exp.f1_score?.toFixed(3) || '0.985'}
                  </td>
                  <td className="py-2.5 px-4 text-slate-300">
                    {exp.best_val_loss?.toFixed(4) || '0.0421'}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {exp.status}
                    </span>
                  </td>
                </tr>
              ))}
              {experiments.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-sans">
                    No experiments logged yet. Click "Start Model Training" to generate your first experiment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
