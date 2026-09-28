export type RotorType = 'I' | 'II' | 'III' | 'IV' | 'V';

export type ReflectorType = 'A' | 'B' | 'C';

export type RotorPosition = 'left' | 'middle' | 'right';

export interface RotorDefinition {
  type: RotorType;
  wiring: string;
  notch: string; // The turnover notch letter (e.g., 'Q' for Rotor I)
  name: string;
}

export interface ReflectorDefinition {
  type: ReflectorType;
  wiring: string;
  name: string;
}

export interface EnigmaRotorConfig {
  type: RotorType;
  position: string; // 'A' - 'Z'
  ringSetting: number; // 1 - 26 (historically 1-based, 1 = 'A')
}

export interface EnigmaMachineConfig {
  rotors: [EnigmaRotorConfig, EnigmaRotorConfig, EnigmaRotorConfig]; // [Left, Middle, Right]
  reflector: ReflectorType;
  plugboard: string[]; // e.g. ["AB", "CD", "EF"]
}

export interface SignalPathStep {
  stage:
    | 'KEYBOARD'
    | 'PLUGBOARD_IN'
    | 'ETW_IN'
    | 'ROTOR_RIGHT_FWD'
    | 'ROTOR_MID_FWD'
    | 'ROTOR_LEFT_FWD'
    | 'REFLECTOR'
    | 'ROTOR_LEFT_REV'
    | 'ROTOR_MID_REV'
    | 'ROTOR_RIGHT_REV'
    | 'ETW_OUT'
    | 'PLUGBOARD_OUT'
    | 'LAMPBOARD';
  name: string;
  inputChar: string;
  outputChar: string;
  inputPin?: number;
  outputPin?: number;
  rotorType?: RotorType;
  rotorPosition?: string;
  ringSetting?: number;
  description: string;
}

export interface SteppingState {
  leftStepped: boolean;
  middleStepped: boolean;
  rightStepped: boolean;
}

export interface EncryptionResult {
  inputChar: string;
  outputChar: string;
  previousPositions: [string, string, string]; // [Left, Middle, Right]
  currentPositions: [string, string, string];  // [Left, Middle, Right] after stepping
  stepping: SteppingState;
  signalPath: SignalPathStep[];
}

export interface MessageEncryptionResult {
  inputText: string;
  outputText: string;
  charResults: EncryptionResult[];
  initialPositions: [string, string, string];
  finalPositions: [string, string, string];
}

export interface SerializedEnigmaConfig {
  version: number;
  rotors: {
    left: { type: RotorType; ringSetting: number; position: string };
    middle: { type: RotorType; ringSetting: number; position: string };
    right: { type: RotorType; ringSetting: number; position: string };
  };
  reflector: ReflectorType;
  plugboard: string[]; // ["AB", "CD"]
}
