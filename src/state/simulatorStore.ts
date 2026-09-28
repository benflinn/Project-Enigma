import { create } from 'zustand';
import {
  DEFAULT_ENIGMA_CONFIG,
  EnigmaMachine,
  EnigmaMachineConfig,
  EncryptionResult,
  ReflectorType,
  RotorType,
  SteppingState,
} from '../engine/enigma';

export interface KeystrokeHistoryItem {
  id: string;
  timestamp: number;
  input: string;
  output: string;
  previousPositions: [string, string, string];
  currentPositions: [string, string, string];
  stepping: SteppingState;
}

export interface SimulatorState {
  machine: EnigmaMachine;
  config: EnigmaMachineConfig;
  currentPositions: [string, string, string];
  initialPositions: [string, string, string];
  activeKey: string | null;
  activeLamp: string | null;
  lastResult: EncryptionResult | null;
  inputText: string;
  outputText: string;
  history: KeystrokeHistoryItem[];
  showSignalPath: boolean;
  selectedCableSocket: string | null;

  // Actions
  pressKey: (char: string) => EncryptionResult | null;
  releaseKey: (char?: string) => void;
  setRotorType: (slot: 0 | 1 | 2, type: RotorType) => void;
  setRotorPosition: (slot: 0 | 1 | 2, pos: string) => void;
  stepRotorManual: (slot: 0 | 1 | 2, delta: number) => void;
  setRotorRingSetting: (slot: 0 | 1 | 2, ring: number) => void;
  setReflector: (type: ReflectorType) => void;
  addPlugboardPair: (a: string, b: string) => boolean;
  removePlugboardPair: (letter: string) => void;
  clearPlugboard: () => void;
  setPlugboardPairs: (pairs: string[]) => void;
  setSelectedCableSocket: (letter: string | null) => void;
  handleSocketClick: (letter: string) => void;
  resetToInitialState: () => void;
  setInitialPositions: (positions: [string, string, string]) => void;
  clearText: () => void;
  loadConfig: (config: EnigmaMachineConfig) => void;
  encryptBatchMessage: (text: string) => void;
  toggleSignalPath: (show?: boolean) => void;
}

const initialMachine = new EnigmaMachine(DEFAULT_ENIGMA_CONFIG);

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
  machine: initialMachine,
  config: initialMachine.getConfig(),
  currentPositions: initialMachine.getPositions(),
  initialPositions: initialMachine.getInitialPositions(),
  activeKey: null,
  activeLamp: null,
  lastResult: null,
  inputText: '',
  outputText: '',
  history: [],
  showSignalPath: true,
  selectedCableSocket: null,

  pressKey: (char: string) => {
    const clean = char.toUpperCase();
    if (clean < 'A' || clean > 'Z' || clean.length !== 1) return null;

    const { machine, inputText, outputText, history } = get();
    try {
      const result = machine.encryptChar(clean);
      const newHistoryItem: KeystrokeHistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        input: result.inputChar,
        output: result.outputChar,
        previousPositions: result.previousPositions,
        currentPositions: result.currentPositions,
        stepping: result.stepping,
      };

      set({
        activeKey: clean,
        activeLamp: result.outputChar,
        lastResult: result,
        currentPositions: result.currentPositions,
        inputText: inputText + result.inputChar,
        outputText: outputText + result.outputChar,
        history: [...history, newHistoryItem],
      });

      return result;
    } catch (e) {
      console.error('Encryption error:', e);
      return null;
    }
  },

  releaseKey: (char?: string) => {
    const { activeKey } = get();
    if (!char || (activeKey && char.toUpperCase() === activeKey)) {
      set({
        activeKey: null,
        activeLamp: null,
      });
    }
  },

  setRotorType: (slot: 0 | 1 | 2, type: RotorType) => {
    const { config, machine } = get();
    const newRotors = [...config.rotors] as [any, any, any];
    newRotors[slot] = { ...newRotors[slot], type };

    // Check distinct types: if duplicate, swap with previous occupant
    const existingIndex = config.rotors.findIndex((r, idx) => idx !== slot && r.type === type);
    if (existingIndex !== -1) {
      newRotors[existingIndex] = { ...newRotors[existingIndex], type: config.rotors[slot].type };
    }

    const newConfig: EnigmaMachineConfig = {
      ...config,
      rotors: newRotors,
    };

    machine.setConfig(newConfig);
    set({
      config: machine.getConfig(),
      currentPositions: machine.getPositions(),
      initialPositions: machine.getInitialPositions(),
    });
  },

  setRotorPosition: (slot: 0 | 1 | 2, pos: string) => {
    const { machine } = get();
    const rotors = machine.getRotors();
    rotors[slot].setPosition(pos);
    const positions = machine.getPositions();

    set({
      currentPositions: positions,
      config: machine.getConfig(),
    });
  },

  stepRotorManual: (slot: 0 | 1 | 2, delta: number) => {
    const { machine } = get();
    const rotors = machine.getRotors();
    const currentIdx = rotors[slot].getPositionIndex();
    const newIdx = (currentIdx + delta + 26) % 26;
    rotors[slot].setPosition(newIdx);

    set({
      currentPositions: machine.getPositions(),
      config: machine.getConfig(),
    });
  },

  setRotorRingSetting: (slot: 0 | 1 | 2, ring: number) => {
    const { config, machine } = get();
    const newRotors = [...config.rotors] as [any, any, any];
    newRotors[slot] = { ...newRotors[slot], ringSetting: ring };

    const newConfig: EnigmaMachineConfig = {
      ...config,
      rotors: newRotors,
    };

    machine.setConfig(newConfig);
    set({
      config: machine.getConfig(),
      currentPositions: machine.getPositions(),
      initialPositions: machine.getInitialPositions(),
    });
  },

  setReflector: (type: ReflectorType) => {
    const { config, machine } = get();
    const newConfig: EnigmaMachineConfig = {
      ...config,
      reflector: type,
    };
    machine.setConfig(newConfig);
    set({
      config: machine.getConfig(),
      currentPositions: machine.getPositions(),
      initialPositions: machine.getInitialPositions(),
    });
  },

  addPlugboardPair: (a: string, b: string) => {
    const { machine } = get();
    try {
      machine.getPlugboard().addPair(a, b);
      set({
        config: machine.getConfig(),
        selectedCableSocket: null,
      });
      return true;
    } catch (e) {
      console.warn('Cannot add plugboard pair:', e);
      return false;
    }
  },

  removePlugboardPair: (letter: string) => {
    const { machine } = get();
    machine.getPlugboard().removePair(letter);
    set({
      config: machine.getConfig(),
      selectedCableSocket: null,
    });
  },

  clearPlugboard: () => {
    const { machine } = get();
    machine.getPlugboard().reset();
    set({
      config: machine.getConfig(),
      selectedCableSocket: null,
    });
  },

  setPlugboardPairs: (pairs: string[]) => {
    const { machine } = get();
    machine.getPlugboard().setPairs(pairs);
    set({
      config: machine.getConfig(),
      selectedCableSocket: null,
    });
  },

  setSelectedCableSocket: (letter: string | null) => {
    set({ selectedCableSocket: letter ? letter.toUpperCase() : null });
  },

  handleSocketClick: (letter: string) => {
    const clean = letter.toUpperCase();
    const { machine, selectedCableSocket, addPlugboardPair, removePlugboardPair } = get();
    const plugboard = machine.getPlugboard();

    // If socket is already plugged, unplug it
    if (plugboard.isPlugged(clean)) {
      removePlugboardPair(clean);
      set({ selectedCableSocket: null });
      return;
    }

    // If no socket currently selected, select this one as socket 1
    if (!selectedCableSocket) {
      set({ selectedCableSocket: clean });
      return;
    }

    // If same socket clicked, deselect
    if (selectedCableSocket === clean) {
      set({ selectedCableSocket: null });
      return;
    }

    // Socket 2 clicked -> connect pair!
    addPlugboardPair(selectedCableSocket, clean);
  },

  resetToInitialState: () => {
    const { machine } = get();
    machine.resetToInitialPositions();
    set({
      currentPositions: machine.getPositions(),
      activeKey: null,
      activeLamp: null,
      lastResult: null,
    });
  },

  setInitialPositions: (positions: [string, string, string]) => {
    const { machine } = get();
    machine.setInitialPositions(positions);
    set({
      initialPositions: machine.getInitialPositions(),
      currentPositions: machine.getPositions(),
      config: machine.getConfig(),
    });
  },

  clearText: () => {
    set({
      inputText: '',
      outputText: '',
      history: [],
      lastResult: null,
      activeKey: null,
      activeLamp: null,
    });
  },

  loadConfig: (config: EnigmaMachineConfig) => {
    const { machine } = get();
    machine.setConfig(config);
    set({
      config: machine.getConfig(),
      currentPositions: machine.getPositions(),
      initialPositions: machine.getInitialPositions(),
      lastResult: null,
      activeKey: null,
      activeLamp: null,
      selectedCableSocket: null,
    });
  },

  encryptBatchMessage: (text: string) => {
    const { machine, inputText, outputText, history } = get();
    const cleanLetters = text.toUpperCase().replace(/[^A-Z]/g, '');
    if (!cleanLetters) return;

    let newHistory = [...history];
    let newIn = inputText;
    let newOut = outputText;
    let lastRes: EncryptionResult | null = null;

    for (const char of cleanLetters) {
      const res = machine.encryptChar(char);
      lastRes = res;
      newIn += res.inputChar;
      newOut += res.outputChar;
      newHistory.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        input: res.inputChar,
        output: res.outputChar,
        previousPositions: res.previousPositions,
        currentPositions: res.currentPositions,
        stepping: res.stepping,
      });
    }

    set({
      currentPositions: machine.getPositions(),
      inputText: newIn,
      outputText: newOut,
      history: newHistory,
      lastResult: lastRes,
    });
  },

  toggleSignalPath: (show?: boolean) => {
    set((state) => ({
      showSignalPath: typeof show === 'boolean' ? show : !state.showSignalPath,
    }));
  },
}));
