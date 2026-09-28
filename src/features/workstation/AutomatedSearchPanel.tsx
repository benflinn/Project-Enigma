import React, { useMemo } from 'react';
import {
  SearchBounds,
  SearchProgress,
  ScoringMethod,
  SearchStrategy,
  estimateSearchCost,
} from '../../engine/cryptanalysis/searchEngine';
import {
  Play,
  Square,
  Cpu,
  Gauge,
  Sparkles,
  AlertTriangle,
  Flame,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { RotorType } from '../../engine/enigma';
import { generateContextualAssistance } from '../../engine/cryptanalysis/adaptiveIntelligence';

interface AutomatedSearchPanelProps {
  bounds: SearchBounds;
  isSearching: boolean;
  progress: SearchProgress | null;
  controlMode: 'basic' | 'advanced';
  workerConcurrency: number;
  onSetWorkerConcurrency: (n: number) => void;
  onUpdateBounds: (partial: Partial<SearchBounds>) => void;
  onStartSearch: () => void;
  onCancelSearch: () => void;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const ALL_ROTOR_PERMUTATIONS: Array<[RotorType, RotorType, RotorType]> = [
  ['I', 'II', 'III'],
  ['I', 'III', 'II'],
  ['II', 'I', 'III'],
  ['II', 'III', 'I'],
  ['III', 'I', 'II'],
  ['III', 'II', 'I'],
  ['I', 'IV', 'III'],
  ['IV', 'II', 'V'],
  ['II', 'IV', 'V'],
  ['I', 'III', 'V'],
];

export const AutomatedSearchPanel: React.FC<AutomatedSearchPanelProps> = ({
  bounds,
  isSearching,
  progress,
  controlMode,
  workerConcurrency,
  onSetWorkerConcurrency,
  onUpdateBounds,
  onStartSearch,
  onCancelSearch,
}) => {
  const costEstimate = useMemo(() => estimateSearchCost(bounds), [bounds]);
  const activeStrategy: SearchStrategy = bounds.strategy ?? 'EXHAUSTIVE';

  const contextualAdvice = useMemo(() => {
    return generateContextualAssistance({
      selectedCrib: bounds.crib?.text,
      totalSearchSpace: costEstimate.totalCombinations,
      activeStrategy,
      candidateCount: progress?.currentBestCandidate ? 1 : 0,
      topScore: progress?.currentBestScore,
      hillClimbingRestarts: bounds.hillClimbing?.maxRestarts,
    });
  }, [bounds, costEstimate, activeStrategy, progress]);

  // Score History SVG Graph Path
  const svgScorePath = useMemo(() => {
    if (!progress || progress.scoreHistory.length < 2) return '';
    const history = progress.scoreHistory;
    const width = 320;
    const height = 65;

    const minScore = history[0].bestScore;
    const maxScore = history[history.length - 1].bestScore;
    const range = maxScore - minScore === 0 ? 1 : maxScore - minScore;

    const points = history.map((pt, i) => {
      const x = (i / (history.length - 1)) * width;
      const normalizedY = (pt.bestScore - minScore) / range;
      const y = height - normalizedY * (height - 14) - 7;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return `M ${points.join(' L ')}`;
  }, [progress]);

  const toggleRotorOrder = (order: [RotorType, RotorType, RotorType]) => {
    const orderKey = order.join('-');
    const exists = bounds.rotorOrders.some((o) => o.join('-') === orderKey);

    let updated: Array<[RotorType, RotorType, RotorType]>;
    if (exists) {
      updated = bounds.rotorOrders.filter((o) => o.join('-') !== orderKey);
      if (updated.length === 0) updated = [order];
    } else {
      updated = [...bounds.rotorOrders, order];
    }
    onUpdateBounds({ rotorOrders: updated });
  };

  const handlePositionPreset = (wheel: 'left' | 'middle' | 'right', rangeType: 'ALL' | 'FIRST_HALF' | 'A') => {
    let range: string[];
    if (rangeType === 'ALL') range = ALPHABET;
    else if (rangeType === 'FIRST_HALF') range = ALPHABET.slice(0, 13);
    else range = ['A'];

    onUpdateBounds({
      positions: {
        ...bounds.positions,
        [wheel]: range,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Search Strategy Selection Banner */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-600/40 text-amber-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cinzel text-base font-bold text-stone-100">
                Cryptanalytic Solver Laboratory
              </h3>
              <p className="text-xs text-stone-400 font-mono">
                Strategy: {activeStrategy} · {costEstimate.totalCombinations.toLocaleString()} estimated evaluations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSearching ? (
              <button
                onClick={onCancelSearch}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-600 text-rose-300 font-mono text-xs font-bold transition-all shadow cursor-pointer"
              >
                <Square className="w-4 h-4 fill-current" />
                Cancel Search
              </button>
            ) : (
              <button
                onClick={onStartSearch}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-mono text-xs font-bold transition-all shadow-md shadow-amber-950/40 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                Launch Search
              </button>
            )}
          </div>
        </div>

        {/* Strategy Tabs */}
        <div>
          <label className="text-xs font-mono font-medium text-stone-300 block mb-2">
            Cryptanalysis Strategy
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => onUpdateBounds({ strategy: 'EXHAUSTIVE' })}
              className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                activeStrategy === 'EXHAUSTIVE'
                  ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                  : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              <div className="flex items-center gap-2 font-mono text-xs font-bold mb-1">
                <Layers className="w-4 h-4" />
                Exhaustive Search
              </div>
              <p className="text-[11px] text-stone-400 font-sans">
                Bounded permutation sweep across rotor orders and wheel starting positions.
              </p>
            </button>

            <button
              onClick={() => onUpdateBounds({ strategy: 'HILL_CLIMBING' })}
              className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                activeStrategy === 'HILL_CLIMBING'
                  ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                  : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              <div className="flex items-center gap-2 font-mono text-xs font-bold mb-1">
                <Flame className="w-4 h-4" />
                Plugboard Hill Climbing
              </div>
              <p className="text-[11px] text-stone-400 font-sans">
                Stochastic random-restart optimization to discover unknown stecker cables.
              </p>
            </button>

            <button
              onClick={() => onUpdateBounds({ strategy: 'HYBRID' })}
              className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                activeStrategy === 'HYBRID'
                  ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                  : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              <div className="flex items-center gap-2 font-mono text-xs font-bold mb-1">
                <Sparkles className="w-4 h-4" />
                Hybrid Search
              </div>
              <p className="text-[11px] text-stone-400 font-sans">
                Compound sweep combining rotor position enumeration with plugboard hill climbing.
              </p>
            </button>
          </div>
        </div>

        {/* Workload Warning if Search Space is High */}
        {costEstimate.isExcessive && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-950/50 border border-amber-600/50 text-amber-300 text-xs">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
            <div>
              <span className="font-bold">Heavy Computational Budget: </span>
              {costEstimate.warningMessage}
            </div>
          </div>
        )}

        {/* Contextual Assistance Hint */}
        {contextualAdvice && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-stone-950 border border-stone-700/80 text-stone-300 text-xs font-sans">
            <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
            <div>
              <span className="font-bold text-amber-400 font-mono">{contextualAdvice.title}: </span>
              {contextualAdvice.message}{' '}
              {contextualAdvice.actionRecommendation && (
                <span className="text-stone-400 block mt-0.5 italic">{contextualAdvice.actionRecommendation}</span>
              )}
            </div>
          </div>
        )}

        {/* Strategy Specific Parameters */}
        {activeStrategy === 'HILL_CLIMBING' || activeStrategy === 'HYBRID' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-stone-800">
            <div>
              <label className="text-xs font-mono font-medium text-stone-300 block mb-1">
                Random Restarts ({bounds.hillClimbing?.maxRestarts ?? 6})
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={bounds.hillClimbing?.maxRestarts ?? 6}
                onChange={(e) =>
                  onUpdateBounds({
                    hillClimbing: {
                      ...(bounds.hillClimbing || { maxIterationsPerRestart: 80, maxSteckerPairs: 6 }),
                      maxRestarts: parseInt(e.target.value, 10),
                    },
                  })
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[10px] text-stone-500 font-mono">Restarts help escape local optima</span>
            </div>

            <div>
              <label className="text-xs font-mono font-medium text-stone-300 block mb-1">
                Iterations per Restart ({bounds.hillClimbing?.maxIterationsPerRestart ?? 80})
              </label>
              <input
                type="range"
                min="20"
                max="200"
                step="10"
                value={bounds.hillClimbing?.maxIterationsPerRestart ?? 80}
                onChange={(e) =>
                  onUpdateBounds({
                    hillClimbing: {
                      ...(bounds.hillClimbing || { maxRestarts: 6, maxSteckerPairs: 6 }),
                      maxIterationsPerRestart: parseInt(e.target.value, 10),
                    },
                  })
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[10px] text-stone-500 font-mono">Mutation step depth per climb</span>
            </div>

            <div>
              <label className="text-xs font-mono font-medium text-stone-300 block mb-1">
                Max Stecker Pairs ({bounds.hillClimbing?.maxSteckerPairs ?? 6})
              </label>
              <input
                type="range"
                min="2"
                max="10"
                value={bounds.hillClimbing?.maxSteckerPairs ?? 6}
                onChange={(e) =>
                  onUpdateBounds({
                    hillClimbing: {
                      ...(bounds.hillClimbing || { maxRestarts: 6, maxIterationsPerRestart: 80 }),
                      maxSteckerPairs: parseInt(e.target.value, 10),
                    },
                  })
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[10px] text-stone-500 font-mono">Permitted plugboard cable connections</span>
            </div>
          </div>
        ) : null}

        {/* Advanced Rotor & Concurrency Controls */}
        {controlMode === 'advanced' && (
          <div className="space-y-4 pt-3 border-t border-stone-800">
            {/* Multi-Worker Concurrency Selector */}
            <div className="bg-stone-950 p-3 rounded-lg border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono font-bold text-stone-200 block">
                  Parallel Web Worker Concurrency
                </span>
                <span className="text-[11px] text-stone-400 font-sans">
                  Partitions search spaces across background worker threads.
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 4].map((workers) => (
                  <button
                    key={workers}
                    onClick={() => onSetWorkerConcurrency(workers)}
                    className={`px-3 py-1 rounded text-xs font-mono font-bold border cursor-pointer ${
                      workerConcurrency === workers
                        ? 'bg-amber-600 text-stone-950 border-amber-400'
                        : 'bg-stone-900 border-stone-700 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {workers} {workers === 1 ? 'Worker' : 'Workers'}
                  </button>
                ))}
              </div>
            </div>

            {/* Scoring & Language Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono font-medium text-stone-300 block mb-1">
                  Fitness Scoring Metric
                </label>
                <select
                  value={bounds.scoringMethod}
                  onChange={(e) => onUpdateBounds({ scoringMethod: e.target.value as ScoringMethod })}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-1.5 text-xs font-mono text-stone-200 cursor-pointer"
                >
                  <option value="QUADGRAM">Quadgram Log-Likelihood (High Accuracy)</option>
                  <option value="INDEX_OF_COINCIDENCE">Index of Coincidence (IoC)</option>
                  <option value="CHI_SQUARE">Chi-Squared Goodness of Fit</option>
                  <option value="CRIB_MATCH">Crib Matching Score</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono font-medium text-stone-300 block mb-1">
                  Language Model
                </label>
                <select
                  value={bounds.language ?? 'ENGLISH'}
                  onChange={(e) => onUpdateBounds({ language: e.target.value as 'ENGLISH' | 'GERMAN' })}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-1.5 text-xs font-mono text-stone-200 cursor-pointer"
                >
                  <option value="ENGLISH">English Military Signals</option>
                  <option value="GERMAN">German Wehrmacht / Kriegsmarine</option>
                </select>
              </div>
            </div>

            {/* Permitted Rotor Orders */}
            <div>
              <label className="text-xs font-mono font-medium text-stone-300 block mb-1.5">
                Permitted Rotor Orders ({bounds.rotorOrders.length} selected)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_ROTOR_PERMUTATIONS.map((order) => {
                  const key = order.join('-');
                  const isSelected = bounds.rotorOrders.some((o) => o.join('-') === key);
                  return (
                    <button
                      key={key}
                      onClick={() => toggleRotorOrder(order)}
                      className={`px-2.5 py-1 rounded text-xs font-mono border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-amber-950 border-amber-600 text-amber-300'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      {key}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rotor Position Ranges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['left', 'middle', 'right'] as const).map((wheel) => {
                const range = bounds.positions[wheel];
                return (
                  <div key={wheel} className="bg-stone-950 p-3 rounded-lg border border-stone-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-400 capitalize">
                        {wheel} Rotor ({range.length} letters)
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handlePositionPreset(wheel, 'ALL')}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-900 hover:bg-stone-800 text-stone-300"
                        >
                          A-Z
                        </button>
                        <button
                          onClick={() => handlePositionPreset(wheel, 'A')}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-900 hover:bg-stone-800 text-stone-300"
                        >
                          [A]
                        </button>
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-stone-400 truncate bg-stone-900/50 p-1.5 rounded border border-stone-800/80">
                      {range.join(', ')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Real-time Search Telemetry Dashboard */}
      {progress && (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-amber-400" />
              <h4 className="font-mono text-xs font-bold text-stone-200">
                Search Telemetry & Performance
              </h4>
            </div>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded ${
                progress.status === 'COMPLETED'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                  : progress.status === 'RUNNING'
                    ? 'bg-amber-950 text-amber-400 border border-amber-600 animate-pulse'
                    : 'bg-stone-800 text-stone-400'
              }`}
            >
              {progress.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-stone-950 p-3 rounded-lg border border-stone-800">
              <span className="text-[10px] font-mono text-stone-400 block uppercase">Evaluated</span>
              <span className="text-base font-mono font-bold text-stone-100">
                {progress.evaluatedCount.toLocaleString()}
              </span>
              <span className="text-[10px] text-stone-400 font-mono block">
                / {progress.totalCount.toLocaleString()}
              </span>
            </div>

            <div className="bg-stone-950 p-3 rounded-lg border border-stone-800">
              <span className="text-[10px] font-mono text-stone-400 block uppercase">Throughput</span>
              <span className="text-base font-mono font-bold text-amber-400">
                {progress.configsPerSecond.toLocaleString()}
              </span>
              <span className="text-[10px] text-stone-400 font-mono block">evals / sec</span>
            </div>

            <div className="bg-stone-950 p-3 rounded-lg border border-stone-800">
              <span className="text-[10px] font-mono text-stone-400 block uppercase">Elapsed Time</span>
              <span className="text-base font-mono font-bold text-stone-100">
                {(progress.elapsedMs / 1000).toFixed(2)}s
              </span>
              <span className="text-[10px] text-stone-400 font-mono block">{progress.percentComplete.toFixed(1)}% complete</span>
            </div>

            <div className="bg-stone-950 p-3 rounded-lg border border-stone-800">
              <span className="text-[10px] font-mono text-stone-400 block uppercase">Best Score</span>
              <span className="text-base font-mono font-bold text-emerald-400">
                {progress.currentBestScore === -Infinity ? '—' : progress.currentBestScore.toFixed(3)}
              </span>
              <span className="text-[10px] text-stone-400 font-mono block truncate">
                {progress.currentBestCandidate?.config.rotors.map((r) => r.position).join('') || '—'}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="w-full bg-stone-950 rounded-full h-2 overflow-hidden border border-stone-800">
              <div
                className="bg-amber-500 h-full transition-all duration-150"
                style={{ width: `${progress.percentComplete}%` }}
              />
            </div>
          </div>

          {/* Convergence Chart SVG */}
          {svgScorePath && (
            <div className="pt-2 border-t border-stone-800/80">
              <div className="flex items-center justify-between mb-1 text-[11px] font-mono text-stone-400">
                <span>Score Convergence Over Evaluations</span>
                <span className="text-emerald-400 font-bold">
                  Peak: {progress.currentBestScore.toFixed(3)}
                </span>
              </div>
              <div className="bg-stone-950 p-2 rounded-lg border border-stone-800 flex justify-center">
                <svg viewBox="0 0 320 65" className="w-full h-16 stroke-amber-400 fill-none stroke-2">
                  <path d={svgScorePath} />
                </svg>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
