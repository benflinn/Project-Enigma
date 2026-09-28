import React, { useState } from 'react';
import { InterceptTrainingMessage } from '../../engine/cryptanalysis/interceptArchive';
import {
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';

interface MessageInspectorProps {
  message: InterceptTrainingMessage;
  onSendCribToSearch?: (crib: string, offset: number) => void;
  onNavigateToTab?: (tab: any) => void;
}

export const MessageInspector: React.FC<MessageInspectorProps> = ({
  message,
  onNavigateToTab,
}) => {
  const [groupedFormat, setGroupedFormat] = useState(true);
  const [copied, setCopied] = useState(false);

  const formattedCiphertext = groupedFormat
    ? message.ciphertext.match(/.{1,5}/g)?.join(' ') || message.ciphertext
    : message.ciphertext;

  const handleCopyCipher = () => {
    navigator.clipboard?.writeText(message.ciphertext);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-4">
      {/* Top Details & Copy Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-cinzel text-base font-bold text-stone-100">
              {message.title}
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-amber-400 border border-stone-700">
              ID: {message.id}
            </span>
          </div>
          <p className="text-xs font-mono text-stone-400 mt-0.5">
            {message.historicalContext}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setGroupedFormat(!groupedFormat)}
            className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-mono transition-colors"
          >
            {groupedFormat ? 'Continuous Format' : '5-Letter Groups'}
          </button>

          <button
            onClick={handleCopyCipher}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-600/40 text-xs font-mono transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Ciphertext Display Strip */}
      <div className="bg-stone-950 p-4 rounded-xl border border-stone-800/80 space-y-1.5">
        <div className="flex justify-between text-[10px] font-mono uppercase text-stone-500">
          <span>Intercepted Ciphertext ({message.ciphertext.length} characters)</span>
          <span>Wehrmacht Standard Wechselschrift</span>
        </div>
        <div className="font-mono text-sm sm:text-base text-amber-400 tracking-widest leading-relaxed break-all select-all font-semibold">
          {formattedCiphertext}
        </div>
      </div>

      {/* Known Intelligence Parameters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs font-mono">
        <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 space-y-1">
          <span className="text-[10px] text-stone-500 uppercase block font-bold">Rotor Order</span>
          <div className="text-stone-200">
            {message.playerKnowns.rotorOrderKnown ? (
              <span className="text-emerald-400 font-bold">
                {message.playerKnowns.knownRotorOrder?.join(' - ')} (Confirmed)
              </span>
            ) : (
              <span className="text-amber-400 font-bold">
                Chosen from: {message.playerKnowns.possibleRotorTypes?.join(', ')}
              </span>
            )}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 space-y-1">
          <span className="text-[10px] text-stone-500 uppercase block font-bold">Starting Positions</span>
          <div className="text-stone-200 font-bold tracking-wider">
            {message.playerKnowns.knownPositions?.map((p, i) => (
              <span key={i} className={p ? 'text-emerald-400 mr-1.5' : 'text-amber-400 mr-1.5'}>
                [{p || '?'}]
              </span>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 space-y-1">
          <span className="text-[10px] text-stone-500 uppercase block font-bold">Ring Settings / Reflector</span>
          <div className="text-stone-300">
            Rings: {message.playerKnowns.knownRingSettings?.join('-')} • Reflector: {message.playerKnowns.knownReflector || 'B'}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 space-y-1">
          <span className="text-[10px] text-stone-500 uppercase block font-bold">Steckerbrett (Plugboard)</span>
          <div className="text-stone-300 truncate">
            {message.playerKnowns.knownPlugboard?.length ? (
              <span>{message.playerKnowns.knownPlugboard.join(' ')}</span>
            ) : (
              <span className="text-stone-500">None Connected</span>
            )}
          </div>
        </div>
      </div>

      {/* Suspected Cribs Quick-Select Drawer */}
      {message.playerKnowns.suspectedCribs && message.playerKnowns.suspectedCribs.length > 0 && (
        <div className="bg-amber-950/20 border border-amber-800/40 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-200">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Suspected Plaintext Clue (Crib):{' '}
              <strong className="text-amber-300">
                "{message.playerKnowns.suspectedCribs[0].text}"
              </strong>{' '}
              ({message.playerKnowns.suspectedCribs[0].description})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateToTab?.('crib')}
              className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-mono font-bold transition-colors shadow"
            >
              Analyze Crib Placement
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
