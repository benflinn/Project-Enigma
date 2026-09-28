import React, { useEffect, useState } from 'react';
import { useCampaignStore, TUTORIAL_STEPS } from '../../state/campaignStore';
import { EnigmaKeyboard } from '../simulator/EnigmaKeyboard';
import { Lampboard } from '../simulator/Lampboard';
import { RotorAssembly } from '../simulator/RotorAssembly';
import { TextTape } from '../simulator/TextTape';
import { ControlPanel } from '../simulator/ControlPanel';
import {
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Award,
  Lightbulb,
} from 'lucide-react';

export const TutorialMissionView: React.FC = () => {
  const {
    currentStepIndex,
    completed,
    revealedHints,
    startTutorial,
    loadProgress,
    advanceStep,
    prevStep,
    goToStep,
    requestHint,
    answerQuestion,
    resetTutorial,
  } = useCampaignStore();

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  useEffect(() => {
    loadProgress();
    startTutorial();
  }, [loadProgress, startTutorial]);

  const currentStep = TUTORIAL_STEPS[currentStepIndex];
  const totalSteps = TUTORIAL_STEPS.length;
  const progressPercent = Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  const handleAnswerSubmit = (index: number) => {
    setSelectedAnswer(index);
    answerQuestion(index);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Campaign Mission Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
              Training Campaign • Operation 01
            </span>
          </div>
          <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-stone-100 mt-1">
            Your First Encrypted Message
          </h1>
          <p className="text-xs text-stone-400 font-mono mt-1">
            Objective: Discover how Enigma transforms letters and shifts internal circuits with every keystroke.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {completed && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-950/80 border border-green-600/50 rounded-full text-green-300 text-xs font-mono font-bold">
              <Award className="w-4 h-4 text-green-400" />
              Recruit Certified
            </div>
          )}

          <button
            onClick={resetTutorial}
            className="flex items-center gap-1 text-xs text-stone-400 hover:text-amber-400 font-mono transition-colors"
            title="Reset training progress from step 1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restart Tutorial
          </button>
        </div>
      </div>

      {/* Step Progress Tracker */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-4 shadow-md">
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <span className="text-stone-300 font-bold">
            Step {currentStepIndex + 1} of {totalSteps}: <span className="text-amber-400">{currentStep.title}</span>
          </span>
          <span className="text-stone-400">{progressPercent}% Completed</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-950 rounded-full h-2 overflow-hidden border border-stone-800">
          <div
            className="bg-gradient-to-r from-amber-600 to-amber-400 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Steps Bubbles */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 mt-3">
          {TUTORIAL_STEPS.map((step, idx) => {
            const isDone = idx < currentStepIndex || completed;
            const isCurrent = idx === currentStepIndex;

            return (
              <button
                key={step.id}
                onClick={() => goToStep(idx)}
                className={`
                  p-1.5 rounded text-[11px] font-mono flex flex-col items-center justify-center transition-all border
                  ${
                    isCurrent
                      ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold'
                      : isDone
                      ? 'bg-stone-950 border-stone-700 text-stone-300 hover:border-amber-600/60'
                      : 'bg-stone-950/40 border-stone-800/60 text-stone-600 cursor-not-allowed'
                  }
                `}
              >
                <span>#{idx + 1}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Step Instruction Card */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-950 border-2 border-amber-600/40 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-amber-500 font-mono font-bold">
              Active Objective
            </span>
            <h2 className="font-cinzel text-lg font-bold text-amber-300">
              {currentStep.title}
            </h2>
          </div>

          {/* Hint Trigger */}
          {currentStep.hints.length > 0 && (
            <button
              onClick={requestHint}
              disabled={revealedHints.length >= currentStep.hints.length}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
                revealedHints.length >= currentStep.hints.length
                  ? 'bg-stone-800 text-stone-500 border-stone-700 cursor-default'
                  : 'bg-amber-950/50 hover:bg-amber-900/60 border-amber-700/60 text-amber-300'
              }`}
            >
              <Lightbulb className="w-4 h-4 text-amber-400" />
              {revealedHints.length === 0
                ? 'Need a Hint?'
                : revealedHints.length < currentStep.hints.length
                ? `Next Hint (${revealedHints.length}/${currentStep.hints.length})`
                : 'All Hints Revealed'}
            </button>
          )}
        </div>

        {/* Primary Instruction Text */}
        <p className="text-sm sm:text-base text-stone-100 font-medium leading-relaxed">
          {currentStep.instruction}
        </p>

        {/* Historical Explanation if present */}
        {currentStep.explanation && (
          <div className="p-3 bg-stone-950/80 border border-stone-800 rounded-lg text-xs text-stone-300 space-y-1 font-mono">
            <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px] block">
              Cryptanalysis Insight:
            </span>
            <p className="leading-relaxed">{currentStep.explanation}</p>
          </div>
        )}

        {/* Revealed Hints List */}
        {revealedHints.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-stone-800">
            {revealedHints.map((hintIdx) => (
              <div
                key={hintIdx}
                className="p-2.5 bg-amber-950/30 border border-amber-700/40 rounded text-xs text-amber-200 font-mono flex items-start gap-2"
              >
                <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Hint #{hintIdx + 1}:</strong> {currentStep.hints[hintIdx]}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Step-specific Interactive Prompts */}
        {currentStep.targetAction === 'ANSWER_QUESTION' && (
          <div className="space-y-3 pt-2">
            <p className="text-xs text-stone-300 font-mono">Select your deduction:</p>
            <div className="grid grid-cols-1 gap-2">
              {[
                'The output changed on every keystroke (e.g., B, D, Z, G, O)',
                'The output letter remained identical every time',
                'The letter "A" encrypted directly into "A"',
              ].map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSubmit(idx)}
                  className={`p-3 rounded-lg text-left text-xs font-mono border transition-all flex items-center justify-between ${
                    selectedAnswer === idx
                      ? idx === 0
                        ? 'bg-green-950/80 border-green-500 text-green-200'
                        : 'bg-red-950/80 border-red-500 text-red-200'
                      : 'bg-stone-950 border-stone-800 hover:border-stone-700 text-stone-200'
                  }`}
                >
                  <span>{option}</span>
                  {selectedAnswer === idx && (
                    <span>{idx === 0 ? '✓ Correct' : '✗ Incorrect (Look at output tape)'}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step Navigation Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-800">
          <button
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className={`flex items-center gap-1 text-xs font-mono px-3 py-1.5 rounded border transition-colors ${
              currentStepIndex === 0
                ? 'opacity-40 cursor-not-allowed border-stone-800 text-stone-600'
                : 'border-stone-700 hover:bg-stone-800 text-stone-300'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {currentStepIndex < totalSteps - 1 ? (
              <button
                onClick={advanceStep}
                className="flex items-center gap-1 text-xs font-mono font-bold px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-stone-950 transition-colors shadow"
              >
                Next Step
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => goToStep(0)}
                className="flex items-center gap-1 text-xs font-mono font-bold px-4 py-1.5 rounded bg-green-600 hover:bg-green-500 text-stone-950 transition-colors shadow"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Review Tutorial
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Machine Controls */}
      <ControlPanel />

      {/* Message Tape */}
      <TextTape />

      {/* Interactive Machine Cabinet */}
      <div className="enigma-cabinet rounded-2xl p-4 sm:p-6 border-4 border-stone-800/80 shadow-2xl space-y-6">
        <RotorAssembly />
        <Lampboard />
        <EnigmaKeyboard />
      </div>
    </div>
  );
};
