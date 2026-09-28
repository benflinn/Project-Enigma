import React from 'react';
import { CandidateResult } from '../../engine/cryptanalysis/searchEngine';
import { X, ArrowRightLeft, ShieldCheck } from 'lucide-react';

interface CandidateComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateA: CandidateResult | null;
  candidateB: CandidateResult | null;
  onTransferToSimulator: (cand: CandidateResult) => void;
}

export const CandidateComparisonModal: React.FC<CandidateComparisonModalProps> = ({
  isOpen,
  onClose,
  candidateA,
  candidateB,
  onTransferToSimulator,
}) => {
  if (!isOpen || !candidateA) return null;

  const scoreDelta = candidateB ? (candidateA.score - candidateB.score).toFixed(3) : '—';

  // Compare plugboards
  const plugsA = new Set(candidateA.config.plugboard);
  const plugsB = new Set(candidateB?.config.plugboard || []);

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel text-lg font-bold text-stone-100">
              Candidate Configuration Comparison
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Summary Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Candidate A Card */}
          <div className="bg-stone-950 p-4 rounded-xl border border-amber-600/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-amber-400 uppercase">
                Primary Candidate #{candidateA.rank}
              </span>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-950 border border-amber-600/60 text-amber-300">
                Score: {candidateA.score.toFixed(3)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="bg-stone-900 p-2 rounded border border-stone-800">
                <span className="text-[10px] text-stone-400 block">Rotor Order</span>
                <span className="font-bold text-stone-200">
                  {candidateA.config.rotors.map((r) => r.type).join('-')}
                </span>
              </div>
              <div className="bg-stone-900 p-2 rounded border border-stone-800">
                <span className="text-[10px] text-stone-400 block">Positions</span>
                <span className="font-bold text-amber-400">
                  [{candidateA.config.rotors.map((r) => r.position).join(' ')}]
                </span>
              </div>
              <div className="bg-stone-900 p-2 rounded border border-stone-800">
                <span className="text-[10px] text-stone-400 block">Reflector</span>
                <span className="font-bold text-stone-200">{candidateA.config.reflector}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono text-stone-400 block mb-1">Stecker Pairs</span>
              <div className="flex flex-wrap gap-1">
                {candidateA.config.plugboard.length > 0 ? (
                  candidateA.config.plugboard.map((p) => (
                    <span
                      key={p}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        plugsB.has(p)
                          ? 'bg-stone-900 text-stone-300 border border-stone-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-600'
                      }`}
                    >
                      {p}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-stone-500 font-mono italic">None</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono text-stone-400 block mb-1">Decrypted Plaintext</span>
              <p className="font-mono text-xs text-stone-300 bg-stone-900 p-2.5 rounded border border-stone-800 break-all leading-relaxed">
                {candidateA.plaintext}
              </p>
            </div>

            <button
              onClick={() => {
                onTransferToSimulator(candidateA);
                onClose();
              }}
              className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-mono text-xs font-bold transition-all shadow cursor-pointer"
            >
              Transfer Candidate #{candidateA.rank} to Simulator
            </button>
          </div>

          {/* Candidate B Card */}
          {candidateB ? (
            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-stone-400 uppercase">
                  Alternative Candidate #{candidateB.rank}
                </span>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-stone-900 border border-stone-700 text-stone-300">
                  Score: {candidateB.score.toFixed(3)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="bg-stone-900 p-2 rounded border border-stone-800">
                  <span className="text-[10px] text-stone-400 block">Rotor Order</span>
                  <span className="font-bold text-stone-200">
                    {candidateB.config.rotors.map((r) => r.type).join('-')}
                  </span>
                </div>
                <div className="bg-stone-900 p-2 rounded border border-stone-800">
                  <span className="text-[10px] text-stone-400 block">Positions</span>
                  <span className="font-bold text-stone-300">
                    [{candidateB.config.rotors.map((r) => r.position).join(' ')}]
                  </span>
                </div>
                <div className="bg-stone-900 p-2 rounded border border-stone-800">
                  <span className="text-[10px] text-stone-400 block">Reflector</span>
                  <span className="font-bold text-stone-200">{candidateB.config.reflector}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-stone-400 block mb-1">Stecker Pairs</span>
                <div className="flex flex-wrap gap-1">
                  {candidateB.config.plugboard.length > 0 ? (
                    candidateB.config.plugboard.map((p) => (
                      <span
                        key={p}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          plugsA.has(p)
                            ? 'bg-stone-900 text-stone-300 border border-stone-800'
                            : 'bg-stone-800 text-stone-400 border border-stone-700'
                        }`}
                      >
                        {p}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-stone-500 font-mono italic">None</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-stone-400 block mb-1">Decrypted Plaintext</span>
                <p className="font-mono text-xs text-stone-400 bg-stone-900 p-2.5 rounded border border-stone-800 break-all leading-relaxed">
                  {candidateB.plaintext}
                </p>
              </div>

              <button
                onClick={() => {
                  onTransferToSimulator(candidateB);
                  onClose();
                }}
                className="w-full py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono text-xs font-bold transition-all border border-stone-700 cursor-pointer"
              >
                Transfer Candidate #{candidateB.rank} to Simulator
              </button>
            </div>
          ) : (
            <div className="bg-stone-950 p-6 rounded-xl border border-stone-800 flex flex-col items-center justify-center text-center text-stone-500 space-y-2">
              <span className="font-mono text-xs">Select a second candidate from the results table to compare.</span>
            </div>
          )}
        </div>

        {/* Differential Analysis Section */}
        {candidateB && (
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="font-mono text-xs font-bold text-stone-200 block">
                  Score Separation: +{scoreDelta}
                </span>
                <span className="text-[11px] text-stone-400 font-sans">
                  {candidateA.confidence?.explanation || 'Higher statistical separation indicates increased confidence.'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
