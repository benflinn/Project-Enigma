import { create } from 'zustand';
import { storage, CampaignProgressRecord } from '../storage/db';

export interface TutorialStep {
  id: string;
  title: string;
  instruction: string;
  explanation?: string;
  hints: string[];
  targetAction?: 'PRESS_ANY_KEY' | 'PRESS_A_REPEATEDLY' | 'ANSWER_QUESTION' | 'RESET_MACHINE' | 'COMPLETE';
  requiredKeystrokes?: number;
  highlightedElement?: 'keyboard' | 'rotors' | 'lampboard' | 'plugboard' | 'reset-btn' | 'output-tape';
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'intro',
    title: 'Mission Briefing: Your First Encrypted Message',
    instruction: 'Welcome to Bletchley Park. Before we can break enemy ciphers, you must understand how the military Enigma machine operates. Begin by inspecting the machine.',
    explanation: 'The German military Enigma I is an electromechanical cipher machine with three rotating wheels (rotors), a reflector, a lampboard, and a plugboard.',
    hints: [
      'Click "Begin Tutorial" to start your hands-on investigation.',
    ],
  },
  {
    id: 'first_key',
    title: 'Step 1: The Initial Contact',
    instruction: 'Press ANY letter on the keyboard below.',
    targetAction: 'PRESS_ANY_KEY',
    highlightedElement: 'keyboard',
    hints: [
      'Click on any key on the virtual keyboard, or press a letter on your physical keyboard.',
      'For example, press the letter "A".',
    ],
  },
  {
    id: 'observe_lamp_and_rotor',
    title: 'Step 2: Dual Reaction',
    instruction: 'Notice two simultaneous events: a lamp illuminated on the lampboard, AND the right rotor stepped forward by one letter.',
    explanation: 'Every time an operator presses a key, mechanical pawls advance the rightmost rotor BEFORE electrical current passes through the rotor maze to light up the encrypted letter.',
    highlightedElement: 'rotors',
    hints: [
      'Look at the rotor windows above the keyboard to see the position letter.',
      'Click "Continue" when you are ready to test repeated inputs.',
    ],
  },
  {
    id: 'repeated_a',
    title: 'Step 3: The Uniform Input Test',
    instruction: 'Now, press the letter "A" repeatedly 4 times.',
    targetAction: 'PRESS_A_REPEATEDLY',
    requiredKeystrokes: 4,
    highlightedElement: 'keyboard',
    hints: [
      'Type "A" four times on your keyboard.',
      'Watch both the illuminated lamps and the right rotor advancing on each keystroke.',
    ],
  },
  {
    id: 'discovery_question',
    title: 'Step 4: Cryptanalytic Deduction',
    instruction: 'Examine your output tape above. When you pressed "A" repeatedly, what happened to the output?',
    targetAction: 'ANSWER_QUESTION',
    highlightedElement: 'output-tape',
    hints: [
      'Look at the sequence of letters generated on the output display.',
      'Did "A" always encrypt to the exact same letter, or did the output change?',
    ],
  },
  {
    id: 'explanation_polyalphabetic',
    title: 'Step 5: The Polyalphabetic Principle',
    instruction: 'Review the mathematical explanation of Enigma.',
    explanation: 'Unlike a simple monoalphabetic substitution cipher (where "A" always becomes "X"), Enigma is a polyalphabetic substitution cipher. Because the rotor advances on each stroke, the internal electrical circuit is completely different for every single character. Furthermore, because of the Reflector (Umkehrwalze), a letter can NEVER encrypt to itself!',
    hints: [
      'Read through the discovery notes, then proceed to test the reciprocal decryption property.',
    ],
  },
  {
    id: 'reciprocal_test',
    title: 'Step 6: Symmetrical Encryption & Decryption',
    instruction: 'Enigma is reciprocal: if you reset the machine to its starting state and type the ciphertext, you get your original message back! Click "Reset Machine to Initial State".',
    targetAction: 'RESET_MACHINE',
    highlightedElement: 'reset-btn',
    hints: [
      'Click the "Reset to Start" button on the control panel to return rotors to their starting positions.',
    ],
  },
  {
    id: 'completed',
    title: 'Mission Complete: Recruit Decryption Specialist',
    instruction: 'Congratulations! You have mastered the fundamental mechanics of the Enigma cipher machine.',
    explanation: 'You now know that Enigma: 1. Advances rotors on every keystroke. 2. Produces a polyalphabetic ciphertext. 3. Never encrypts a letter to itself. 4. Is reciprocal for identical initial settings.',
    targetAction: 'COMPLETE',
    hints: [
      'You are now ready to explore the unrestricted Enigma Simulator or test custom plugboard configurations!',
    ],
  },
];

export interface CampaignState {
  missionId: string;
  isTutorialActive: boolean;
  currentStepIndex: number;
  completed: boolean;
  revealedHints: number[];
  keystrokeLog: Array<{ input: string; output: string; positions: [string, string, string] }>;
  questionAnsweredCorrectly: boolean | null;
  startTime: number;
  hintsUsedCount: number;

  // Actions
  startTutorial: () => void;
  loadProgress: () => Promise<void>;
  saveProgress: () => Promise<void>;
  recordKeystroke: (input: string, output: string, positions: [string, string, string]) => void;
  advanceStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  requestHint: () => void;
  answerQuestion: (choiceIndex: number) => boolean;
  resetTutorial: () => void;
  skipTutorial: () => void;
}

export const useCampaignStore = create<CampaignState>((set, get) => ({
  missionId: 'mission-1-first-message',
  isTutorialActive: false,
  currentStepIndex: 0,
  completed: false,
  revealedHints: [],
  keystrokeLog: [],
  questionAnsweredCorrectly: null,
  startTime: Date.now(),
  hintsUsedCount: 0,

  startTutorial: () => {
    set({
      isTutorialActive: true,
      currentStepIndex: 0,
      revealedHints: [],
      keystrokeLog: [],
      questionAnsweredCorrectly: null,
      startTime: Date.now(),
    });
  },

  loadProgress: async () => {
    const { missionId } = get();
    const progress = await storage.getCampaignProgress(missionId);
    if (progress) {
      set({
        completed: progress.completed,
        currentStepIndex: progress.completed ? TUTORIAL_STEPS.length - 1 : progress.currentStepIndex,
        hintsUsedCount: progress.hintsUsedCount,
      });
    }
  },

  saveProgress: async () => {
    const { missionId, completed, currentStepIndex, hintsUsedCount, keystrokeLog } = get();
    const record: CampaignProgressRecord = {
      missionId,
      completed,
      completedAt: completed ? new Date().toISOString() : undefined,
      currentStepIndex,
      hintsUsedCount,
      keystrokesCount: keystrokeLog.length,
      deductionsMade: ['polyalphabetic_advancement', 'non_self_encryption'],
    };
    await storage.saveCampaignProgress(record);
  },

  recordKeystroke: (input: string, output: string, positions: [string, string, string]) => {
    const { isTutorialActive, currentStepIndex, keystrokeLog, advanceStep, saveProgress } = get();
    if (!isTutorialActive) return;

    const currentStep = TUTORIAL_STEPS[currentStepIndex];
    const newLog = [...keystrokeLog, { input, output, positions }];
    set({ keystrokeLog: newLog });

    // Step 1 check: Any key pressed
    if (currentStep.id === 'first_key') {
      advanceStep();
    }
    // Step 3 check: 'A' pressed 4 times
    else if (currentStep.id === 'repeated_a') {
      const recentApresses = newLog.slice(-4);
      if (recentApresses.length >= 4 && recentApresses.every((k) => k.input === 'A')) {
        advanceStep();
      }
    }

    saveProgress();
  },

  advanceStep: () => {
    const { currentStepIndex, saveProgress } = get();
    if (currentStepIndex < TUTORIAL_STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1;
      const isLast = nextIdx === TUTORIAL_STEPS.length - 1;
      set({
        currentStepIndex: nextIdx,
        revealedHints: [],
        completed: isLast ? true : get().completed,
      });
      saveProgress();
    }
  },

  prevStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({
        currentStepIndex: currentStepIndex - 1,
        revealedHints: [],
      });
    }
  },

  goToStep: (index: number) => {
    if (index >= 0 && index < TUTORIAL_STEPS.length) {
      set({
        currentStepIndex: index,
        revealedHints: [],
      });
    }
  },

  requestHint: () => {
    const { currentStepIndex, revealedHints, hintsUsedCount, saveProgress } = get();
    const currentStep = TUTORIAL_STEPS[currentStepIndex];
    if (revealedHints.length < currentStep.hints.length) {
      set({
        revealedHints: [...revealedHints, revealedHints.length],
        hintsUsedCount: hintsUsedCount + 1,
      });
      saveProgress();
    }
  },

  answerQuestion: (choiceIndex: number) => {
    // 0 = "The output letter was different each time" (CORRECT)
    // 1 = "The output letter remained the same"
    // 2 = "The letter encrypted to itself"
    const isCorrect = choiceIndex === 0;
    set({ questionAnsweredCorrectly: isCorrect });
    if (isCorrect) {
      get().advanceStep();
    }
    return isCorrect;
  },

  resetTutorial: () => {
    set({
      currentStepIndex: 0,
      completed: false,
      revealedHints: [],
      keystrokeLog: [],
      questionAnsweredCorrectly: null,
      startTime: Date.now(),
      hintsUsedCount: 0,
    });
    get().saveProgress();
  },

  skipTutorial: () => {
    set({
      isTutorialActive: false,
    });
  },
}));
