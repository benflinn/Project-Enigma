import React, { useMemo, useState } from 'react';
import {
  analyzeTextStatistics,
} from '../../engine/cryptanalysis/statistics';
import { BarChart3, HelpCircle, Info, Sparkles } from 'lucide-react';

interface StatisticalAnalysisPanelProps {
  ciphertext: string;
  samplePlaintext?: string;
}

export const StatisticalAnalysisPanel: React.FC<StatisticalAnalysisPanelProps> = ({
  ciphertext,
  samplePlaintext,
}) => {
  const [viewMode, setViewMode] = useState<'ciphertext' | 'candidate'>('ciphertext');
  const [showExplanation, setShowExplanation] = useState(false);

  const activeText = viewMode === 'candidate' && samplePlaintext ? samplePlaintext : ciphertext;
  const stats = useMemo(() => analyzeTextStatistics(activeText), [activeText]);

  const maxFreq = useMemo(() => {
    let max = 0;
    stats.frequencies.forEach((f) => {
      if (f.observedPercentage > max) max = f.observedPercentage;
      if (f.expectedPercentage > max) max = f.expectedPercentage;
    });
    return Math.max(15, Math.ceil(max));
  }, [stats]);

  return (
    <div className="space-y-6">
      {/* Top Controls & Explanation Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900/90 border border-stone-800 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-600/40 text-amber-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-cinzel text-base font-bold text-stone-100">
              Statistical Cryptanalysis Profile
            </h3>
            <p className="text-xs text-stone-400 font-mono">
              Index of Coincidence (IoC), Chi-Squared & Monogram distribution
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {samplePlaintext && (
            <div className="flex rounded-lg bg-stone-950 p-1 border border-stone-800 text-xs font-mono">
              <button
                onClick={() => setViewMode('ciphertext')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  viewMode === 'ciphertext'
                    ? 'bg-amber-900/60 text-amber-200 font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Ciphertext
              </button>
              <button
                onClick={() => setViewMode('candidate')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  viewMode === 'candidate'
                    ? 'bg-amber-900/60 text-amber-200 font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Candidate Plaintext
              </button>
            </div>
          )}

          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-mono transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>{showExplanation ? 'Hide Guide' : 'Explain Statistics'}</span>
          </button>
        </div>
      </div>

      {/* Educational Guide Drawer */}
      {showExplanation && (
        <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4 text-xs font-mono text-amber-200 space-y-2.5">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <Info className="w-4 h-4 text-amber-400" />
            <span>Understanding Polyalphabetic vs. Monalphabetic Statistics</span>
          </div>
          <p>
            • <strong>Index of Coincidence (IoC):</strong> Measures the probability that two randomly selected letters from the text are identical. Standard English plaintext has an IoC of <strong>~0.0667</strong>. Uniform random noise or polyalphabetic ciphertext (like Enigma) yields <strong>~0.0385</strong>.
          </p>
          <p>
            • <strong>Enigma's Flat Distribution:</strong> Because the Enigma machine advances its rotors after every single keypress, the underlying substitution cipher changes constantly. As a result, raw ciphertext shows a flat letter distribution, rendering simple frequency substitution ineffective.
          </p>
          <p>
            • <strong>Plaintext Verification:</strong> When a decryption key correctly aligns the rotors, the resulting plaintext exhibits the natural vowel and consonant spikes of language, boosting the IoC towards 0.066 and reducing the Chi-squared discrepancy.
          </p>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-3.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
            Index of Coincidence
          </div>
          <div className="text-xl font-mono font-bold text-amber-400 mt-1">
            {stats.indexOfCoincidence.toFixed(4)}
          </div>
          <div className="text-[10px] font-mono text-stone-500 mt-0.5">
            Target: ~0.0667 (Eng) | ~0.0385 (Noise)
          </div>
        </div>

        <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-3.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
            Chi-Squared Error ($\chi^2$)
          </div>
          <div className="text-xl font-mono font-bold text-amber-400 mt-1">
            {stats.chiSquared.toFixed(1)}
          </div>
          <div className="text-[10px] font-mono text-stone-500 mt-0.5">
            Lower is closer to natural English
          </div>
        </div>

        <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-3.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
            Text Length
          </div>
          <div className="text-xl font-mono font-bold text-stone-200 mt-1">
            {stats.textLength} <span className="text-xs text-stone-500">chars</span>
          </div>
          <div className="text-[10px] font-mono text-stone-500 mt-0.5">
            {stats.uniqueLetters} unique letters present
          </div>
        </div>

        <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-3.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
            Language Likelihood
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            {stats.isLikelyNaturalLanguage ? (
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Natural Language
              </span>
            ) : (
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700">
                Encrypted / Dispersed
              </span>
            )}
          </div>
          <div className="text-[10px] font-mono text-stone-500 mt-1">
            Normalized IC: {stats.normalizedIC.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Monogram Frequency Chart */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-mono font-bold text-stone-200 uppercase tracking-wider">
            Monogram Letter Frequency Distribution vs. Expected English
          </h4>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" />
              <span className="text-stone-300">Observed %</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-stone-600 inline-block" />
              <span className="text-stone-400">English Standard %</span>
            </div>
          </div>
        </div>

        {/* Bar Chart Container */}
        <div className="grid grid-cols-26 gap-1 h-44 items-end pt-4 pb-1 border-b border-stone-800">
          {stats.frequencies.map((freq) => {
            const observedHeight = `${Math.min(100, (freq.observedPercentage / maxFreq) * 100)}%`;
            const expectedHeight = `${Math.min(100, (freq.expectedPercentage / maxFreq) * 100)}%`;

            return (
              <div
                key={freq.letter}
                className="group relative flex flex-col items-center h-full justify-end"
              >
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                  <div className="bg-stone-950 border border-stone-700 text-stone-100 text-[10px] font-mono rounded px-2 py-1 shadow-lg whitespace-nowrap">
                    <div className="font-bold text-amber-400">Letter: {freq.letter}</div>
                    <div>Count: {freq.count} ({freq.observedPercentage.toFixed(1)}%)</div>
                    <div>Expected: {freq.expectedPercentage.toFixed(1)}%</div>
                  </div>
                  <div className="w-2 h-2 bg-stone-950 border-r border-b border-stone-700 rotate-45 -mt-1" />
                </div>

                {/* Bars */}
                <div className="w-full flex items-end justify-center gap-0.5 h-full">
                  <div
                    style={{ height: observedHeight }}
                    className="w-1/2 bg-amber-500 rounded-t-sm transition-all duration-300 group-hover:bg-amber-400"
                  />
                  <div
                    style={{ height: expectedHeight }}
                    className="w-1/2 bg-stone-700/80 rounded-t-sm transition-all duration-300 group-hover:bg-stone-600"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Letter Labels */}
        <div className="grid grid-cols-26 gap-1 pt-1.5 text-center">
          {stats.frequencies.map((f) => (
            <span
              key={f.letter}
              className={`text-[9px] font-mono font-bold ${
                f.count > 0 ? 'text-amber-400' : 'text-stone-600'
              }`}
            >
              {f.letter}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
