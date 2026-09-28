import { ReflectorDefinition, ReflectorType, RotorDefinition, RotorType } from './types';

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const ALPHABET_SIZE = 26;

/**
 * Historical Rotor Wirings (German Military Enigma I / M3):
 * 
 * Rotor I:   EKMFLGDQVZNTOWYHXUSPAIBRCJ  Notch: Q (turns next rotor on step from Q to R)
 * Rotor II:  AJDKSIRUXBLHWTMCQGZNPYFVOE  Notch: E (turns next rotor on step from E to F)
 * Rotor III: BDFHJLCPRTXVZNYEIWGAKMUSQO  Notch: V (turns next rotor on step from V to W)
 * Rotor IV:  ESOVPZJAYQUIRHXLNFTGKDCMWB  Notch: J (turns next rotor on step from J to K)
 * Rotor V:   VZBRGITYUPSDNHLXAWMJQOFECK  Notch: Z (turns next rotor on step from Z to A)
 */
export const ROTOR_DEFINITIONS: Record<RotorType, RotorDefinition> = {
  I: {
    type: 'I',
    wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ',
    notch: 'Q',
    name: 'Rotor I (1930)',
  },
  II: {
    type: 'II',
    wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE',
    notch: 'E',
    name: 'Rotor II (1930)',
  },
  III: {
    type: 'III',
    wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO',
    notch: 'V',
    name: 'Rotor III (1930)',
  },
  IV: {
    type: 'IV',
    wiring: 'ESOVPZJAYQUIRHXLNFTGKDCMWB',
    notch: 'J',
    name: 'Rotor IV (Dec 1938)',
  },
  V: {
    type: 'V',
    wiring: 'VZBRGITYUPSDNHLXAWMJQOFECK',
    notch: 'Z',
    name: 'Rotor V (Dec 1938)',
  },
};

/**
 * Historical Reflectors (Umkehrwalze):
 * Reflector A: EJMZALYXVBWFCRQUHNTSOIKPOG (Pre-war)
 * Reflector B: YRUHQSLDPXNGOKMIEBFZCWVJAT (Standard Enigma I / M3)
 * Reflector C: FVPJIAOYEDRZXWGCTKUQSBNMHL (M3 alternate)
 */
export const REFLECTOR_DEFINITIONS: Record<ReflectorType, ReflectorDefinition> = {
  A: {
    type: 'A',
    wiring: 'EJMZALYXVBWFCRQUONTSPIKHGD',
    name: 'Reflector A (1937)',
  },
  B: {
    type: 'B',
    wiring: 'YRUHQSLDPXNGOKMIEBFZCWVJAT',
    name: 'Reflector B (1939 Standard)',
  },
  C: {
    type: 'C',
    wiring: 'FVPJIAOYEDRZXWGCTKUQSBNMHL',
    name: 'Reflector C (1940)',
  },
};

export const DEFAULT_ENIGMA_CONFIG = {
  rotors: [
    { type: 'I' as RotorType, position: 'A', ringSetting: 1 },
    { type: 'II' as RotorType, position: 'A', ringSetting: 1 },
    { type: 'III' as RotorType, position: 'A', ringSetting: 1 },
  ] as [
    { type: RotorType; position: string; ringSetting: number },
    { type: RotorType; position: string; ringSetting: number },
    { type: RotorType; position: string; ringSetting: number }
  ],
  reflector: 'B' as ReflectorType,
  plugboard: [] as string[],
};
