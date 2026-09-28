import React, { useState } from 'react';
import { CandidateResult } from '../../engine/cryptanalysis/searchEngine';
import {
  Award,
  CheckCircle2,
  Share2,
  BookmarkPlus,
  Check,
  Search,
  ArrowRightLeft,
  ShieldCheck,
} from 'lucide-react';

interface ResultsPanelProps {
  candidates: CandidateResult[];
  selectedCandidate: CandidateResult | null;
  onSelectCandidate: (candidate: CandidateResult) => void;
  onTransferToSimulator: (candidate: CandidateResult) => void;
  onSaveToNotebook: (
    title: string,
    notes: string,
    candidate: CandidateResult
  ) => void;
  onCompareCandidates?: (candidateA: CandidateResult, candidateB: CandidateResult) => void;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  candidates,
  selectedCandidate,
  onSelectCandidate,
  onTransferToSimulator,
  onSaveToNotebook,
  onCompareCandidates,
}) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const handleTransfer = (cand: CandidateResult) => {
    onTransferToSimulator(cand);
    setCopiedId(cand.rank);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenSaveModal = (cand: CandidateResult) => {
    const rotors = cand.config.rotors.map((r) => r.type).join('-');
    const pos = cand.config.rotors.map((r) => r.position).join('');
    setNoteTitle(`Candidate #${cand.rank}: ${rotors} [${pos}]`);
    setNoteContent(
      `Decrypted Plaintext: ${cand.plaintext.substring(0, 40)}...\nStatistical Score: ${cand.score.toFixed(3)}`
    );
    setSaveModalOpen(true);
  };

  const handleConfirmSave = () => {
    if (selectedCandidate) {
      onSaveToNotebook(noteTitle, noteContent, selectedCandidate);
      setSaveModalOpen(false);
    }
  };

  if (candidates.length === 0) {
    return (
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-center mx-auto text-stone-500">
          <Search className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="font-cinzel text-lg font-bold text-stone-200">
            No Search Results Available
          </h3>
          <p className="text-xs font-mono text-stone-400">
            Launch an automated bounded search from the "Automated Search" tab to evaluate candidate rotor orders and starting positions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selected Candidate Detailed Inspection Card */}
      {selectedCandidate && (
        <div className="bg-stone-900 border border-amber-600/40 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-600/60 text-amber-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-cinzel text-base font-bold text-stone-100">
                    Candidate #{selectedCandidate.rank}
                  </h3>
                  {selectedCandidate.cribMatched && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-600/50 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Exact Crib Match
                    </span>
                  )}
                  {selectedCandidate.confidence && (
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border flex items-center gap-1 ${
                        selectedCandidate.confidence.rating === 'Definitive'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                          : selectedCandidate.confidence.rating === 'High'
                            ? 'bg-amber-950 text-amber-300 border-amber-600'
                            : 'bg-stone-800 text-stone-300 border-stone-700'
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      {selectedCandidate.confidence.rating} Confidence
                    </span>
                  )}
                </div>
                <div className="text-xs font-mono text-stone-400">
                  Statistical Score: <strong className="text-amber-400 font-bold">{selectedCandidate.score.toFixed(3)}</strong>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {candidates.length >= 2 && onCompareCandidates && (
                <button
                  onClick={() => {
                    const runnerUp = candidates.find((c) => c.rank !== selectedCandidate.rank) || candidates[1];
                    onCompareCandidates(selectedCandidate, runnerUp);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-mono border border-stone-700 transition-colors cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Compare Candidates</span>
                </button>
              )}

              <button
                onClick={() => handleTransfer(selectedCandidate)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  copiedId === selectedCandidate.rank
                    ? 'bg-emerald-600 text-stone-950'
                    : 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-md shadow-amber-950/40'
                }`}
              >
                {copiedId === selectedCandidate.rank ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Loaded to Simulator!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Transfer to Simulator</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleOpenSaveModal(selectedCandidate)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono transition-colors cursor-pointer"
              >
                <BookmarkPlus className="w-3.5 h-3.5 text-amber-400" />
                <span>Save to Notebook</span>
              </button>
            </div>
          </div>

          {/* Machine Configuration Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded bg-stone-950 border border-stone-800">
              <span className="text-[10px] text-stone-500 uppercase block">Rotor Order</span>
              <span className="text-stone-200 font-bold">
                {selectedCandidate.config.rotors.map((r) => r.type).join(' - ')}
              </span>
            </div>

            <div className="p-2.5 rounded bg-stone-950 border border-stone-800">
              <span className="text-[10px] text-stone-500 uppercase block">Starting Positions</span>
              <span className="text-amber-400 font-bold text-sm tracking-widest">
                {selectedCandidate.config.rotors.map((r) => r.position).join(' ')}
              </span>
            </div>

            <div className="p-2.5 rounded bg-stone-950 border border-stone-800">
              <span className="text-[10px] text-stone-500 uppercase block">Ring Settings</span>
              <span className="text-stone-300 font-bold">
                {selectedCandidate.config.rotors.map((r) => r.ringSetting.toString().padStart(2, '0')).join('-')}
              </span>
            </div>

            <div className="p-2.5 rounded bg-stone-950 border border-stone-800">
              <span className="text-[10px] text-stone-500 uppercase block">Reflector / Stecker</span>
              <span className="text-stone-300 font-bold truncate block">
                {selectedCandidate.config.reflector} ({selectedCandidate.config.plugboard.length > 0 ? selectedCandidate.config.plugboard.join(' ') : 'None'})
              </span>
            </div>
          </div>

          {/* Decrypted Plaintext Box */}
          <div className="bg-stone-950 rounded-lg p-3.5 border border-stone-800 space-y-1">
            <span className="text-[10px] font-mono text-stone-500 uppercase font-bold tracking-wider block">
              Recovered Plaintext:
            </span>
            <div className="font-mono text-sm text-stone-100 tracking-wider break-all leading-relaxed font-semibold">
              {selectedCandidate.plaintext}
            </div>
          </div>
        </div>
      )}

      {/* Candidate Results Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-mono font-bold text-stone-200 uppercase tracking-wider">
              Evaluated Candidates ({candidates.length})
            </h4>
          </div>
          <span className="text-[11px] font-mono text-stone-500">
            Sorted deterministically by fitness score
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-stone-950/80 text-stone-400 uppercase text-[10px] border-b border-stone-800">
              <tr>
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Rotors</th>
                <th className="py-2.5 px-3">Positions</th>
                <th className="py-2.5 px-3">Plugboard</th>
                <th className="py-2.5 px-3">Score</th>
                <th className="py-2.5 px-4">Recovered Plaintext Sample</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {candidates.map((cand) => {
                const isSelected = selectedCandidate?.rank === cand.rank;
                return (
                  <tr
                    key={cand.rank}
                    onClick={() => onSelectCandidate(cand)}
                    className={`hover:bg-stone-800/50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-amber-950/40 font-bold' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-stone-400">
                      #{cand.rank}
                    </td>
                    <td className="py-2.5 px-3 text-stone-200">
                      {cand.config.rotors.map((r) => r.type).join('-')}
                    </td>
                    <td className="py-2.5 px-3 text-amber-400 font-bold tracking-widest">
                      {cand.config.rotors.map((r) => r.position).join('')}
                    </td>
                    <td className="py-2.5 px-3 text-stone-300 truncate max-w-[100px]">
                      {cand.config.plugboard.length > 0 ? cand.config.plugboard.join(' ') : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400">
                      {cand.score.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-4 text-stone-300 truncate max-w-xs">
                      {cand.plaintext.substring(0, 32)}...
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTransfer(cand);
                        }}
                        className="p-1 rounded hover:bg-stone-700 text-amber-400 transition-colors"
                        title="Load into Simulator"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save to Notebook Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="font-cinzel text-lg font-bold text-stone-100 flex items-center gap-2">
              <BookmarkPlus className="w-5 h-5 text-amber-400" />
              <span>Save Hypothesis to Notebook</span>
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-stone-300 font-bold">Entry Title:</label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-300 font-bold">Investigation Notes:</label>
                <textarea
                  rows={4}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSaveModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700 text-xs font-mono transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs font-mono transition-colors shadow-md"
              >
                Save Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
