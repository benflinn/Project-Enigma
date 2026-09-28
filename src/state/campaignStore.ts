import { create } from 'zustand';
import { storage, CampaignProgressRecord } from '../storage/db';
import {
  ALL_MISSIONS,
  MISSION_1,
} from '../features/campaign/campaignMissions';

export interface CampaignState {
  activeMissionId: string;
  isMissionActive: boolean;
  currentStepIndex: number;
  revealedHints: number[];
  keystrokeLog: Array<{ input: string; output: string; positions: [string, string, string] }>;
  questionAnsweredCorrectly: boolean | null;
  selectedAnswerIndex: number | null;
  hintsUsedCount: number;
  completedMissions: string[];
  completedMasteryChallenges: string[];

  // Backwards compatibility properties for v0.1 tests and views
  missionId: string;
  completed: boolean;
  isTutorialActive: boolean;

  // Actions
  selectMission: (missionId: string) => void;
  startMission: (missionId?: string) => void;
  exitMission: () => void;
  advanceStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  requestHint: () => void;
  answerQuestion: (choiceIndex: number) => boolean;
  recordKeystroke: (input: string, output: string, positions: [string, string, string]) => void;
  completeMasteryChallenge: (challengeId: string) => Promise<void>;
  loadProgress: () => Promise<void>;
  saveProgress: () => Promise<void>;
  resetAllCampaignProgress: () => Promise<void>;

  // Backwards compatibility methods
  startTutorial: () => void;
  resetTutorial: () => void;
  skipTutorial: () => void;
}

export const useCampaignStore = create<CampaignState>((set, get) => ({
  activeMissionId: MISSION_1.id,
  isMissionActive: false,
  currentStepIndex: 0,
  revealedHints: [],
  keystrokeLog: [],
  questionAnsweredCorrectly: null,
  selectedAnswerIndex: null,
  hintsUsedCount: 0,
  completedMissions: [],
  completedMasteryChallenges: [],

  // Aliases
  missionId: MISSION_1.id,
  completed: false,
  isTutorialActive: false,

  selectMission: (missionId: string) => {
    set({
      activeMissionId: missionId,
      missionId,
      currentStepIndex: 0,
      revealedHints: [],
      questionAnsweredCorrectly: null,
      selectedAnswerIndex: null,
    });
  },

  startMission: (missionId?: string) => {
    const targetId = missionId || get().activeMissionId;
    set({
      activeMissionId: targetId,
      missionId: targetId,
      isMissionActive: true,
      isTutorialActive: true,
      currentStepIndex: 0,
      revealedHints: [],
      keystrokeLog: [],
      questionAnsweredCorrectly: null,
      selectedAnswerIndex: null,
    });
    get().saveProgress();
  },

  exitMission: () => {
    set({ isMissionActive: false, isTutorialActive: false });
  },

  startTutorial: () => {
    get().startMission(MISSION_1.id);
  },

  resetTutorial: () => {
    get().startMission(MISSION_1.id);
  },

  skipTutorial: () => {
    set({
      isMissionActive: false,
      isTutorialActive: false,
      completed: true,
    });
  },

  loadProgress: async () => {
    const unlocks = await storage.getUnlockedFeatures();
    const { activeMissionId } = get();
    const progress = await storage.getCampaignProgress(activeMissionId);

    const isMissionCompleted = unlocks.completedMissions?.includes(activeMissionId) || !!progress?.completed;

    set({
      completedMissions: unlocks.completedMissions || [],
      completedMasteryChallenges: unlocks.completedMasteryChallenges || [],
      completed: isMissionCompleted,
      currentStepIndex: progress ? progress.currentStepIndex : 0,
      hintsUsedCount: progress ? progress.hintsUsedCount : 0,
    });
  },

  saveProgress: async () => {
    const {
      activeMissionId,
      currentStepIndex,
      hintsUsedCount,
      keystrokeLog,
      completedMissions,
    } = get();

    const currentMission =
      ALL_MISSIONS.find((m) => m.id === activeMissionId) || MISSION_1;
    const isCompleted = currentStepIndex >= currentMission.steps.length - 1;

    let updatedCompletedMissions = [...completedMissions];
    if (isCompleted && !updatedCompletedMissions.includes(activeMissionId)) {
      updatedCompletedMissions.push(activeMissionId);
      set({ completedMissions: updatedCompletedMissions, completed: true });
      await storage.saveUnlockedFeatures({
        completedMissions: updatedCompletedMissions,
        advancedWorkstationControls: updatedCompletedMissions.includes('mission-3-automated-breakthrough'),
      });
    }

    const record: CampaignProgressRecord = {
      missionId: activeMissionId,
      completed: isCompleted,
      completedAt: isCompleted ? new Date().toISOString() : undefined,
      currentStepIndex,
      hintsUsedCount,
      keystrokesCount: keystrokeLog.length,
      deductionsMade: ['cryptanalytic_foundation'],
    };

    await storage.saveCampaignProgress(record);
  },

  advanceStep: () => {
    const { activeMissionId, currentStepIndex } = get();
    const currentMission =
      ALL_MISSIONS.find((m) => m.id === activeMissionId) || MISSION_1;

    if (currentStepIndex < currentMission.steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      const isFinished = nextIdx === currentMission.steps.length - 1;
      set({
        currentStepIndex: nextIdx,
        revealedHints: [],
        questionAnsweredCorrectly: null,
        selectedAnswerIndex: null,
        completed: isFinished || get().completed,
      });
      get().saveProgress();
    }
  },

  prevStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({
        currentStepIndex: currentStepIndex - 1,
        revealedHints: [],
        questionAnsweredCorrectly: null,
        selectedAnswerIndex: null,
      });
    }
  },

  goToStep: (index: number) => {
    set({
      currentStepIndex: index,
      revealedHints: [],
      questionAnsweredCorrectly: null,
      selectedAnswerIndex: null,
    });
  },

  requestHint: () => {
    const { activeMissionId, currentStepIndex, revealedHints, hintsUsedCount } = get();
    const currentMission =
      ALL_MISSIONS.find((m) => m.id === activeMissionId) || MISSION_1;
    const currentStep = currentMission.steps[currentStepIndex];

    if (revealedHints.length < currentStep.hints.length) {
      const nextHintIndex = revealedHints.length;
      set({
        revealedHints: [...revealedHints, nextHintIndex],
        hintsUsedCount: hintsUsedCount + 1,
      });
      get().saveProgress();
    }
  },

  answerQuestion: (choiceIndex: number): boolean => {
    const { activeMissionId, currentStepIndex } = get();
    const currentMission =
      ALL_MISSIONS.find((m) => m.id === activeMissionId) || MISSION_1;
    const currentStep = currentMission.steps[currentStepIndex];

    if (!currentStep.question) return false;

    const isCorrect = choiceIndex === currentStep.question.correctIndex;
    set({
      questionAnsweredCorrectly: isCorrect,
      selectedAnswerIndex: choiceIndex,
    });

    if (isCorrect) {
      get().saveProgress();
    }

    return isCorrect;
  },

  recordKeystroke: (input: string, output: string, positions: [string, string, string]) => {
    const { isMissionActive, activeMissionId, currentStepIndex, keystrokeLog, advanceStep } = get();
    if (!isMissionActive) return;

    const currentMission =
      ALL_MISSIONS.find((m) => m.id === activeMissionId) || MISSION_1;
    const currentStep = currentMission.steps[currentStepIndex];
    const newLog = [...keystrokeLog, { input, output, positions }];
    set({ keystrokeLog: newLog });

    // Mission 1 Step triggers
    if (activeMissionId === MISSION_1.id) {
      if (currentStep.id === 'm1_first_key') {
        advanceStep();
      } else if (currentStep.id === 'm1_repeated_a') {
        const recentApresses = newLog.slice(-4);
        if (recentApresses.length >= 4 && recentApresses.every((k) => k.input === 'A')) {
          advanceStep();
        }
      }
    }
  },

  completeMasteryChallenge: async (challengeId: string) => {
    const { completedMasteryChallenges } = get();
    if (!completedMasteryChallenges.includes(challengeId)) {
      const updated = [...completedMasteryChallenges, challengeId];
      set({ completedMasteryChallenges: updated });
      await storage.saveUnlockedFeatures({
        completedMasteryChallenges: updated,
        advancedWorkstationControls: true, // mastery unlocks advanced tools
      });
    }
  },

  resetAllCampaignProgress: async () => {
    await storage.resetCampaignProgress();
    await storage.saveUnlockedFeatures({
      completedMissions: [],
      completedMasteryChallenges: [],
      advancedWorkstationControls: false,
    });
    set({
      completedMissions: [],
      completedMasteryChallenges: [],
      currentStepIndex: 0,
      hintsUsedCount: 0,
      isMissionActive: false,
      isTutorialActive: false,
      completed: false,
    });
  },
}));
