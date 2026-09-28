import React, { useMemo, useState } from 'react';
import {
  analyzeCribPlacements,
} from '../../engine/cryptanalysis/cribAnalysis';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react';

interface CribTestingPanelProps {
  ciphertext: string;
  initialCrib?: string;
  onSelectOffset?: (offset: number, crib: string) => void;
  onSendToSearch?: (crib: string, offset: number) => void;
}

export const CribTestingPanel: React.FC<CribTestingPanelProps> = ({
  ciphertext,
  initialCrib = 'WEATHER',
  onSelectOffset,
  onSendToSearch,
}) => {
  const [cribText, setCribText] = useState(initialCrib);
  const [selectedOffset, setSelectedOffset] = useState<number | null>(0);
  const [filterMode, setFilterMode] = useState<'all' | 'plausible' | 'eliminated'>('all');
  const [showExplanation, setShowExplanation] = useState(false);

  const analysis = useMemo(
    () => analyzeCribPlacements(ciphertext, cribText),
    [ciphertext, cribText]
  );

  const filteredAlignments = useMemo(() => {
    if (filterMode === 'plausible') return analysis.alignments.filter((a) => a.isPlausible);
    if (filterMode === 'eliminated') return analysis.alignments.filter((a) => !a.isPlausible);
    return analysis.alignments;
  }, [analysis, filterMode]);

  const selectedAlignment = useMemo(() => {
    if (selectedOffset === null) return null;
    return analysis.alignments.find((a) => a.offset === selectedOffset) || null;
  }, [analysis, selectedOffset]);

  const handleCribChange = (val: string) => {
    const clean = val.toUpperCase().replace(/[^A-Z]/g, '');
    setCribText(clean);
    setSelectedOffset(0);
  };

  const handleSelectAlignment = (offset: number) => {
    setSelectedOffset(offset);
    if (onSelectOffset) onSelectOffset(offset, cribText);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900/90 border border-stone-800 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-600/40 text-amber-400">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-cinzel text-base font-bold text-stone-100">
              Crib-Dragging & Self-Encryption Elimination
            </h3>
            <p className="text-xs text-stone-400 font-mono">
              Test suspected plaintext fragments against Enigma's non-self-encryption property
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-mono transition-colors self-start sm:self-auto"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>{showExplanation ? 'Hide Guide' : 'How Cribs Work'}</span>
        </button>
      </div>

      {/* Explanation Banner */}
      {showExplanation && (
        <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4 text-xs font-mono text-amber-200 space-y-2.5">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>The Bletchley Park Crib-Dragging Principle</span>
          </div>
          <p>
            • <strong>What is a Crib?</strong> A "crib" is a piece of suspected plaintext known or guessed to appear in an encrypted transmission (e.g., standard weather prefixes like <code className="text-amber-300 font-bold">WETTERBERICHT</code> or military salutations).
          </p>
          <p>
            • <strong>The Self-Encryption Impossibility:</strong> Because of the Enigma's Reflector (Umkehrwalze), an electrical current travels into the rotor maze and is looped back along a different wire. <em>A character can NEVER encrypt to itself!</em> ($C_i \neq P_i$).
          </p>
          <p>
            • <strong>Elimination by Clash:</strong> If placing a crib at offset $k$ causes any crib letter to match the ciphertext letter directly above it, that alignment is mathematically impossible and can be immediately discarded.
          </p>
          <p>
            • <strong>Important Limitation:</strong> A surviving alignment is <em>plausible</em>, not guaranteed. Surviving alignments provide candidate offsets for automated rotor searches.
          </p>
        </div>
      )}

      {/* Input & Statistics Summary Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Crib Input Box */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-2">
          <label className="text-xs font-mono font-bold text-stone-300 uppercase tracking-wider block">
            Suspected Plaintext Fragment (Crib)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={cribText}
              onChange={(e) => handleCribChange(e.target.value)}
              placeholder="e.g. WEATHER or WETTER"
              className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-sm font-mono text-amber-400 uppercase tracking-widest focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-stone-500">
            <span>Length: {cribText.length} chars</span>
            <span>•</span>
            <span>Max offset: {Math.max(0, ciphertext.length - cribText.length)}</span>
          </div>
        </div>

        {/* Elimination Metrics */}
        <div className="lg:col-span-2 grid grid-cols-3 gap-3">
          <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-3.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
              Positions Evaluated
            </div>
            <div className="text-xl font-mono font-bold text-stone-200 mt-1">
              {analysis.totalPositionsEvaluated}
            </div>
            <div className="text-[10px] font-mono text-stone-500 mt-0.5">
              Offsets 0 to {Math.max(0, analysis.totalPositionsEvaluated - 1)}
            </div>
          </div>

          <div className="bg-stone-900/80 border border-emerald-900/40 rounded-xl p-3.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
              Plausible (Surviving)
            </div>
            <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
              {analysis.plausibleCount}
            </div>
            <div className="text-[10px] font-mono text-stone-500 mt-0.5">
              Zero letter clashes
            </div>
          </div>

          <div className="bg-stone-900/80 border border-red-950/40 rounded-xl p-3.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-red-400">
              Eliminated (Clashes)
            </div>
            <div className="text-xl font-mono font-bold text-red-400 mt-1">
              {analysis.eliminatedCount}
            </div>
            <div className="text-[10px] font-mono text-stone-500 mt-0.5">
              {analysis.eliminationPercentage.toFixed(0)}% space eliminated
            </div>
          </div>
        </div>
      </div>

      {/* Selected Alignment Deep-Dive Inspector */}
      {selectedAlignment && (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase text-stone-300">
                Inspection for Offset {selectedAlignment.offset}:
              </span>
              {selectedAlignment.isPlausible ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Plausible Alignment
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-950/80 text-red-300 border border-red-600/50 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Impossible ({selectedAlignment.clashCount} Clashes)
                </span>
              )}
            </div>

            {selectedAlignment.isPlausible && onSendToSearch && (
              <button
                onClick={() => onSendToSearch(cribText, selectedAlignment.offset)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-mono font-bold shadow transition-colors cursor-pointer"
              >
                <span>Use in Automated Search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Letter Alignment Visual Grid */}
          <div className="overflow-x-auto pb-2">
            <div className="inline-flex flex-col gap-1.5 min-w-full font-mono text-xs">
              {/* Cipher text row */}
              <div className="flex items-center gap-1">
                <span className="w-20 text-[10px] uppercase text-stone-500 text-right pr-2">
                  Cipher:
                </span>
                {selectedAlignment.alignedCipherSegment.split('').map((char, idx) => {
                  const isClash = selectedAlignment.clashes.some((c) => c.cribIndex === idx);
                  return (
                    <div
                      key={idx}
                      className={`w-8 h-8 rounded border flex flex-col items-center justify-center font-bold ${
                        isClash
                          ? 'bg-red-950/90 border-red-500 text-red-300 shadow-sm shadow-red-900/50'
                          : 'bg-stone-950 border-stone-700 text-stone-200'
                      }`}
                    >
                      <span>{char}</span>
                    </div>
                  );
                })}
              </div>

              {/* Crib text row */}
              <div className="flex items-center gap-1">
                <span className="w-20 text-[10px] uppercase text-stone-500 text-right pr-2">
                  Crib:
                </span>
                {selectedAlignment.alignedCribText.split('').map((char, idx) => {
                  const isClash = selectedAlignment.clashes.some((c) => c.cribIndex === idx);
                  return (
                    <div
                      key={idx}
                      className={`w-8 h-8 rounded border flex flex-col items-center justify-center font-bold ${
                        isClash
                          ? 'bg-red-950/90 border-red-500 text-red-300 shadow-sm shadow-red-900/50'
                          : 'bg-amber-950/50 border-amber-600/40 text-amber-400'
                      }`}
                    >
                      <span>{char}</span>
                    </div>
                  );
                })}
              </div>

              {/* Offset index indicators */}
              <div className="flex items-center gap-1 text-[9px] text-stone-500">
                <span className="w-20 text-right pr-2">Position:</span>
                {selectedAlignment.alignedCribText.split('').map((_, idx) => (
                  <div key={idx} className="w-8 text-center font-mono">
                    {selectedAlignment.offset + idx}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alignments List / Filter Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400" />
            <h4 className="text-xs font-mono font-bold text-stone-300 uppercase tracking-wider">
              All Calculated Alignments
            </h4>
          </div>

          <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-lg border border-stone-800 text-[11px] font-mono">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterMode === 'all'
                  ? 'bg-amber-900/60 text-amber-200 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              All ({analysis.totalPositionsEvaluated})
            </button>
            <button
              onClick={() => setFilterMode('plausible')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterMode === 'plausible'
                  ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-700/50'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Plausible ({analysis.plausibleCount})
            </button>
            <button
              onClick={() => setFilterMode('eliminated')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterMode === 'eliminated'
                  ? 'bg-red-950 text-red-300 font-bold border border-red-700/50'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Eliminated ({analysis.eliminatedCount})
            </button>
          </div>
        </div>

        {/* Alignment Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
          {filteredAlignments.map((item) => (
            <button
              key={item.offset}
              onClick={() => handleSelectAlignment(item.offset)}
              className={`p-3 rounded-lg border text-left font-mono transition-all cursor-pointer ${
                selectedOffset === item.offset
                  ? 'bg-amber-950/50 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                  : item.isPlausible
                    ? 'bg-stone-950/80 border-emerald-900/50 hover:border-emerald-500'
                    : 'bg-stone-950/40 border-stone-800/80 hover:border-stone-700 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-stone-200">Offset {item.offset}</span>
                {item.isPlausible ? (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Plausible
                  </span>
                ) : (
                  <span className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> {item.clashCount} Clash{item.clashCount > 1 ? 'es' : ''}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-stone-400 truncate">
                Cipher: <span className="text-stone-200">{item.alignedCipherSegment}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
