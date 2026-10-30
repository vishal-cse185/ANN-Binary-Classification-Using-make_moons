import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import {
  Database,
  Sliders,
  Download,
  RefreshCw,
  Search,
  Filter,
  BarChart2,
  PieChart,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';
import { DatasetResponse, DatasetSample } from '../../types';
import { api } from '../../api/client';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const DataExplorer: React.FC = () => {
  const [dataset, setDataset] = useState<DatasetResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form controls
  const [nSamples, setNSamples] = useState<number>(2000);
  const [noise, setNoise] = useState<number>(0.20);
  const [randomState, setRandomState] = useState<number>(42);
  const [testSplit, setTestSplit] = useState<number>(0.25);

  // Table filtering and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState<'all' | '0' | '1'>('all');
  const [filterSplit, setFilterSplit] = useState<'all' | 'train' | 'test'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const loadCurrentDataset = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getCurrentDataset();
      setDataset(res);
      setNSamples(res.total_samples);
      setNoise(res.noise);
    } catch (err: any) {
      setError(err.message || 'Failed to load dataset');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentDataset();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGenerating(true);
      setError(null);
      const res = await api.generateDataset({
        n_samples: nSamples,
        noise: noise,
        random_state: randomState,
        test_size: testSplit,
      });
      setDataset(res);
    } catch (err: any) {
      setError(err.message || 'Failed to generate dataset');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    api.downloadDatasetCsv();
  };

  if (loading) {
    return <LoadingSpinner label="Loading Dataset Manifold..." size="lg" />;
  }

  // Filter preview samples
  const allPreview = dataset?.preview || [];
  const filteredSamples = allPreview.filter((s) => {
    const matchesSearch =
      s.id.toString().includes(searchTerm) ||
      s.x1.toString().includes(searchTerm) ||
      s.x2.toString().includes(searchTerm);
    const matchesClass = filterClass === 'all' || s.label.toString() === filterClass;
    const matchesSplit = filterSplit === 'all' || s.split === filterSplit;
    return matchesSearch && matchesClass && matchesSplit;
  });

  const totalPages = Math.ceil(filteredSamples.length / rowsPerPage) || 1;
  const paginatedSamples = filteredSamples.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Prepare Plotly Scatter traces
  const scatterPoints = dataset?.scatter_sample || [];
  const class0Points = scatterPoints.filter((p) => p.label === 0);
  const class1Points = scatterPoints.filter((p) => p.label === 1);

  const plotData: any[] = [
    {
      x: class0Points.map((p) => p.x1),
      y: class0Points.map((p) => p.x2),
      mode: 'markers',
      type: 'scatter',
      name: 'Class 0 (Upper Moon)',
      marker: {
        color: '#6366f1',
        size: 7,
        opacity: 0.85,
        line: { color: '#a5b4fc', width: 1 },
      },
    },
    {
      x: class1Points.map((p) => p.x1),
      y: class1Points.map((p) => p.x2),
      mode: 'markers',
      type: 'scatter',
      name: 'Class 1 (Lower Moon)',
      marker: {
        color: '#06b6d4',
        size: 7,
        opacity: 0.85,
        line: { color: '#67e8f9', width: 1 },
      },
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Controls Section */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">Data Explorer & Synthesizer</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Parametric generation of Scikit-learn's <code className="text-cyan-300 font-mono">make_moons</code> non-linear classification dataset.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-semibold transition"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Generator Controls Form */}
        <form onSubmit={handleGenerate} className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 items-end">
          {/* Samples Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400">Total Samples:</span>
              <span className="font-mono text-cyan-400 font-bold">{nSamples}</span>
            </div>
            <input
              type="range"
              min={500}
              max={5000}
              step={100}
              value={nSamples}
              onChange={(e) => setNSamples(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>500</span>
              <span>2000 (Default)</span>
              <span>5000</span>
            </div>
          </div>

          {/* Noise Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400">Gaussian Noise:</span>
              <span className="font-mono text-indigo-400 font-bold">{noise.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={0.50}
              step={0.01}
              value={noise}
              onChange={(e) => setNoise(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0.05 (Crisp)</span>
              <span>0.20 (Standard)</span>
              <span>0.50 (Noisy)</span>
            </div>
          </div>

          {/* Random Seed */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400">Random Seed:</span>
              <span className="font-mono text-purple-400 font-bold">{randomState}</span>
            </div>
            <input
              type="number"
              value={randomState}
              onChange={(e) => setRandomState(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[10px] text-slate-400">Ensures reproducible splits</p>
          </div>

          {/* Test Split Ratio */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400">Test Split:</span>
              <span className="font-mono text-emerald-400 font-bold">{(testSplit * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0.15}
              max={0.40}
              step={0.05}
              value={testSplit}
              onChange={(e) => setTestSplit(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>15%</span>
              <span>25%</span>
              <span>40%</span>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={generating}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/20 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
              <span>{generating ? 'Regenerating...' : 'Generate Moons'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Visual Manifold & Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Plotly Scatter (2 Columns) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>2D Moon Manifold Scatter Space</span>
              </h3>
              <p className="text-xs text-slate-400">
                Displaying {scatterPoints.length} representative points across intertwined crescents
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
                <span className="text-slate-300">Class 0</span>
              </span>
              <span className="flex items-center space-x-1 ml-3">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
                <span className="text-slate-300">Class 1</span>
              </span>
            </div>
          </div>

          <div className="w-full h-80 rounded-xl overflow-hidden bg-slate-950/80 border border-slate-800 flex items-center justify-center">
            <Plot
              data={plotData}
              layout={{
                autosize: true,
                margin: { l: 45, r: 25, t: 25, b: 40 },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                xaxis: {
                  title: { text: 'Feature X1', font: { color: '#94a3b8', size: 11 } },
                  gridcolor: 'rgba(255,255,255,0.06)',
                  tickfont: { color: '#64748b', size: 10 },
                  zerolinecolor: 'rgba(255,255,255,0.15)',
                },
                yaxis: {
                  title: { text: 'Feature X2', font: { color: '#94a3b8', size: 11 } },
                  gridcolor: 'rgba(255,255,255,0.06)',
                  tickfont: { color: '#64748b', size: 10 },
                  zerolinecolor: 'rgba(255,255,255,0.15)',
                },
                legend: {
                  orientation: 'h',
                  y: 1.1,
                  font: { color: '#cbd5e1', size: 10 },
                },
              }}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>

        {/* Class Distribution & Split Stats (1 Column) */}
        <div className="glass-panel rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-indigo-400" />
              <span>Class Balance & Partition</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Balanced binary distribution with stratified train/test split.
            </p>
          </div>

          {/* Class Split Meter */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-indigo-400 font-semibold">Class 0 ({dataset?.class_0_count} pts)</span>
              <span className="text-cyan-400 font-semibold">Class 1 ({dataset?.class_1_count} pts)</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden flex">
              <div
                className="bg-indigo-500 h-full transition-all duration-500"
                style={{ width: `${dataset?.class_0_percentage || 50}%` }}
              />
              <div
                className="bg-cyan-400 h-full transition-all duration-500"
                style={{ width: `${dataset?.class_1_percentage || 50}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>{dataset?.class_0_percentage}%</span>
              <span>{dataset?.class_1_percentage}%</span>
            </div>
          </div>

          {/* Train/Test Split Indicator */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">Data Partitions:</span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Stratified
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Training Set</span>
                <p className="text-lg font-bold text-white font-mono mt-0.5">{dataset?.n_train}</p>
                <span className="text-[10px] text-indigo-400 font-medium">{100 - (testSplit * 100)}% partition</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Testing Set</span>
                <p className="text-lg font-bold text-white font-mono mt-0.5">{dataset?.n_test}</p>
                <span className="text-[10px] text-cyan-400 font-medium">{(testSplit * 100)}% partition</span>
              </div>
            </div>
          </div>

          {/* Feature Summary Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Feature Distributions</span>
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-1">Stat</th>
                    <th className="py-1 text-cyan-400">X1</th>
                    <th className="py-1 text-indigo-400">X2</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="py-1 text-slate-400 font-sans">Mean</td>
                    <td className="py-1">{dataset?.feature_stats.x1?.mean.toFixed(3)}</td>
                    <td className="py-1">{dataset?.feature_stats.x2?.mean.toFixed(3)}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-400 font-sans">Std Dev</td>
                    <td className="py-1">{dataset?.feature_stats.x1?.std.toFixed(3)}</td>
                    <td className="py-1">{dataset?.feature_stats.x2?.std.toFixed(3)}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-400 font-sans">Min / Max</td>
                    <td className="py-1">[{dataset?.feature_stats.x1?.min.toFixed(2)}, {dataset?.feature_stats.x1?.max.toFixed(2)}]</td>
                    <td className="py-1">[{dataset?.feature_stats.x2?.min.toFixed(2)}, {dataset?.feature_stats.x2?.max.toFixed(2)}]</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Preview Table */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Dataset Records Preview</h3>
            <p className="text-xs text-slate-400">
              Showing tabular coordinates, labels, and partition tags
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search coordinates..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <select
              value={filterClass}
              onChange={(e: any) => {
                setFilterClass(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none"
            >
              <option value="all">All Classes</option>
              <option value="0">Class 0 Only</option>
              <option value="1">Class 1 Only</option>
            </select>

            <select
              value={filterSplit}
              onChange={(e: any) => {
                setFilterSplit(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none"
            >
              <option value="all">All Splits</option>
              <option value="train">Train Split</option>
              <option value="test">Test Split</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Index</th>
                <th className="py-2.5 px-4">Feature X1</th>
                <th className="py-2.5 px-4">Feature X2</th>
                <th className="py-2.5 px-4">Target Class</th>
                <th className="py-2.5 px-4">Data Partition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {paginatedSamples.map((sample) => (
                <tr key={sample.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-2.5 px-4 text-slate-400">#{sample.id}</td>
                  <td className="py-2.5 px-4 text-slate-200">{sample.x1.toFixed(4)}</td>
                  <td className="py-2.5 px-4 text-slate-200">{sample.x2.toFixed(4)}</td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        sample.label === 0
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                          : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      }`}
                    >
                      Class {sample.label}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                        sample.split === 'train'
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}
                    >
                      {sample.split}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span>
            Showing {Math.min(filteredSamples.length, (currentPage - 1) * rowsPerPage + 1)} -{' '}
            {Math.min(filteredSamples.length, currentPage * rowsPerPage)} of {filteredSamples.length} records
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 hover:bg-slate-800 text-white"
            >
              Previous
            </button>
            <span className="font-mono text-white px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 hover:bg-slate-800 text-white"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
