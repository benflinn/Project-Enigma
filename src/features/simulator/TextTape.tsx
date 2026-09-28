import React, { useState } from 'react';
import { useSimulatorStore } from '../../state/simulatorStore';
import { formatMilitaryGroups } from '../../engine/enigma';
import { Copy, Check, Trash2, FileText, SplitSquareVertical } from 'lucide-react';

export const TextTape: React.FC = () => {
  const { inputText, outputText, clearText } = useSimulatorStore();
  const [groupedMode, setGroupedMode] = useState(true);
  const [copied, setCopied] = useState(false);

  const displayInput = groupedMode ? formatMilitaryGroups(inputText) : inputText;
  const displayOutput = groupedMode ? formatMilitaryGroups(outputText) : outputText;

  const handleCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(displayOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-between mb-3 border-b border-stone-800 pb-2 gap-2">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-500" />
          <h2 className="font-cinzel tracking-wider text-amber-400 font-bold text-sm uppercase">
            Schreibstreifen (Message Tape)
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-stone-400">
            Length: <strong className="text-amber-400">{outputText.length}</strong> chars
          </span>

          <button
            onClick={() => setGroupedMode(!groupedMode)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors ${
              groupedMode
                ? 'bg-amber-950/60 border-amber-700/60 text-amber-300'
                : 'bg-stone-800 border-stone-700 text-stone-400'
            }`}
            title="Toggle 5-character military cipher groupings"
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            5-Letter Groups
          </button>

          {outputText && (
            <>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-stone-300 hover:text-amber-300 transition-colors"
                title="Copy ciphertext to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>

              <button
                onClick={clearText}
                className="flex items-center gap-1 text-stone-400 hover:text-red-400 transition-colors"
                title="Clear tape display (retains machine rotor positions)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Tape
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Plaintext Input Ribbon */}
        <div className="bg-stone-950 border border-stone-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1.5 text-[11px] font-mono text-stone-400">
            <span className="uppercase font-bold text-stone-300">Plaintext (Eingabe)</span>
            <span>{inputText.length} chars</span>
          </div>
          <div className="min-h-16 max-h-32 overflow-y-auto p-2 bg-stone-900/90 rounded border border-stone-800 text-stone-200 font-mono-military text-sm tracking-widest break-all select-text">
            {displayInput || <span className="text-stone-600 italic">No input yet... Type on keyboard</span>}
          </div>
        </div>

        {/* Ciphertext Output Ribbon */}
        <div className="bg-stone-950 border border-stone-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1.5 text-[11px] font-mono text-stone-400">
            <span className="uppercase font-bold text-amber-400">Ciphertext (Ausgabe)</span>
            <span>{outputText.length} chars</span>
          </div>
          <div className="min-h-16 max-h-32 overflow-y-auto p-2 bg-amber-950/20 rounded border border-amber-900/40 text-amber-300 font-mono-military text-sm font-bold tracking-widest break-all select-text shadow-inner">
            {displayOutput || <span className="text-amber-800/60 italic">Waiting for encryption...</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
