import React, { useState } from 'react';
import { useSimulatorStore } from '../../state/simulatorStore';
import { Network, Plus, Trash2, X } from 'lucide-react';

const PLUGBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K'],
  ['P', 'Y', 'X', 'C', 'V', 'B', 'N', 'M', 'L'],
];

const CABLE_COLORS = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
  '#14b8a6', // Teal
  '#a855f7', // Purple
  '#eab308', // Yellow
  '#6366f1', // Indigo
];

export const PlugboardView: React.FC = () => {
  const {
    config,
    machine,
    selectedCableSocket,
    handleSocketClick,
    removePlugboardPair,
    clearPlugboard,
    addPlugboardPair,
  } = useSimulatorStore();

  const [manualInput, setManualInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const plugboard = machine.getPlugboard();
  const pairs = config.plugboard;

  // Helper to find cable color index for a letter
  const getPairColor = (letter: string): string | null => {
    const pairIndex = pairs.findIndex((p) => p.includes(letter));
    if (pairIndex === -1) return null;
    return CABLE_COLORS[pairIndex % CABLE_COLORS.length];
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);
    const clean = manualInput.toUpperCase().replace(/[^A-Z]/g, '');
    if (clean.length !== 2) {
      setInputError('Pair must be exactly 2 letters (e.g. "AB")');
      return;
    }
    if (clean[0] === clean[1]) {
      setInputError('Cannot connect a letter to itself');
      return;
    }
    const success = addPlugboardPair(clean[0], clean[1]);
    if (success) {
      setManualInput('');
    } else {
      setInputError('Letter already connected or invalid');
    }
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-xl select-none">
      <div className="flex flex-wrap items-center justify-between mb-4 border-b border-stone-800 pb-2 gap-2">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-amber-500" />
          <h2 className="font-cinzel tracking-wider text-amber-400 font-bold text-sm uppercase">
            Steckerbrett (Plugboard)
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="font-mono text-stone-400">
            Active: <strong className="text-amber-400">{pairs.length}</strong> / 10 pairs
          </span>
          {pairs.length > 0 && (
            <button
              onClick={clearPlugboard}
              className="flex items-center gap-1 text-stone-400 hover:text-red-400 transition-colors font-mono"
              title="Disconnect all plugboard cables"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Socket Array */}
      <div className="flex flex-col items-center gap-3 py-2 bg-stone-950/60 rounded-lg p-3 border border-stone-800/80">
        <p className="text-[11px] text-stone-400 text-center mb-1 font-mono">
          {selectedCableSocket
            ? `Click another socket to connect with [${selectedCableSocket}]`
            : 'Click socket to start cable connection, or click connected socket to unplug.'}
        </p>

        {PLUGBOARD_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-2 sm:gap-3">
            {row.map((letter) => {
              const isPlugged = plugboard.isPlugged(letter);
              const partner = plugboard.getPartner(letter);
              const isSelected = selectedCableSocket === letter;
              const color = getPairColor(letter);

              return (
                <button
                  key={letter}
                  type="button"
                  data-testid={`plug-${letter}`}
                  aria-label={`Plug socket ${letter}${isPlugged ? ` connected to ${partner}` : ''}`}
                  onClick={() => handleSocketClick(letter)}
                  className={`
                    group relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex flex-col items-center justify-between p-1
                    border transition-all outline-none
                    ${
                      isSelected
                        ? 'border-amber-400 bg-amber-950/60 ring-2 ring-amber-400/50 scale-105'
                        : isPlugged
                        ? 'border-stone-600 bg-stone-900 shadow'
                        : 'border-stone-800 bg-stone-950 hover:border-stone-600'
                    }
                  `}
                  style={isPlugged && color ? { borderColor: color } : {}}
                >
                  <span
                    className={`font-mono-military text-[11px] font-bold ${
                      isSelected ? 'text-amber-300 font-black' : isPlugged ? 'text-stone-200' : 'text-stone-400'
                    }`}
                  >
                    {letter}
                  </span>

                  {/* Twin-pin socket holes */}
                  <div className="flex items-center gap-1 my-auto">
                    <div
                      className="w-2 h-2 rounded-full border border-stone-700 bg-black shadow-inner"
                      style={isPlugged && color ? { backgroundColor: color, borderColor: color } : {}}
                    />
                    <div
                      className="w-2 h-2 rounded-full border border-stone-700 bg-black shadow-inner"
                      style={isPlugged && color ? { backgroundColor: color, borderColor: color } : {}}
                    />
                  </div>

                  {/* Connected Partner Badge */}
                  {isPlugged && partner && (
                    <span
                      className="text-[9px] font-mono font-bold px-1 rounded -mt-0.5"
                      style={{ backgroundColor: color || '#3b82f6', color: '#fff' }}
                    >
                      {partner}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Connected Pairs Badges & Manual Input */}
      <div className="mt-4 pt-3 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Connected Pairs Tags */}
        <div className="flex flex-wrap gap-1.5 items-center">
          {pairs.length === 0 ? (
            <span className="text-xs text-stone-500 font-mono italic">
              No plugboard connections (identity mapping)
            </span>
          ) : (
            pairs.map((pair, idx) => {
              const color = CABLE_COLORS[idx % CABLE_COLORS.length];
              return (
                <span
                  key={pair}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-bold text-white shadow"
                  style={{ backgroundColor: color }}
                >
                  {pair[0]} ↔ {pair[1]}
                  <button
                    onClick={() => removePlugboardPair(pair[0])}
                    className="hover:bg-black/30 rounded p-0.5 transition-colors"
                    title={`Unplug pair ${pair}`}
                    aria-label={`Unplug pair ${pair}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })
          )}
        </div>

        {/* Quick Add Pair Form */}
        <form onSubmit={handleManualAdd} className="flex items-center gap-1.5 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Pair (e.g. AB)"
            maxLength={2}
            value={manualInput}
            onChange={(e) => {
              setManualInput(e.target.value.toUpperCase());
              setInputError(null);
            }}
            className="w-28 bg-stone-950 border border-stone-700 text-amber-400 text-xs rounded px-2 py-1 font-mono uppercase text-center outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-amber-400 text-xs px-2.5 py-1 rounded border border-stone-700 font-mono flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </form>
      </div>

      {inputError && (
        <p className="text-xs text-red-400 mt-2 font-mono">{inputError}</p>
      )}
    </div>
  );
};
