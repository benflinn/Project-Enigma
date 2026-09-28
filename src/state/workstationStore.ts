import { create } from 'zustand';
import {
  TRAINING_MESSAGES,
  InterceptTrainingMessage,
  getTrainingMessageById,
} from '../engine/cryptanalysis/interceptArchive';
import {
  SearchBounds,
  CandidateResult,
  SearchProgress,
} from '../engine/cryptanalysis/searchEngine';
import { SearchClient } from '../engine/cryptanalysis/searchClient';
import {
  storage,
  NotebookEntryRecord,
  UnlockedFeaturesRecord,
} from '../storage/db';
import { EnigmaMachineConfig, RotorType, ReflectorType } from '../engine/enigma';
import { useSimulatorStore } from './simulatorStore';

export type WorkstationTab = 'archive' | 'statistics' | 'crib' | 'search' | 'results' | 'notebook';

export interface WorkstationState {
  selectedMessageId: string;
  controlMode: 'basic' | 'advanced';
  activeTab: WorkstationTab;
  cribInput: string;
  selectedCribOffset: number | null;
  searchBounds: SearchBounds;
  searchProgress: SearchProgress | null;
  candidateResults: CandidateResult[];
  selectedCandidate: CandidateResult | null;
  notebookEntries: NotebookEntryRecord[];
  unlockedFeatures: UnlockedFeaturesRecord;
  isSearching: boolean;

  // Actions
  selectMessage: (id: string) => void;
  setControlMode: (mode: 'basic' | 'advanced') => void;
  setActiveTab: (tab: WorkstationTab) => void;
  setCribInput: (crib: string) => void;
  setSelectedCribOffset: (offset: number | null) => void;
  updateSearchBounds: (bounds: Partial<SearchBounds>) => void;
  startSearch: () => void;
  cancelSearch: () => void;
  selectCandidate: (candidate: CandidateResult | null) => void;
  saveToNotebook: (
    title: string,
    notes: string,
    config: EnigmaMachineConfig,
    score?: number,
    plaintext?: string
  ) => Promise<void>;
  deleteNotebookEntry: (id: string) => Promise<void>;
  loadNotebook: () => Promise<void>;
  loadUnlocks: () => Promise<void>;
  setUnlockedFeatures: (unlocks: Partial<UnlockedFeaturesRecord>) => Promise<void>;
  transferCandidateToSimulator: (candidate: CandidateResult) => void;
  transferConfigToSimulator: (config: EnigmaMachineConfig, text?: string) => void;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function buildDefaultBoundsForMessage(msg: InterceptTrainingMessage): SearchBounds {
  const knowns = msg.playerKnowns;
  const rotorOrders: Array<[RotorType, RotorType, RotorType]> = knowns.rotorOrderKnown && knowns.knownRotorOrder
    ? [knowns.knownRotorOrder]
    : knowns.possibleRotorTypes && knowns.possibleRotorTypes.length >= 3
      ? generatePermutations(knowns.possibleRotorTypes)
      : [['I', 'II', 'III']];

  const posKnowns = knowns.knownPositions || [null, null, null];
  const leftRange = posKnowns[0] ? [posKnowns[0]] : ALPHABET;
  const middleRange = posKnowns[1] ? [posKnowns[1]] : ALPHABET;
  const rightRange = posKnowns[2] ? [posKnowns[2]] : ALPHABET;

  const defaultCrib = knowns.suspectedCribs?.[0];

  return {
    rotorOrders,
    reflector: (knowns.knownReflector || 'B') as ReflectorType,
    ringSettings: knowns.knownRingSettings || [1, 1, 1],
    plugboard: knowns.knownPlugboard || [],
    positions: {
      left: leftRange,
      middle: middleRange,
      right: rightRange,
    },
    scoringMethod: defaultCrib ? 'CRIB_MATCH' : 'INDEX_OF_COINCIDENCE',
    crib: defaultCrib ? { text: defaultCrib.text, offset: defaultCrib.suggestedOffset ?? 0 } : undefined,
    maxCandidates: 25,
  };
}

function generatePermutations(types: RotorType[]): Array<[RotorType, RotorType, RotorType]> {
  const perms: Array<[RotorType, RotorType, RotorType]> = [];
  for (let i = 0; i < types.length; i++) {
    for (let j = 0; j < types.length; j++) {
      if (j === i) continue;
      for (let k = 0; k < types.length; k++) {
        if (k === i || k === j) continue;
        perms.push([types[i], types[j], types[k]]);
      }
    }
  }
  return perms.length > 0 ? perms : [['I', 'II', 'III']];
}

const searchClientInstance = new SearchClient();

export const useWorkstationStore = create<WorkstationState>((set, get) => ({
  selectedMessageId: TRAINING_MESSAGES[0].id,
  controlMode: 'basic',
  activeTab: 'archive',
  cribInput: TRAINING_MESSAGES[0].playerKnowns.suspectedCribs?.[0]?.text || 'WEATHER',
  selectedCribOffset: 0,
  searchBounds: buildDefaultBoundsForMessage(TRAINING_MESSAGES[0]),
  searchProgress: null,
  candidateResults: [],
  selectedCandidate: null,
  notebookEntries: [],
  isSearching: false,
  unlockedFeatures: {
    id: 'unlocks',
    advancedWorkstationControls: false,
    cribAnalysisUnlocked: true,
    automatedSearchUnlocked: true,
    statisticalToolsUnlocked: true,
    completedMissions: [],
    completedMasteryChallenges: [],
  },

  selectMessage: (id: string) => {
    const msg = getTrainingMessageById(id);
    if (!msg) return;

    const defaultCrib = msg.playerKnowns.suspectedCribs?.[0]?.text || '';
    set({
      selectedMessageId: id,
      cribInput: defaultCrib,
      selectedCribOffset: 0,
      searchBounds: buildDefaultBoundsForMessage(msg),
      candidateResults: [],
      selectedCandidate: null,
      searchProgress: null,
    });
  },

  setControlMode: (mode: 'basic' | 'advanced') => set({ controlMode: mode }),
  setActiveTab: (tab: WorkstationTab) => set({ activeTab: tab }),
  setCribInput: (crib: string) => set({ cribInput: crib }),
  setSelectedCribOffset: (offset: number | null) => set({ selectedCribOffset: offset }),

  updateSearchBounds: (partial: Partial<SearchBounds>) => {
    set((state) => ({
      searchBounds: {
        ...state.searchBounds,
        ...partial,
      },
    }));
  },

  startSearch: () => {
    const state = get();
    const msg = getTrainingMessageById(state.selectedMessageId);
    if (!msg) return;

    // Make sure previous search is cancelled if running
    searchClientInstance.cancelSearch();

    set({
      isSearching: true,
      activeTab: 'results',
      candidateResults: [],
      selectedCandidate: null,
      searchProgress: {
        sessionId: '',
        evaluatedCount: 0,
        totalCount: 0,
        percentComplete: 0,
        elapsedMs: 0,
        configsPerSecond: 0,
        currentBestScore: -Infinity,
        currentBestCandidate: null,
        scoreHistory: [],
        status: 'RUNNING',
      },
    });

    const bounds: SearchBounds = {
      ...state.searchBounds,
      crib: state.cribInput
        ? {
            text: state.cribInput,
            offset: state.selectedCribOffset ?? 0,
          }
        : undefined,
    };

    searchClientInstance.startSearch(bounds, msg.ciphertext, {
      onProgress: (progress) => {
        set({ searchProgress: progress });
      },
      onCompleted: (candidates, progress) => {
        set({
          isSearching: false,
          candidateResults: candidates,
          selectedCandidate: candidates[0] || null,
          searchProgress: progress,
        });
      },
      onCancelled: (progress) => {
        set({
          isSearching: false,
          searchProgress: progress,
        });
      },
      onError: (error) => {
        set((s) => ({
          isSearching: false,
          searchProgress: s.searchProgress
            ? { ...s.searchProgress, status: 'ERROR', errorMessage: error }
            : null,
        }));
      },
    });
  },

  cancelSearch: () => {
    searchClientInstance.cancelSearch();
    set({ isSearching: false });
  },

  selectCandidate: (candidate: CandidateResult | null) => set({ selectedCandidate: candidate }),

  saveToNotebook: async (title, notes, config, score, plaintext) => {
    const entry: NotebookEntryRecord = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      messageId: get().selectedMessageId,
      title,
      notes,
      config,
      candidateScore: score,
      decryptedPlaintext: plaintext,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await storage.saveNotebookEntry(entry);
    await get().loadNotebook();
  },

  deleteNotebookEntry: async (id: string) => {
    await storage.deleteNotebookEntry(id);
    await get().loadNotebook();
  },

  loadNotebook: async () => {
    const entries = await storage.getNotebookEntries();
    set({ notebookEntries: entries });
  },

  loadUnlocks: async () => {
    const unlocks = await storage.getUnlockedFeatures();
    set({ unlockedFeatures: unlocks });
  },

  setUnlockedFeatures: async (unlocks: Partial<UnlockedFeaturesRecord>) => {
    await storage.saveUnlockedFeatures(unlocks);
    const updated = await storage.getUnlockedFeatures();
    set({ unlockedFeatures: updated });
  },

  transferCandidateToSimulator: (candidate: CandidateResult) => {
    const msg = getTrainingMessageById(get().selectedMessageId);
    get().transferConfigToSimulator(candidate.config, msg?.ciphertext);
  },

  transferConfigToSimulator: (config: EnigmaMachineConfig, text?: string) => {
    const simStore = useSimulatorStore.getState();
    simStore.loadConfig(config);
    if (text) {
      simStore.encryptBatchMessage(text);
    }
  },
}));
