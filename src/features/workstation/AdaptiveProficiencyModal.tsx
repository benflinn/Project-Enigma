import React from 'react';
import {
  PlayerProficiencyRecord,
  DifficultyPreference,
  ProficiencyCategory,
} from '../../engine/cryptanalysis/adaptiveIntelligence';
import { X, Brain, RotateCcw, Sliders } from 'lucide-react';

interface AdaptiveProficiencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  proficiency: PlayerProficiencyRecord;
  onSetDifficultyPreference: (pref: DifficultyPreference) => void;
  onResetProficiency: () => void;
}

const CATEGORY_LABELS: Record<ProficiencyCategory, { label: string; desc: string }> = {
  enigmaMechanics: {
    label: 'Enigma Mechanics',
    desc: 'Rotor stepping, turnover notches, and physical signal propagation.',
  },
  cribAnalysis: {
    label: 'Crib Analysis',
    desc: 'Plaintext alignment, non-self-encryption, and collision elimination.',
  },
  statisticalInterpretation: {
    label: 'Statistical Interpretation',
    desc: 'Index of Coincidence, Chi-Squared fitness, and Quadgram likelihood.',
  },
  searchStrategy: {
    label: 'Search Strategy',
    desc: 'Combinatorial workload budgeting, hill climbing, and hybrid searches.',
  },
  configurationVerification: {
    label: 'Configuration Verification',
    desc: 'Physical simulator reproduction and authentic message recovery.',
  },
};

export const AdaptiveProficiencyModal: React.FC<AdaptiveProficiencyModalProps> = ({
  isOpen,
  onClose,
  proficiency,
  onSetDifficultyPreference,
  onResetProficiency,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-600/60 text-amber-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cinzel text-lg font-bold text-stone-100">
                Analyst Skill Profile & Adaptive Intelligence
              </h3>
              <p className="text-xs text-stone-400 font-mono">
                Rank: <strong className="text-amber-400">{proficiency.masteryLevel}</strong> ({proficiency.overallScore}/100)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Difficulty Preference Selector */}
        <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-stone-200 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-amber-400" /> Assistance & Challenge Mode
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['Adaptive', 'Standard', 'Guided', 'Veteran'] as DifficultyPreference[]).map((pref) => (
              <button
                key={pref}
                onClick={() => onSetDifficultyPreference(pref)}
                className={`py-2 px-3 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                  proficiency.difficultyPreference === pref
                    ? 'bg-amber-600 text-stone-950 border-amber-400 shadow-md'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                {pref}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-stone-500 font-sans">
            {proficiency.difficultyPreference === 'Adaptive'
              ? 'Dynamically balances hint specificity and challenge parameters based on demonstrated competence.'
              : proficiency.difficultyPreference === 'Guided'
                ? 'Provides maximum contextual guidance, conceptual walkthroughs, and highlighted clues.'
                : proficiency.difficultyPreference === 'Veteran'
                  ? 'Minimal assistance; presents complex multi-parameter search targets.'
                  : 'Standard historical difficulty baseline.'}
          </p>
        </div>

        {/* 5-Domain Competence Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold text-stone-300 uppercase tracking-wider">
            Domain Competence Metrics
          </h4>

          <div className="space-y-3">
            {(Object.keys(CATEGORY_LABELS) as ProficiencyCategory[]).map((cat) => {
              const score = proficiency[cat];
              const info = CATEGORY_LABELS[cat];
              return (
                <div key={cat} className="bg-stone-950 p-3 rounded-lg border border-stone-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-stone-200">{info.label}</span>
                    <span className="text-amber-400 font-bold">{score} / 100</span>
                  </div>
                  <div className="w-full bg-stone-900 rounded-full h-2 overflow-hidden border border-stone-800">
                    <div
                      className="bg-amber-500 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-stone-500 font-sans block">{info.desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Statistics Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
          <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800">
            <span className="text-[10px] text-stone-500 block">Deductions</span>
            <span className="text-sm font-bold text-emerald-400">{proficiency.successfulDeductionsCount}</span>
          </div>
          <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800">
            <span className="text-[10px] text-stone-500 block">Verifications</span>
            <span className="text-sm font-bold text-amber-400">{proficiency.totalVerificationsCount}</span>
          </div>
          <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800">
            <span className="text-[10px] text-stone-500 block">Hints Used</span>
            <span className="text-sm font-bold text-stone-300">{proficiency.hintsUsedCount}</span>
          </div>
          <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800">
            <span className="text-[10px] text-stone-500 block">Attempts</span>
            <span className="text-sm font-bold text-stone-300">{proficiency.failedAttemptsCount}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-800">
          <button
            onClick={() => {
              if (window.confirm('Reset adaptive proficiency scores back to apprentice baseline?')) {
                onResetProficiency();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-950 hover:bg-stone-800 text-rose-400 border border-stone-800 text-xs font-mono transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Skill Scores</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-mono text-xs font-bold transition-all shadow"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
