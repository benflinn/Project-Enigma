import { EnigmaMachineConfig } from '../enigma';

/**
 * Future Adaptive Difficulty System interfaces (PART 9).
 * Prepares contracts for telemetry, deduction scoring, and dynamic assistance
 * without manipulating the authentic Enigma simulation.
 */

export interface CryptanalysisTelemetryEvent {
  timestamp: number;
  missionId: string;
  eventType:
    | 'KEY_PRESSED'
    | 'HINT_REQUESTED'
    | 'OBSERVATION_CONFIRMED'
    | 'DEDUCTION_ATTEMPTED'
    | 'HYPOTHESIS_TESTED'
    | 'MACHINE_RESET'
    | 'ROTOR_CONFIGURED'
    | 'PLUGBOARD_CONFIGURED';
  payload: Record<string, any>;
}

export interface PlayerSkillProfile {
  understandingScore: number; // 0 - 100
  rotorMechanicsMastery: number; // 0 - 100
  steppingAnomalyMastery: number; // 0 - 100
  plugboardMastery: number; // 0 - 100
  deductionEfficiency: number; // 0 - 100
  consecutiveSuccesses: number;
  totalHintsRequested: number;
}

export interface AdaptiveAssistanceRules {
  maxHintsAllowed: number;
  hintCooldownSeconds: number;
  autoSuggestObservation: boolean;
  highlightSignalPathOnStepping: boolean;
}

/**
 * Worker-ready contracts for future Cryptanalysis Workstation algorithms
 * (e.g. Polish Bomba, Turing Bombe, Index of Coincidence, Fast Hill Climbing).
 */
export interface CryptanalysisWorkerJob {
  jobId: string;
  algorithm: 'INDEX_OF_COINCIDENCE' | 'CHI_SQUARE' | 'BOMBE_CRIB_DRAG' | 'HILL_CLIMB';
  ciphertext: string;
  crib?: string;
  knownSettings?: Partial<EnigmaMachineConfig>;
  searchSpace?: {
    rotors?: string[][];
    reflector?: string[];
    ringSettings?: boolean;
    steckerPairs?: number;
  };
}

export interface CryptanalysisCandidateResult {
  score: number;
  config: EnigmaMachineConfig;
  decryptedSample: string;
  iterationCount: number;
  timeElapsedMs: number;
}
