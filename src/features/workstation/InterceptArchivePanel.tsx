import React from 'react';
import {
  TRAINING_MESSAGES,
} from '../../engine/cryptanalysis/interceptArchive';
import {
  Radio,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface InterceptArchivePanelProps {
  selectedMessageId: string;
  onSelectMessage: (id: string) => void;
}

export const InterceptArchivePanel: React.FC<InterceptArchivePanelProps> = ({
  selectedMessageId,
  onSelectMessage,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900/90 border border-stone-800 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-600/40 text-amber-400">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-cinzel text-base font-bold text-stone-100">
              Signals Intercept Archive
            </h3>
            <p className="text-xs text-stone-400 font-mono">
              Intercepted German military radio traffic categorized by cryptanalytic difficulty
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-stone-400 bg-stone-950 px-3 py-1.5 rounded-lg border border-stone-800">
          Total Intercepts: <strong className="text-amber-400">{TRAINING_MESSAGES.length} Messages</strong>
        </div>
      </div>

      {/* Messages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TRAINING_MESSAGES.map((msg) => {
          const isSelected = selectedMessageId === msg.id;

          const difficultyBadge =
            msg.difficulty === 'beginner' ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-600/50">
                Beginner (1 Wheel Unknown)
              </span>
            ) : msg.difficulty === 'intermediate' ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/90 text-amber-300 border border-amber-600/50">
                Intermediate (3 Wheels Unknown)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/90 text-rose-300 border border-rose-600/50">
                Advanced (Wheel Order Unknown)
              </span>
            );

          return (
            <div
              key={msg.id}
              className={`rounded-xl border p-4 flex flex-col justify-between transition-all duration-200 ${
                isSelected
                  ? 'bg-amber-950/30 border-amber-500/80 shadow-lg ring-1 ring-amber-500/40'
                  : 'bg-stone-900 border-stone-800 hover:border-stone-700'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-cinzel font-bold text-sm text-stone-100">
                    {msg.title}
                  </h4>
                  {isSelected && (
                    <span className="text-amber-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                </div>

                <div>{difficultyBadge}</div>

                <p className="text-xs font-mono text-stone-400 line-clamp-3 leading-relaxed">
                  {msg.historicalContext}
                </p>

                {/* Cipher preview */}
                <div className="bg-stone-950 p-2 rounded border border-stone-800 font-mono text-[11px] text-amber-400/90 tracking-widest truncate">
                  {msg.ciphertext.substring(0, 25)}...
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 mt-3 border-t border-stone-800 flex items-center justify-between">
                <span className="text-[10px] font-mono text-stone-500 uppercase">
                  {msg.ciphertext.length} Chars
                </span>

                <button
                  onClick={() => onSelectMessage(msg.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-600 text-stone-950 shadow'
                      : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                  }`}
                >
                  <span>{isSelected ? 'Active Target' : 'Select Target'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
