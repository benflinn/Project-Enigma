import React, { useState } from 'react';
import { NotebookEntryRecord } from '../../storage/db';
import { EnigmaMachineConfig } from '../../engine/enigma';
import {
  BookOpen,
  Trash2,
  Share2,
  Plus,
  Calendar,
  Check,
  Edit3,
} from 'lucide-react';

interface InvestigationNotebookPanelProps {
  entries: NotebookEntryRecord[];
  onDeleteEntry: (id: string) => void;
  onTransferToSimulator: (config: EnigmaMachineConfig, text?: string) => void;
  onAddNewEntry: (
    title: string,
    notes: string,
    config: EnigmaMachineConfig,
    score?: number,
    plaintext?: string
  ) => void;
  currentConfig?: EnigmaMachineConfig;
}

export const InvestigationNotebookPanel: React.FC<InvestigationNotebookPanelProps> = ({
  entries,
  onDeleteEntry,
  onTransferToSimulator,
  onAddNewEntry,
  currentConfig,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  const handleTransfer = (entry: NotebookEntryRecord) => {
    onTransferToSimulator(entry.config, entry.decryptedPlaintext);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCreate = () => {
    if (!title.trim()) return;
    const fallbackConfig: EnigmaMachineConfig = currentConfig || {
      rotors: [
        { type: 'I', position: 'A', ringSetting: 1 },
        { type: 'II', position: 'A', ringSetting: 1 },
        { type: 'III', position: 'A', ringSetting: 1 },
      ],
      reflector: 'B',
      plugboard: [],
    };

    onAddNewEntry(title, notes, fallbackConfig);
    setTitle('');
    setNotes('');
    setCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900/90 border border-stone-800 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-600/40 text-amber-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-cinzel text-base font-bold text-stone-100">
              Investigation Notebook & Findings Log
            </h3>
            <p className="text-xs text-stone-400 font-mono">
              Preserve breakthrough hypotheses, compare rotor configurations, and restore discoveries
            </p>
          </div>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-mono font-bold transition-colors shadow cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Hypothesis Note</span>
        </button>
      </div>

      {/* Entries List */}
      {entries.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-center mx-auto text-stone-500">
            <Edit3 className="w-6 h-6" />
          </div>
          <h4 className="font-cinzel text-base font-bold text-stone-200">
            Your Notebook is Empty
          </h4>
          <p className="text-xs font-mono text-stone-400 max-w-sm mx-auto">
            Save promising candidate configurations from automated searches or record custom notes here to track your cryptanalytic progress.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-3 flex flex-col justify-between shadow-md"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-cinzel font-bold text-sm text-stone-100">
                    {entry.title}
                  </h4>
                  <button
                    onClick={() => onDeleteEntry(entry.id)}
                    className="p-1 rounded text-stone-500 hover:text-red-400 transition-colors"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono text-stone-500">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(entry.createdAt).toLocaleDateString()} {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {entry.candidateScore !== undefined && (
                    <>
                      <span>•</span>
                      <span className="text-amber-400 font-bold">Score: {entry.candidateScore.toFixed(3)}</span>
                    </>
                  )}
                </div>

                {/* Notes Text */}
                <div className="bg-stone-950/60 rounded-lg p-2.5 text-xs font-mono text-stone-300 whitespace-pre-wrap border border-stone-800/80">
                  {entry.notes}
                </div>

                {/* Machine Config Badges */}
                <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-stone-400">
                  <div className="bg-stone-950 px-2 py-1 rounded border border-stone-800">
                    Rotors: <strong className="text-stone-200">{entry.config.rotors.map((r) => r.type).join('-')}</strong>
                  </div>
                  <div className="bg-stone-950 px-2 py-1 rounded border border-stone-800">
                    Pos: <strong className="text-amber-400 tracking-wider">{entry.config.rotors.map((r) => r.position).join('')}</strong>
                  </div>
                </div>

                {entry.decryptedPlaintext && (
                  <div className="text-[11px] font-mono text-stone-400 truncate bg-stone-950/80 px-2.5 py-1 rounded border border-stone-800">
                    Plaintext: <span className="text-emerald-300 font-bold">{entry.decryptedPlaintext}</span>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-stone-800 flex justify-end">
                <button
                  onClick={() => handleTransfer(entry)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    copiedId === entry.id
                      ? 'bg-emerald-600 text-stone-950'
                      : 'bg-stone-800 hover:bg-stone-700 text-amber-400'
                  }`}
                >
                  {copiedId === entry.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Loaded to Simulator!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Load into Simulator</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manual New Entry Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="font-cinzel text-lg font-bold text-stone-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              <span>Record New Hypothesis</span>
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-stone-300 font-bold">Title / Hypothesis Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Heligoland Flotilla Night Key Hypothesis"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-300 font-bold">Deductions & Notes:</label>
                <textarea
                  rows={4}
                  placeholder="Record your cryptographic deductions, eliminated wheels, or suspected plaintexts..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700 text-xs font-mono transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!title.trim()}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs font-mono transition-colors shadow-md disabled:opacity-50"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
