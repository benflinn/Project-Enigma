import React, { useState, useEffect } from 'react';
import { useCampaignStore } from '../../state/campaignStore';
import {
  ALL_MISSIONS,
  MASTERY_CHALLENGES,
  MasteryChallenge,
  MISSION_1,
} from './campaignMissions';
import { EnigmaMachineView } from '../simulator/EnigmaMachineView';
import { CribTestingPanel } from '../workstation/CribTestingPanel';
import { AutomatedSearchPanel } from '../workstation/AutomatedSearchPanel';
import { ResultsPanel } from '../workstation/ResultsPanel';
import { getTrainingMessageById } from '../../engine/cryptanalysis/interceptArchive';
import { useWorkstationStore } from '../../state/workstationStore';
import {
  BookOpen,
  Award,
  CheckCircle2,
  Play,
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  Sparkles,
  Check,
  X,
  Target,
} from 'lucide-react';

export const CampaignView: React.FC = () => {
  const {
    activeMissionId,
    isMissionActive,
    currentStepIndex,
    revealedHints,
    questionAnsweredCorrectly,
    selectedAnswerIndex,
    completedMissions,
    completedMasteryChallenges,
    selectMission,
    startMission,
    exitMission,
    advanceStep,
    prevStep,
    goToStep,
    requestHint,
    answerQuestion,
    completeMasteryChallenge,
    loadProgress,
  } = useCampaignStore();

  const workstation = useWorkstationStore();

  const [activeMasteryModal, setActiveMasteryModal] = useState<MasteryChallenge | null>(null);
  const [masterySelection, setMasterySelection] = useState<number | null>(null);
  const [masteryResult, setMasteryResult] = useState<boolean | null>(null);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const currentMission =
    ALL_MISSIONS.find((m) => m.id === activeMissionId) || MISSION_1;
  const currentStep = currentMission.steps[currentStepIndex] || currentMission.steps[0];
  const isLastStep = currentStepIndex === currentMission.steps.length - 1;

  const handleMasterySubmit = () => {
    if (!activeMasteryModal || masterySelection === null) return;
    const isCorrect = masterySelection === activeMasteryModal.correctIndex;
    setMasteryResult(isCorrect);
    if (isCorrect) {
      completeMasteryChallenge(activeMasteryModal.id);
    }
  };

  // If in active mission, render Mission Runner
  if (isMissionActive) {
    const trainingMsg = currentMission.interceptId
      ? getTrainingMessageById(currentMission.interceptId)
      : null;

    return (
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        {/* Mission Runner Header */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={exitMission}
              className="p-2 rounded-xl bg-stone-950 border border-stone-800 hover:border-stone-700 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
              title="Return to Campaign Hub"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-600/50 font-bold">
                  Mission {currentMission.number} of {ALL_MISSIONS.length}
                </span>
                <span className="text-xs font-mono text-stone-400">
                  {currentMission.difficulty} • ~{currentMission.estimatedMinutes} mins
                </span>
              </div>
              <h2 className="font-cinzel text-xl font-bold text-stone-100 mt-0.5">
                {currentMission.title}
              </h2>
            </div>
          </div>

          {/* Step Progress Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {currentMission.steps.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => goToStep(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center ${
                  idx === currentStepIndex
                    ? 'bg-amber-600 text-stone-950 shadow-md ring-2 ring-amber-500/50'
                    : idx < currentStepIndex
                      ? 'bg-stone-800 text-stone-300'
                      : 'bg-stone-950 border border-stone-800 text-stone-600'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Step Guide & Discovery Panel */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-stone-800">
            <div>
              <h3 className="font-cinzel text-lg font-bold text-stone-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>{currentStep.title}</span>
              </h3>
              <p className="text-sm font-mono text-stone-300 mt-1.5 leading-relaxed">
                {currentStep.instruction}
              </p>
            </div>

            {/* Hint Trigger Button */}
            {currentStep.hints.length > 0 && (
              <button
                onClick={requestHint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-600/40 text-amber-300 hover:bg-amber-950 text-xs font-mono font-bold transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Need a Hint ({revealedHints.length}/{currentStep.hints.length})
                </span>
              </button>
            )}
          </div>

          {/* Explanation Box */}
          {currentStep.explanation && (
            <div className="bg-stone-950/80 rounded-xl p-4 border border-stone-800/80 text-xs font-mono text-stone-300 leading-relaxed space-y-1">
              <strong className="text-amber-400 block font-bold">Cryptanalytic Briefing:</strong>
              <p>{currentStep.explanation}</p>
            </div>
          )}

          {/* Progressive Hint Drawer */}
          {revealedHints.length > 0 && (
            <div className="space-y-2">
              {revealedHints.map((hintIdx) => (
                <div
                  key={hintIdx}
                  className="bg-amber-950/20 border border-amber-800/50 rounded-xl p-3.5 text-xs font-mono text-amber-200 flex items-start gap-2.5"
                >
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-400 font-bold mr-1">Hint #{hintIdx + 1}:</strong>
                    <span>{currentStep.hints[hintIdx]}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Interactive Multiple Choice Deduction Prompt */}
          {currentStep.question && (
            <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-3 font-mono text-xs">
              <div className="font-bold text-stone-200 text-sm">
                {currentStep.question.prompt}
              </div>

              <div className="space-y-2">
                {currentStep.question.choices.map((choice, idx) => {
                  const isSelected = selectedAnswerIndex === idx;

                  let style =
                    'bg-stone-900 border-stone-800 text-stone-300 hover:border-amber-600/50';
                  if (isSelected) {
                    if (questionAnsweredCorrectly) {
                      style = 'bg-emerald-950 border-emerald-500 text-emerald-200 font-bold';
                    } else {
                      style = 'bg-red-950 border-red-500 text-red-200 font-bold';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => answerQuestion(idx)}
                      className={`w-full p-3 rounded-lg border text-left transition-all cursor-pointer ${style}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-stone-950 border border-stone-700 flex items-center justify-center text-[10px] font-bold">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{choice}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {questionAnsweredCorrectly !== null && (
                <div
                  className={`p-3 rounded-lg border text-xs font-mono flex items-start gap-2 ${
                    questionAnsweredCorrectly
                      ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-200'
                      : 'bg-red-950/40 border-red-600/50 text-red-200'
                  }`}
                >
                  {questionAnsweredCorrectly ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <strong className="font-bold block">
                      {questionAnsweredCorrectly ? 'Deduction Confirmed!' : 'Incorrect Deduction'}
                    </strong>
                    <span>{currentStep.question.explanation}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-stone-800">
            <button
              onClick={prevStep}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 disabled:opacity-40 text-xs font-mono transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Step</span>
            </button>

            {isLastStep ? (
              <button
                onClick={exitMission}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-mono font-bold text-xs shadow-lg transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Mission & Return to Hub</span>
              </button>
            ) : (
              <button
                onClick={advanceStep}
                disabled={currentStep.question ? !questionAnsweredCorrectly : false}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-mono font-bold text-xs shadow-lg transition-colors disabled:opacity-40 cursor-pointer"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Mission-specific Interactive Workbench */}
        {currentMission.id === 'mission-1-first-message' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-stone-400 px-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Hands-On Simulation Workspace</span>
            </div>
            <EnigmaMachineView />
          </div>
        )}

        {currentMission.id === 'mission-2-finding-a-clue' && trainingMsg && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-stone-400 px-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Crib-Testing Interactive Workspace (Biscay Submarine Intercept)</span>
            </div>
            <CribTestingPanel
              ciphertext={trainingMsg.ciphertext}
              initialCrib="WETTERBERICHT"
            />
          </div>
        )}

        {currentMission.id === 'mission-3-automated-breakthrough' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-stone-400 px-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Automated Bounded Solver (Station Alpha Intercept)</span>
            </div>
            <AutomatedSearchPanel
              bounds={workstation.searchBounds}
              isSearching={workstation.isSearching}
              progress={workstation.searchProgress}
              controlMode="basic"
              onUpdateBounds={workstation.updateSearchBounds}
              onStartSearch={workstation.startSearch}
              onCancelSearch={workstation.cancelSearch}
            />
            {workstation.candidateResults.length > 0 && (
              <ResultsPanel
                candidates={workstation.candidateResults}
                selectedCandidate={workstation.selectedCandidate}
                onSelectCandidate={workstation.selectCandidate}
                onTransferToSimulator={workstation.transferCandidateToSimulator}
                onSaveToNotebook={(title, notes, cand) => {
                  workstation.saveToNotebook(title, notes, cand.config, cand.score, cand.plaintext);
                }}
              />
            )}
          </div>
        )}
      </div>
    );
  }

  // Otherwise, render Campaign Hub View
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Campaign Hub Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-600/50 text-amber-400 text-xs font-mono mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            Bletchley Park Training Campaign
          </div>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-stone-100">
            Cryptanalysis Operations Hub
          </h1>
          <p className="text-stone-400 font-mono text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
            Step into Hut 6 and master the mathematical weaknesses of the Wehrmacht Enigma machine through hands-on historical investigations.
          </p>
        </div>

        {/* Campaign Progress Summary Card */}
        <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex flex-col gap-2 min-w-[220px]">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-stone-400">Missions Solved:</span>
            <span className="text-amber-400 font-bold">
              {completedMissions.length} / {ALL_MISSIONS.length}
            </span>
          </div>
          <div className="w-full h-2 bg-stone-900 rounded-full overflow-hidden">
            <div
              style={{
                width: `${(completedMissions.length / ALL_MISSIONS.length) * 100}%`,
              }}
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-stone-500 pt-1">
            <span>Mastery Medals:</span>
            <span className="text-amber-400 font-bold">
              {completedMasteryChallenges.length} / {MASTERY_CHALLENGES.length}
            </span>
          </div>
        </div>
      </div>

      {/* Storyline Missions Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-stone-300 font-cinzel font-bold text-lg">
          <Target className="w-5 h-5 text-amber-400" />
          <h2>Main Training Operations</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ALL_MISSIONS.map((mission) => {
            const isCompleted = completedMissions.includes(mission.id);

            return (
              <div
                key={mission.id}
                className={`rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 ${
                  isCompleted
                    ? 'bg-stone-900/90 border-emerald-900/50 shadow-lg'
                    : 'bg-stone-900 border-stone-800 hover:border-amber-600/40'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                      Operation {mission.number}
                    </span>
                    {isCompleted && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-600/50 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-cinzel text-base font-bold text-stone-100">
                      {mission.title}
                    </h3>
                    <p className="text-[11px] font-mono text-amber-400/80 mt-0.5">
                      {mission.subtitle}
                    </p>
                  </div>

                  <p className="text-xs font-mono text-stone-400 leading-relaxed">
                    {mission.description}
                  </p>

                  <div className="pt-2 border-t border-stone-800 text-[11px] font-mono text-stone-400 space-y-1">
                    <div>
                      Difficulty: <strong className="text-stone-200">{mission.difficulty}</strong> • ~{mission.estimatedMinutes} mins
                    </div>
                    {mission.unlockedReward && (
                      <div className="text-amber-400/90 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>Unlocks: {mission.unlockedReward}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-800">
                  <button
                    onClick={() => {
                      selectMission(mission.id);
                      startMission(mission.id);
                    }}
                    className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isCompleted
                        ? 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                        : 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-md shadow-amber-950/40'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isCompleted ? 'Replay Mission' : 'Launch Operation'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Optional Mastery Challenges Section */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-stone-300 font-cinzel font-bold text-lg">
            <Award className="w-5 h-5 text-amber-400" />
            <h2>Optional Mastery Challenges (Unlock Advanced Workstation Early)</h2>
          </div>
          <span className="text-xs font-mono text-stone-400">
            Assesses practical cryptographic understanding
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MASTERY_CHALLENGES.map((ch) => {
            const isCompleted = completedMasteryChallenges.includes(ch.id);

            return (
              <div
                key={ch.id}
                className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                      {ch.concept}
                    </span>
                    {isCompleted && (
                      <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Solved
                      </span>
                    )}
                  </div>
                  <h4 className="font-cinzel font-bold text-sm text-stone-100">
                    {ch.title}
                  </h4>
                  <p className="text-xs font-mono text-stone-400 line-clamp-3">
                    {ch.prompt}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setActiveMasteryModal(ch);
                    setMasterySelection(null);
                    setMasteryResult(null);
                  }}
                  className={`w-full py-2 rounded-lg font-mono text-xs font-bold transition-colors cursor-pointer ${
                    isCompleted
                      ? 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                      : 'bg-amber-950/80 border border-amber-600/50 text-amber-300 hover:bg-amber-900/60'
                  }`}
                >
                  {isCompleted ? 'Review Challenge' : 'Take Challenge'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mastery Challenge Modal */}
      {activeMasteryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase text-amber-400 font-bold">
                  {activeMasteryModal.concept}
                </span>
                <h3 className="font-cinzel text-base font-bold text-stone-100 mt-0.5">
                  {activeMasteryModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveMasteryModal(null)}
                className="p-1 rounded text-stone-400 hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-stone-200 leading-relaxed font-semibold">
              {activeMasteryModal.prompt}
            </p>

            <div className="space-y-2">
              {activeMasteryModal.choices.map((choice, idx) => {
                const isSelected = masterySelection === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setMasterySelection(idx)}
                    className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/80 border-amber-500 text-amber-200 font-bold'
                        : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-stone-900 border border-stone-700 flex items-center justify-center text-[10px]">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{choice}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {masteryResult !== null && (
              <div
                className={`p-3 rounded-lg border flex items-start gap-2 ${
                  masteryResult
                    ? 'bg-emerald-950/40 border-emerald-600 text-emerald-200'
                    : 'bg-red-950/40 border-red-600 text-red-200'
                }`}
              >
                {masteryResult ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <strong className="block font-bold">
                    {masteryResult ? 'Mastery Confirmed!' : 'Incorrect Answer'}
                  </strong>
                  <span>{activeMasteryModal.explanation}</span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveMasteryModal(null)}
                className="px-4 py-2 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700"
              >
                Close
              </button>
              <button
                onClick={handleMasterySubmit}
                disabled={masterySelection === null}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold disabled:opacity-40 shadow"
              >
                Submit Deduction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
