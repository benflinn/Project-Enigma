import { describe, it, expect } from 'vitest';
import {
  EnigmaMachine,
  Rotor,
  Reflector,
  Plugboard,
  normalizeInput,
  formatMilitaryGroups,
  ALPHABET,
  EnigmaMachineConfig,
} from '../engine/enigma';

describe('Enigma Cryptographic Engine', () => {
  describe('Rotor Wiring and Mechanics', () => {
    it('initializes rotors I through V with authentic historical wirings', () => {
      const rotor1 = new Rotor('I', 'A', 1);
      expect(rotor1.getType()).toBe('I');
      expect(rotor1.getNotchLetter()).toBe('Q');
      expect(rotor1.getPositionLetter()).toBe('A');

      // Forward pass test for Rotor I at pos A ring 1: 'A' (pin 0) -> 'E' (pin 4)
      const res = rotor1.forward(0);
      expect(res.outputPin).toBe(4); // E
      // Reverse pass test: 'E' (pin 4) -> 'A' (pin 0)
      const revRes = rotor1.reverse(4);
      expect(revRes.outputPin).toBe(0);
    });

    it('handles ring settings (Ringstellung) offset calculations accurately', () => {
      // Rotor I with Ring setting B (2), pos A (0):
      // Delta = (0 - 1) = -1 = 25.
      // input 0 ('A'): pinIn = (0 + 25) = 25. Wiring[25] = 'J' (9).
      // outputPin = (9 - 25) = 10 ('K').
      const rotor = new Rotor('I', 'A', 2);
      const fwd = rotor.forward(0);
      expect(fwd.outputPin).toBe(10); // 'K'

      // Reverse pass: input 10 ('K') -> should return 0 ('A')
      const rev = rotor.reverse(10);
      expect(rev.outputPin).toBe(0);
    });

    it('correctly detects turnover notch', () => {
      const rotor1 = new Rotor('I', 'Q', 1);
      expect(rotor1.isAtNotch()).toBe(true);

      rotor1.step();
      expect(rotor1.getPositionLetter()).toBe('R');
      expect(rotor1.isAtNotch()).toBe(false);

      const rotor2 = new Rotor('II', 'E', 1);
      expect(rotor2.isAtNotch()).toBe(true);

      const rotor3 = new Rotor('III', 'V', 1);
      expect(rotor3.isAtNotch()).toBe(true);
    });
  });

  describe('Reflector Behavior', () => {
    it('reflector B produces authentic pairwise reflections without fixed points', () => {
      const reflectorB = new Reflector('B');
      expect(reflectorB.getType()).toBe('B');

      for (let i = 0; i < 26; i++) {
        const out = reflectorB.forward(i).outputPin;
        // Never maps to itself
        expect(out).not.toBe(i);
        // Is symmetric (involution)
        const back = reflectorB.forward(out).outputPin;
        expect(back).toBe(i);
      }
    });

    it('reflector A and C behave symmetrically without fixed points', () => {
      ['A', 'C'].forEach((type) => {
        const ref = new Reflector(type as any);
        for (let i = 0; i < 26; i++) {
          const out = ref.forward(i).outputPin;
          expect(out).not.toBe(i);
          expect(ref.forward(out).outputPin).toBe(i);
        }
      });
    });
  });

  describe('Plugboard (Steckerbrett)', () => {
    it('swaps configured letter pairs and leaves others intact', () => {
      const pb = new Plugboard(['AB', 'CD', 'EF']);
      expect(pb.forward('A')).toBe('B');
      expect(pb.forward('B')).toBe('A');
      expect(pb.forward('C')).toBe('D');
      expect(pb.forward('D')).toBe('C');
      expect(pb.forward('E')).toBe('F');
      expect(pb.forward('F')).toBe('E');
      expect(pb.forward('G')).toBe('G');
      expect(pb.forward('Z')).toBe('Z');
    });

    it('validates against duplicate letter plugs and self-plugs', () => {
      const pb = new Plugboard(['AB']);
      expect(() => pb.addPair('A', 'C')).toThrow();
      expect(() => pb.addPair('D', 'D')).toThrow();
      expect(() => pb.addPair('X', 'B')).toThrow();
    });

    it('allows removing plug pairs', () => {
      const pb = new Plugboard(['AB', 'CD']);
      expect(pb.isPlugged('A')).toBe(true);
      pb.removePair('A');
      expect(pb.isPlugged('A')).toBe(false);
      expect(pb.isPlugged('B')).toBe(false);
      expect(pb.forward('A')).toBe('A');
      expect(pb.forward('B')).toBe('B');
      expect(pb.forward('C')).toBe('D');
    });
  });

  describe('Historical Stepping & Double-Stepping Mechanics', () => {
    it('advances fast (right) rotor on every keypress', () => {
      const enigma = new EnigmaMachine({
        rotors: [
          { type: 'I', position: 'A', ringSetting: 1 },
          { type: 'II', position: 'A', ringSetting: 1 },
          { type: 'III', position: 'A', ringSetting: 1 },
        ],
      });

      expect(enigma.getPositions()).toEqual(['A', 'A', 'A']);
      enigma.encryptChar('A');
      expect(enigma.getPositions()).toEqual(['A', 'A', 'B']);
      enigma.encryptChar('A');
      expect(enigma.getPositions()).toEqual(['A', 'A', 'C']);
    });

    it('performs authentic double-stepping of the middle rotor', () => {
      // Rotors: I (notch Q), II (notch E), III (notch V)
      // Set start position to: Left=A, Middle=D, Right=U
      const enigma = new EnigmaMachine({
        rotors: [
          { type: 'I', position: 'A', ringSetting: 1 },
          { type: 'II', position: 'D', ringSetting: 1 },
          { type: 'III', position: 'U', ringSetting: 1 },
        ],
      });

      // Press 1: Right steps U -> V. Middle and Left do not step.
      enigma.encryptChar('A');
      expect(enigma.getPositions()).toEqual(['A', 'D', 'V']);

      // Press 2: Right is at V (turnover notch).
      // Right steps V -> W. Middle steps D -> E (reaches notch!). Left does not step.
      enigma.encryptChar('A');
      expect(enigma.getPositions()).toEqual(['A', 'E', 'W']);

      // Press 3: Middle was at E (turnover notch) -> DOUBLE STEPPING!
      // Middle steps E -> F, Left steps A -> B, Right steps W -> X.
      enigma.encryptChar('A');
      expect(enigma.getPositions()).toEqual(['B', 'F', 'X']);

      // Press 4: Normal stepping again
      enigma.encryptChar('A');
      expect(enigma.getPositions()).toEqual(['B', 'F', 'Y']);
    });
  });

  describe('Independently Verified Historical Test Vectors', () => {
    it('Vector 1: Rotors I-II-III, Reflector B, Ring AAA, Pos AAA, No Plugs -> AAAAA encrypts to BDZGO', () => {
      const enigma = new EnigmaMachine({
        rotors: [
          { type: 'I', position: 'A', ringSetting: 1 },
          { type: 'II', position: 'A', ringSetting: 1 },
          { type: 'III', position: 'A', ringSetting: 1 },
        ],
        reflector: 'B',
        plugboard: [],
      });

      const result = enigma.encryptMessage('AAAAA');
      expect(result.outputText).toBe('BDZGO');
    });

    it('Vector 2: Full message encryption and reciprocal decryption with plugboard and custom rings', () => {
      const testConfig: EnigmaMachineConfig = {
        rotors: [
          { type: 'II', position: 'B', ringSetting: 2 },
          { type: 'IV', position: 'L', ringSetting: 21 },
          { type: 'V', position: 'A', ringSetting: 12 },
        ],
        reflector: 'B',
        plugboard: ['AV', 'BS', 'CG', 'DL', 'FU', 'HZ', 'IN', 'KM', 'OW', 'RX'],
      };

      const transmitter = new EnigmaMachine(testConfig);
      const plaintext = 'PROJECTENIGMASIMULATORTEST';
      const encrypted = transmitter.encryptMessage(plaintext);

      // Decrypt using a fresh machine configured identically
      const receiver = new EnigmaMachine(testConfig);
      const decrypted = receiver.encryptMessage(encrypted.outputText);

      expect(decrypted.outputText).toBe(plaintext);
    });

    it('Cryptographic Property: An Enigma machine can never encrypt a letter to itself', () => {
      const enigma = new EnigmaMachine({
        rotors: [
          { type: 'I', position: 'G', ringSetting: 5 },
          { type: 'III', position: 'W', ringSetting: 14 },
          { type: 'II', position: 'Q', ringSetting: 20 },
        ],
        reflector: 'B',
        plugboard: ['AB', 'CD', 'EF', 'GH'],
      });

      for (let i = 0; i < 100; i++) {
        const char = ALPHABET[i % 26];
        const res = enigma.encryptChar(char);
        expect(res.outputChar).not.toBe(char);
      }
    });

    it('Reset to initial positions enables exact reproduction of ciphertext', () => {
      const enigma = new EnigmaMachine({
        rotors: [
          { type: 'I', position: 'X', ringSetting: 1 },
          { type: 'II', position: 'Y', ringSetting: 1 },
          { type: 'III', position: 'Z', ringSetting: 1 },
        ],
        reflector: 'B',
        plugboard: ['PO', 'IU'],
      });

      const message = 'SECRETMESSAGE';
      const firstPass = enigma.encryptMessage(message);

      // Machine positions have moved
      expect(enigma.getPositions()).not.toEqual(['X', 'Y', 'Z']);

      // Reset
      enigma.resetToInitialPositions();
      expect(enigma.getPositions()).toEqual(['X', 'Y', 'Z']);

      const secondPass = enigma.encryptMessage(message);
      expect(secondPass.outputText).toBe(firstPass.outputText);
    });
  });

  describe('Configuration Serialization and Restoration', () => {
    it('serializes and deserializes machine state faithfully', () => {
      const original = new EnigmaMachine({
        rotors: [
          { type: 'IV', position: 'M', ringSetting: 7 },
          { type: 'I', position: 'K', ringSetting: 19 },
          { type: 'V', position: 'T', ringSetting: 3 },
        ],
        reflector: 'B',
        plugboard: ['AQ', 'BW', 'ER'],
      });

      const serialized = original.serialize();
      const restored = EnigmaMachine.fromSerialized(serialized);

      expect(restored.getConfig()).toEqual(original.getConfig());

      const plaintext = 'HELLOWORLD';
      const enc1 = original.encryptMessage(plaintext);
      const enc2 = restored.encryptMessage(plaintext);
      expect(enc2.outputText).toBe(enc1.outputText);
    });
  });

  describe('Input Normalization Utility', () => {
    it('cleans input to standard uppercase A-Z', () => {
      expect(normalizeInput('Hello, World! 123')).toBe('HELLOWORLD');
      expect(normalizeInput('äöüß', { replaceGermanLetters: true })).toBe('AEOEUESS');
    });

    it('formats output into 5-character military cipher blocks', () => {
      expect(formatMilitaryGroups('HELLOWORLDTESTING')).toBe('HELLO WORLD TESTI NG');
    });
  });
});
