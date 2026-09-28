import React, { useMemo } from 'react';
import {
  SearchBounds,
  SearchProgress,
  ScoringMethod,
  calculateTotalSearchSpace,
} from '../../engine/cryptanalysis/searchEngine';
import {
  Play,
  Square,
  Cpu,
  Gauge,
  Sparkles,
} from 'lucide-react';
import { RotorType } from '../../engine/enigma';

interface AutomatedSearchPanelProps {
  bounds: SearchBounds;
  isSearching: boolean;
  progress: SearchProgress | null;
  controlMode: 'basic' | 'advanced';
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
];

export const AutomatedSearchPanel: React.FC<AutomatedSearchPanelProps> = ({
  bounds,
  isSearching,
  progress,
  controlMode,
  onUpdateBounds,
  onStartSearch,
  onCancelSearch,
}) => {
  const totalCombinations = useMemo(() => calculateTotalSearchSpace(bounds), [bounds]);

  // Score History SVG Graph Path
  const svgScorePath = useMemo(() => {
    if (!progress || progress.scoreHistory.length < 2) return '';
    const history = progress.scoreHistory;
    const width = 300;
    const height = 60;

    const minScore = history[0].bestScore;
    const maxScore = history[history.length - 1].bestScore;
    const range = maxScore - minScore === 0 ? 1 : maxScore - minScore;

    const points = history.map((pt, i) => {
      const x = (i / (history.length - 1)) * width;
      const normalizedY = (pt.bestScore - minScore) / range;
      const y = height - normalizedY * (height - 12) - 6;
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
      if (updated.length === 0) updated = [order]; // keep at least 1
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
      {/* Control Panel Configuration Section */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-600/40 text-amber-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cinzel text-base font-bold text-stone-100">
                Bounded Cryptanalytic Search
              </h3>
              <p className="text-xs text-stone-400 font-mono">
                {controlMode === 'basic'
                  ? 'Recommended automated key search based on intelligence briefing'
                  : 'Customizable keyspace enumeration and fitness scoring'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isSearching ? (
              <button
                onClick={onStartSearch}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-mono font-bold text-xs shadow-lg shadow-amber-950/40 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Launch Search ({totalCombinations.toLocaleString()} configs)</span>
              </button>
            ) : (
              <button
                onClick={onCancelSearch}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs shadow-lg shadow-red-950/40 transition-all cursor-pointer"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Cancel Search</span>
              </button>
            )}
          </div>
        </div>

        {/* Basic Mode Summary */}
        {controlMode === 'basic' && (
          <div className="bg-stone-950/70 border border-stone-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-stone-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Recommended Search Configuration:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-stone-900 border border-stone-800">
                <span className="text-[10px] text-stone-500 uppercase block">Rotor Order</span>
                <span className="text-stone-200 font-bold">
                  {bounds.rotorOrders.map((o) => o.join('-')).join(', ')}
                </span>
              </div>

              <div className="p-2.5 rounded bg-stone-900 border border-stone-800">
                <span className="text-[10px] text-stone-500 uppercase block">Positions Searched</span>
                <span className="text-stone-200 font-bold">
                  L:{bounds.positions.left.length} • M:{bounds.positions.middle.length} • R:{bounds.positions.right.length}
                </span>
              </div>

              <div className="p-2.5 rounded bg-stone-900 border border-stone-800">
                <span className="text-[10px] text-stone-500 uppercase block">Scoring Metric</span>
                <span className="text-amber-400 font-bold">{bounds.scoringMethod}</span>
              </div>

              <div className="p-2.5 rounded bg-stone-900 border border-stone-800">
                <span className="text-[10px] text-stone-500 uppercase block">Total Combinations</span>
                <span className="text-amber-400 font-bold">{totalCombinations.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Mode Controls */}
        {controlMode === 'advanced' && (
          <div className="space-y-4 text-xs font-mono">
            {/* Rotor Orders Checkboxes */}
            <div className="space-y-2">
              <label className="font-bold text-stone-300 uppercase tracking-wider block">
                Permitted Rotor Wheel Orders ({bounds.rotorOrders.length} selected):
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_ROTOR_PERMUTATIONS.map((perm) => {
                  const key = perm.join('-');
                  const isSelected = bounds.rotorOrders.some((o) => o.join('-') === key);
                  return (
                    <button
                      key={key}
                      onClick={() => toggleRotorOrder(perm)}
                      className={`px-3 py-1.5 rounded-lg border font-mono text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-amber-950/80 border-amber-600/60 text-amber-300 font-bold'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {key}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Starting Positions Ranges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['left', 'middle', 'right'] as const).map((wheel) => {
                const count = bounds.positions[wheel].length;
                return (
                  <div key={wheel} className="bg-stone-950 p-3 rounded-lg border border-stone-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase text-stone-300">
                        {wheel} Rotor ({count})
                      </span>
                      <span className="text-[10px] text-amber-400">
                        {count === 1 ? bounds.positions[wheel][0] : `${count} letters`}
                      </span>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => handlePositionPreset(wheel, 'ALL')}
                        className={`flex-1 py-1 rounded text-[10px] font-bold ${
                          count === 26 ? 'bg-amber-900/60 text-amber-200' : 'bg-stone-900 text-stone-400'
                        }`}
                      >
                        A-Z (26)
                      </button>
                      <button
                        onClick={() => handlePositionPreset(wheel, 'FIRST_HALF')}
                        className={`flex-1 py-1 rounded text-[10px] font-bold ${
                          count === 13 ? 'bg-amber-900/60 text-amber-200' : 'bg-stone-900 text-stone-400'
                        }`}
                      >
                        A-M (13)
                      </button>
                      <button
                        onClick={() => handlePositionPreset(wheel, 'A')}
                        className={`flex-1 py-1 rounded text-[10px] font-bold ${
                          count === 1 ? 'bg-amber-900/60 text-amber-200' : 'bg-stone-900 text-stone-400'
                        }`}
                      >
                        'A' Only
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scoring Method Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-stone-950 p-3 rounded-lg border border-stone-800 space-y-1.5">
                <label className="text-stone-300 font-bold block">Scoring Metric</label>
                <select
                  value={bounds.scoringMethod}
                  onChange={(e) =>
                    onUpdateBounds({ scoringMethod: e.target.value as ScoringMethod })
                  }
                  className="w-full bg-stone-900 border border-stone-700 rounded px-2.5 py-1.5 text-xs text-amber-400 font-mono focus:outline-none"
                >
                  <option value="CRIB_MATCH">Crib Matching (Word Alignment)</option>
                  <option value="INDEX_OF_COINCIDENCE">Index of Coincidence (IoC)</option>
                  <option value="CHI_SQUARE">Chi-Squared Distance ($\chi^2$)</option>
                  <option value="QUADGRAM">Quadgram Log-Likelihood</option>
                </select>
              </div>

              <div className="bg-stone-950 p-3 rounded-lg border border-stone-800 space-y-1.5">
                <label className="text-stone-300 font-bold block">Candidate Limit</label>
                <select
                  value={bounds.maxCandidates ?? 25}
                  onChange={(e) =>
                    onUpdateBounds({ maxCandidates: parseInt(e.target.value, 10) })
                  }
                  className="w-full bg-stone-900 border border-stone-700 rounded px-2.5 py-1.5 text-xs text-amber-400 font-mono focus:outline-none"
                >
                  <option value={10}>Top 10 Candidates</option>
                  <option value={25}>Top 25 Candidates</option>
                  <option value={50}>Top 50 Candidates</option>
                  <option value={100}>Top 100 Candidates</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Search Dashboard */}
      {progress && (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-amber-400" />
              <h4 className="text-xs font-mono font-bold text-stone-200 uppercase tracking-wider">
                Live Search Execution Status
              </h4>
            </div>

            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold flex items-center gap-1 ${
                progress.status === 'RUNNING'
                  ? 'bg-amber-950 text-amber-300 border border-amber-600 animate-pulse'
                  : progress.status === 'COMPLETED'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                    : progress.status === 'CANCELLED'
                      ? 'bg-stone-800 text-stone-400'
                      : 'bg-red-950 text-red-300'
              }`}
            >
              {progress.status}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-stone-400">
              <span>Progress: {progress.evaluatedCount.toLocaleString()} / {progress.totalCount.toLocaleString()}</span>
              <span className="font-bold text-amber-400">{progress.percentComplete.toFixed(1)}%</span>
            </div>
            <div className="w-full h-3 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
              <div
                style={{ width: `${Math.min(100, progress.percentComplete)}%` }}
                className="h-full bg-amber-500 rounded-full transition-all duration-200"
              />
            </div>
          </div>

          {/* Real-time Telemetry Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-stone-950 p-3 rounded-lg border border-stone-800">
              <div className="text-[10px] font-mono text-stone-500 uppercase">Elapsed Time</div>
              <div className="text-base font-mono font-bold text-stone-200 mt-0.5">
                {(progress.elapsedMs / 1000).toFixed(2)}s
              </div>
            </div>

            <div className="bg-stone-950 p-3 rounded-lg border border-stone-800">
              <div className="text-[10px] font-mono text-stone-500 uppercase">Search Speed</div>
              <div className="text-base font-mono font-bold text-amber-400 mt-0.5">
                {progress.configsPerSecond.toLocaleString()} <span className="text-[10px] text-stone-500">keys/sec</span>
              </div>
            </div>

            <div className="bg-stone-950 p-3 rounded-lg border border-stone-800">
              <div className="text-[10px] font-mono text-stone-500 uppercase">Best Score</div>
              <div className="text-base font-mono font-bold text-emerald-400 mt-0.5">
                {progress.currentBestScore === -Infinity ? 'N/A' : progress.currentBestScore.toFixed(3)}
              </div>
            </div>

            <div className="bg-stone-950 p-3 rounded-lg border border-stone-800">
              <div className="text-[10px] font-mono text-stone-500 uppercase">Current Best</div>
              <div className="text-xs font-mono font-bold text-stone-200 mt-1 truncate">
                {progress.currentBestCandidate
                  ? `${progress.currentBestCandidate.config.rotors.map((r) => r.type).join('-')} [${progress.currentBestCandidate.config.rotors.map((r) => r.position).join('')}]`
                  : 'Searching...'}
              </div>
            </div>
          </div>

          {/* Real-time Best Score Graph */}
          {svgScorePath && (
            <div className="bg-stone-950 p-3 rounded-lg border border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 uppercase">
                <span>Score Convergence Over Search Evaluations</span>
                <span className="text-emerald-400 font-bold">Max: {progress.currentBestScore.toFixed(3)}</span>
              </div>
              <div className="h-16 w-full flex items-center justify-center">
                <svg viewBox="0 0 300 60" className="w-full h-full overflow-visible">
                  <path
                    d={svgScorePath}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
