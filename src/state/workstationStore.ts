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
  SavedSearchRecord,
} from '../storage/db';
import {
  PlayerProficiencyRecord,
  DEFAULT_PROFICIENCY,
  updateProficiency,
  ProficiencyCategory,
  DifficultyPreference,
} from '../engine/cryptanalysis/adaptiveIntelligence';
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
  comparedCandidates: [CandidateResult | null, CandidateResult | null];
  notebookEntries: NotebookEntryRecord[];
  savedSearches: SavedSearchRecord[];
  unlockedFeatures: UnlockedFeaturesRecord;
  proficiency: PlayerProficiencyRecord;
  workerConcurrency: number;
  isSearching: boolean;

  // Actions
  selectMessage: (id: string) => void;
  setControlMode: (mode: 'basic' | 'advanced') => void;
  setActiveTab: (tab: WorkstationTab) => void;
  setCribInput: (crib: string) => void;
  setSelectedCribOffset: (offset: number | null) => void;
  updateSearchBounds: (bounds: Partial<SearchBounds>) => void;
  setWorkerConcurrency: (concurrency: number) => void;
  startSearch: () => void;
  cancelSearch: () => void;
  selectCandidate: (candidate: CandidateResult | null) => void;
  setComparedCandidates: (c1: CandidateResult | null, c2: CandidateResult | null) => void;
  saveToNotebook: (
    title: string,
    notes: string,
    config: EnigmaMachineConfig,
    score?: number,
    plaintext?: string,
    tags?: string[]
  ) => Promise<void>;
  deleteNotebookEntry: (id: string) => Promise<void>;
  saveCurrentSearchPreset: (title: string) => Promise<void>;
  deleteSavedSearchPreset: (id: string) => Promise<void>;
  restoreSavedSearch: (record: SavedSearchRecord) => void;
  loadNotebook: () => Promise<void>;
  loadUnlocks: () => Promise<void>;
  loadProficiency: () => Promise<void>;
  loadSavedSearches: () => Promise<void>;
  recordProficiencyEvent: (
    category: ProficiencyCategory,
    outcome: 'SUCCESS' | 'FAILURE' | 'HINT_USED' | 'EXPERIMENT',
    description: string
  ) => Promise<void>;
  setDifficultyPreference: (preference: DifficultyPreference) => Promise<void>;
  resetProficiency: () => Promise<void>;
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
    strategy: 'EXHAUSTIVE',
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
    language: 'ENGLISH',
    crib: defaultCrib ? { text: defaultCrib.text, offset: defaultCrib.suggestedOffset ?? 0 } : undefined,
    maxCandidates: 25,
    hillClimbing: {
      maxRestarts: 6,
      maxIterationsPerRestart: 80,
      maxSteckerPairs: 6,
      fixedPlugboardPairs: knowns.knownPlugboard || [],
      randomSeed: 42,
    },
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
  cribInput: TRAINING_MESSAGES[0].playerKnowns.suspectedCribs?.[0]?.text || '',
  selectedCribOffset: null,
  searchBounds: buildDefaultBoundsForMessage(TRAINING_MESSAGES[0]),
  searchProgress: null,
  candidateResults: [],
  selectedCandidate: null,
  comparedCandidates: [null, null],
  notebookEntries: [],
  savedSearches: [],
  unlockedFeatures: {
    id: 'unlocks',
    advancedWorkstationControls: false,
    cribAnalysisUnlocked: true,
    automatedSearchUnlocked: true,
    statisticalToolsUnlocked: true,
    hillClimbingUnlocked: true,
    hybridSearchUnlocked: true,
    completedMissions: [],
    completedMasteryChallenges: [],
  },
  proficiency: DEFAULT_PROFICIENCY,
  workerConcurrency: 2,
  isSearching: false,

  selectMessage: (id: string) => {
    const msg = getTrainingMessageById(id);
    if (!msg) return;

    const bounds = buildDefaultBoundsForMessage(msg);
    const crib = msg.playerKnowns.suspectedCribs?.[0]?.text || '';

    set({
      selectedMessageId: id,
      searchBounds: bounds,
      cribInput: crib,
      selectedCribOffset: null,
      selectedCandidate: null,
      candidateResults: [],
      searchProgress: null,
    });
  },

  setControlMode: (mode: 'basic' | 'advanced') => {
    set({ controlMode: mode });
  },

  setActiveTab: (tab: WorkstationTab) => {
    set({ activeTab: tab });
  },

  setCribInput: (crib: string) => {
    set({ cribInput: crib.toUpperCase() });
  },

  setSelectedCribOffset: (offset: number | null) => {
    set({ selectedCribOffset: offset });
  },

  updateSearchBounds: (boundsUpdate: Partial<SearchBounds>) => {
    const { searchBounds } = get();
    set({
      searchBounds: {
        ...searchBounds,
        ...boundsUpdate,
      },
    });
  },

  setWorkerConcurrency: (concurrency: number) => {
    searchClientInstance.setConcurrency(concurrency);
    set({ workerConcurrency: searchClientInstance.getConcurrency() });
  },

  startSearch: () => {
    const { selectedMessageId, searchBounds, isSearching } = get();
    if (isSearching) return;

    const msg = getTrainingMessageById(selectedMessageId);
    if (!msg) return;

    set({
      isSearching: true,
      candidateResults: [],
      selectedCandidate: null,
      searchProgress: {
        sessionId: 'init',
        strategy: searchBounds.strategy ?? 'EXHAUSTIVE',
        evaluatedCount: 0,
        totalCount: 1,
        percentComplete: 0,
        elapsedMs: 0,
        configsPerSecond: 0,
        currentBestScore: -Infinity,
        currentBestCandidate: null,
        scoreHistory: [],
        status: 'RUNNING',
      },
    });

    searchClientInstance.startSearch(searchBounds, msg.ciphertext, {
      onProgress: (progress) => {
        set({ searchProgress: progress });
      },
      onCompleted: (candidates, progress) => {
        set({
          candidateResults: candidates,
          selectedCandidate: candidates[0] || null,
          searchProgress: progress,
          isSearching: false,
        });
        get().recordProficiencyEvent(
          'searchStrategy',
          'SUCCESS',
          `Executed ${searchBounds.strategy || 'Exhaustive'} search on ${msg.title}`
        );
      },
      onCancelled: (progress) => {
        set({
          searchProgress: progress,
          isSearching: false,
        });
      },
      onError: (error) => {
        console.error('Search error:', error);
        set({
          isSearching: false,
          searchProgress: {
            sessionId: 'err',
            strategy: searchBounds.strategy ?? 'EXHAUSTIVE',
            evaluatedCount: 0,
            totalCount: 1,
            percentComplete: 0,
            elapsedMs: 0,
            configsPerSecond: 0,
            currentBestScore: -Infinity,
            currentBestCandidate: null,
            scoreHistory: [],
            status: 'ERROR',
            errorMessage: error,
          },
        });
      },
    });
  },

  cancelSearch: () => {
    searchClientInstance.cancelSearch();
    set({ isSearching: false });
  },

  selectCandidate: (candidate: CandidateResult | null) => {
    set({ selectedCandidate: candidate });
  },

  setComparedCandidates: (c1: CandidateResult | null, c2: CandidateResult | null) => {
    set({ comparedCandidates: [c1, c2] });
  },

  saveToNotebook: async (
    title: string,
    notes: string,
    config: EnigmaMachineConfig,
    score?: number,
    plaintext?: string,
    tags?: string[]
  ) => {
    const { selectedMessageId } = get();
    const entry: NotebookEntryRecord = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      messageId: selectedMessageId,
      title,
      notes,
      config,
      candidateScore: score,
      decryptedPlaintext: plaintext,
      tags: tags || ['Hypothesis'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await storage.saveNotebookEntry(entry);
    await get().loadNotebook();
    await get().recordProficiencyEvent('configurationVerification', 'EXPERIMENT', `Recorded hypothesis: "${title}"`);
  },

  deleteNotebookEntry: async (id: string) => {
    await storage.deleteNotebookEntry(id);
    await get().loadNotebook();
  },

  saveCurrentSearchPreset: async (title: string) => {
    const { selectedMessageId, searchBounds } = get();
    const msg = getTrainingMessageById(selectedMessageId);
    if (!msg) return;

    const record: SavedSearchRecord = {
      id: `search-preset-${Date.now()}`,
      title,
      ciphertext: msg.ciphertext,
      bounds: searchBounds,
      createdAt: new Date().toISOString(),
    };
    await storage.saveSearchRecord(record);
    await get().loadSavedSearches();
  },

  deleteSavedSearchPreset: async (id: string) => {
    await storage.deleteSavedSearch(id);
    await get().loadSavedSearches();
  },

  restoreSavedSearch: (record: SavedSearchRecord) => {
    set({
      searchBounds: { ...record.bounds },
    });
  },

  loadNotebook: async () => {
    const entries = await storage.getNotebookEntries();
    set({ notebookEntries: entries });
  },

  loadSavedSearches: async () => {
    const saved = await storage.getSavedSearches();
    set({ savedSearches: saved });
  },

  loadUnlocks: async () => {
    const unlocks = await storage.getUnlockedFeatures();
    set({ unlockedFeatures: unlocks });
  },

  loadProficiency: async () => {
    const prof = await storage.getProficiency();
    set({ proficiency: prof });
  },

  recordProficiencyEvent: async (
    category: ProficiencyCategory,
    outcome: 'SUCCESS' | 'FAILURE' | 'HINT_USED' | 'EXPERIMENT',
    description: string
  ) => {
    const { proficiency } = get();
    const updated = updateProficiency(proficiency, category, outcome, description);
    set({ proficiency: updated });
    await storage.saveProficiency(updated);
  },

  setDifficultyPreference: async (preference: DifficultyPreference) => {
    const { proficiency } = get();
    const updated = { ...proficiency, difficultyPreference: preference };
    set({ proficiency: updated });
    await storage.saveProficiency(updated);
  },

  resetProficiency: async () => {
    await storage.resetProficiency();
    set({ proficiency: DEFAULT_PROFICIENCY });
  },

  setUnlockedFeatures: async (unlocks: Partial<UnlockedFeaturesRecord>) => {
    await storage.saveUnlockedFeatures(unlocks);
    await get().loadUnlocks();
  },

  transferCandidateToSimulator: (candidate: CandidateResult) => {
    const { selectedMessageId } = get();
    const msg = getTrainingMessageById(selectedMessageId);
    get().transferConfigToSimulator(candidate.config, msg?.ciphertext);
  },

  transferConfigToSimulator: (config: EnigmaMachineConfig, text?: string) => {
    const simStore = useSimulatorStore.getState();
    simStore.loadConfig(config);
    simStore.clearText();
    if (text) {
      simStore.encryptBatchMessage(text);
    }
  },
}));
