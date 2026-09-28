import { describe, it, expect, beforeEach } from 'vitest';
import {
  executePlugboardHillClimbing,
  generatePlugboardNeighbor,
  isValidPlugboard,
  canonicalizePlugboard,
  getAvailableLetters,
  SeededPRNG,
} from '../engine/cryptanalysis/hillClimbing';
import {
  estimateSearchCost,
  sortCandidates,
  SearchBounds,
} from '../engine/cryptanalysis/searchEngine';
import {
  partitionSearchBounds,
} from '../engine/cryptanalysis/searchClient';
import {
  DEFAULT_PROFICIENCY,
  updateProficiency,
  generateContextualAssistance,
  generateAdaptiveChallenge,
  computeMasteryLevel,
} from '../engine/cryptanalysis/adaptiveIntelligence';
import {
  calculateCandidateConfidence,
} from '../engine/cryptanalysis/statistics';
import { EnigmaMachine, EnigmaMachineConfig } from '../engine/enigma';
import { storage } from '../storage/db';
import { getTrainingMessageById } from '../engine/cryptanalysis/interceptArchive';

describe('Version 0.3 Cryptanalysis Optimization & Adaptive Engine', () => {
  beforeEach(async () => {
    await storage.resetAllData();
  });

  describe('Plugboard Hill Climbing & Neighborhood Operators', () => {
    it('validates strictly reciprocal and disjoint plugboard pairs', () => {
      expect(isValidPlugboard(['AV', 'BS', 'DL'])).toBe(true);
      expect(isValidPlugboard([])).toBe(true);

      // Invalid: duplicate letter
      expect(isValidPlugboard(['AV', 'AB'])).toBe(false);
      // Invalid: self-steckered
      expect(isValidPlugboard(['AA'])).toBe(false);
      // Invalid: non-pair length
      expect(isValidPlugboard(['A'])).toBe(false);
    });

    it('canonicalizes plugboard pairs in alphabetical order', () => {
      expect(canonicalizePlugboard(['VA', 'SB'])).toEqual(['AV', 'BS']);
    });

    it('identifies available unsteckered letters accurately', () => {
      const avail = getAvailableLetters(['AV', 'BS']);
      expect(avail.length).toBe(22);
      expect(avail).not.toContain('A');
      expect(avail).not.toContain('V');
      expect(avail).not.toContain('B');
      expect(avail).not.toContain('S');
      expect(avail).toContain('C');
    });

    it('generates valid neighbor plugboard mutations using Mulberry32 PRNG', () => {
      const prng = new SeededPRNG(42);
      const fixedSet = new Set(['AV']);
      const initial = ['AV', 'BS'];

      for (let i = 0; i < 20; i++) {
        const neighbor = generatePlugboardNeighbor(initial, fixedSet, 6, prng);
        expect(isValidPlugboard(neighbor)).toBe(true);
        expect(neighbor).toContain('AV'); // fixed pair preserved
      }
    });

    it('reproducibly recovers unknown stecker pairs using bounded hill climbing', () => {
      const msg = getTrainingMessageById('intercept-401-golf')!;
      expect(msg).toBeDefined();

      // Known: Rotors II-IV-V, pos E-N-I, Reflector B, fixed plugboard 'AV'
      // Unknown target steckers: BS, DL, FU
      const baseConfig: EnigmaMachineConfig = {
        rotors: [
          { type: 'II', position: 'E', ringSetting: 1 },
          { type: 'IV', position: 'N', ringSetting: 1 },
          { type: 'V', position: 'I', ringSetting: 1 },
        ],
        reflector: 'B',
        plugboard: ['AV'],
      };

      const result = executePlugboardHillClimbing({
        baseConfig,
        ciphertext: msg.ciphertext,
        scoringMethod: 'CRIB_MATCH',
        crib: { text: 'SUBMARINES', offset: 0 },
        maxRestarts: 5,
        maxIterationsPerRestart: 50,
        maxSteckerPairs: 4,
        fixedPlugboardPairs: ['AV'],
        randomSeed: 12345,
      });

      expect(result.totalEvaluations).toBeGreaterThan(0);
      expect(result.restartsHistory.length).toBeGreaterThan(0);

      // Verify discovered configuration decrypts to the expected plaintext
      const machine = new EnigmaMachine(result.bestConfig);
      const decrypted = machine.encryptMessage(msg.ciphertext).outputText;
      expect(decrypted).toBe(msg.plaintext);
    });
  });

  describe('Search Strategy & Workload Estimation', () => {
    it('estimates search costs and flags excessive budgets accurately', () => {
      const smallBounds: SearchBounds = {
        strategy: 'EXHAUSTIVE',
        rotorOrders: [['I', 'II', 'III']],
        reflector: 'B',
        ringSettings: [1, 1, 1],
        plugboard: [],
        positions: {
          left: ['A'],
          middle: ['A'],
          right: ['A', 'B', 'C', 'D'],
        },
        scoringMethod: 'QUADGRAM',
      };
      const smallEstimate = estimateSearchCost(smallBounds);
      expect(smallEstimate.totalCombinations).toBe(4);
      expect(smallEstimate.isExcessive).toBe(false);

      const hugeBounds: SearchBounds = {
        strategy: 'HYBRID',
        rotorOrders: [['I', 'II', 'III'], ['II', 'I', 'III']],
        reflector: 'B',
        ringSettings: [1, 1, 1],
        plugboard: [],
        positions: {
          left: ['A', 'B', 'C', 'D', 'E'],
          middle: ['A', 'B', 'C', 'D', 'E'],
          right: ['A', 'B', 'C', 'D', 'E'],
        },
        scoringMethod: 'QUADGRAM',
        hillClimbing: {
          maxRestarts: 5,
          maxIterationsPerRestart: 100,
        },
      };
      const hugeEstimate = estimateSearchCost(hugeBounds);
      expect(hugeEstimate.totalCombinations).toBe(2 * 125 * 500); // 125,000
      expect(hugeEstimate.isExcessive).toBe(true);
      expect(hugeEstimate.warningMessage).toBeDefined();
    });

    it('partitions search bounds cleanly across a worker pool', () => {
      const bounds: SearchBounds = {
        strategy: 'EXHAUSTIVE',
        rotorOrders: [['I', 'II', 'III'], ['II', 'I', 'III'], ['III', 'I', 'II'], ['IV', 'II', 'V']],
        reflector: 'B',
        ringSettings: [1, 1, 1],
        plugboard: [],
        positions: { left: ['A'], middle: ['A'], right: ['A'] },
        scoringMethod: 'QUADGRAM',
      };

      const partitions = partitionSearchBounds(bounds, 2);
      expect(partitions.length).toBe(2);
      expect(partitions[0].rotorOrders.length).toBe(2);
      expect(partitions[1].rotorOrders.length).toBe(2);
    });

    it('calculates candidate confidence based on score separation', () => {
      const confDefinitive = calculateCandidateConfidence(-2.8, -4.5, 'QUADGRAM');
      expect(confDefinitive.rating).toBe('Definitive');

      const confModerate = calculateCandidateConfidence(-3.2, -3.22, 'QUADGRAM');
      expect(confModerate.rating).toBe('Moderate');

      const sorted = sortCandidates(
        [
          {
            rank: 0,
            score: -2.7,
            rawMetric: -2.7,
            config: { rotors: [{ type: 'I', position: 'A', ringSetting: 1 }, { type: 'II', position: 'A', ringSetting: 1 }, { type: 'III', position: 'A', ringSetting: 1 }], reflector: 'B', plugboard: [] },
            plaintext: 'WEATHERREPORT',
          },
          {
            rank: 0,
            score: -4.5,
            rawMetric: -4.5,
            config: { rotors: [{ type: 'I', position: 'A', ringSetting: 1 }, { type: 'II', position: 'A', ringSetting: 1 }, { type: 'III', position: 'B', ringSetting: 1 }], reflector: 'B', plugboard: [] },
            plaintext: 'XKZQPRTMBNV',
          },
        ],
        10,
        'QUADGRAM'
      );

      expect(sorted[0].rank).toBe(1);
      expect(sorted[0].confidence?.rating).toBe('Definitive');
    });
  });

  describe('Adaptive Intelligence & Proficiency Engine', () => {
    it('updates proficiency scores deterministically with bounded margins', () => {
      const initial = DEFAULT_PROFICIENCY;
      const updatedSuccess = updateProficiency(initial, 'cribAnalysis', 'SUCCESS', 'Crib clash identified');
      expect(updatedSuccess.cribAnalysis).toBe(initial.cribAnalysis + 8);
      expect(updatedSuccess.successfulDeductionsCount).toBe(1);

      const updatedFailure = updateProficiency(updatedSuccess, 'statisticalInterpretation', 'FAILURE', 'Incorrect guess');
      expect(updatedFailure.statisticalInterpretation).toBe(initial.statisticalInterpretation - 3);
      expect(updatedFailure.failedAttemptsCount).toBe(1);
    });

    it('computes mastery level transitions correctly', () => {
      expect(computeMasteryLevel(20)).toBe('Apprentice');
      expect(computeMasteryLevel(50)).toBe('Codebreaker');
      expect(computeMasteryLevel(75)).toBe('Senior Analyst');
      expect(computeMasteryLevel(92)).toBe('Bletchley Master');
    });

    it('generates contextual assistance when conditions are triggered', () => {
      const adviceClash = generateContextualAssistance({
        selectedCrib: 'BERLIN',
        cribClashes: 2,
      });
      expect(adviceClash).not.toBeNull();
      expect(adviceClash?.id).toBe('crib-clash-advice');

      const adviceBudget = generateContextualAssistance({
        totalSearchSpace: 50000,
        activeStrategy: 'EXHAUSTIVE',
      });
      expect(adviceBudget).not.toBeNull();
      expect(adviceBudget?.id).toBe('search-space-warning');
    });

    it('generates cryptographically solvable procedural challenges', () => {
      const challenge = generateAdaptiveChallenge(DEFAULT_PROFICIENCY, 999);
      expect(challenge.ciphertext).toBeDefined();
      expect(challenge.plaintext).toBeDefined();

      const machine = new EnigmaMachine(challenge.targetConfig);
      const testDecrypted = machine.encryptMessage(challenge.ciphertext).outputText;
      expect(testDecrypted).toBe(challenge.plaintext);
    });
  });

  describe('Storage Schema v3 & Persistence', () => {
    it('persists and retrieves adaptive proficiency profiles', async () => {
      const customProf = {
        ...DEFAULT_PROFICIENCY,
        overallScore: 78,
        masteryLevel: computeMasteryLevel(78),
      };

      await storage.saveProficiency(customProf);
      const retrieved = await storage.getProficiency();
      expect(retrieved.overallScore).toBe(78);
      expect(retrieved.masteryLevel).toBe('Senior Analyst');
    });

    it('persists and restores saved search presets', async () => {
      const record = {
        id: 'test-search-1',
        title: 'Wolfpack Attack Plan',
        ciphertext: 'ABCD',
        bounds: {
          strategy: 'HILL_CLIMBING' as const,
          rotorOrders: [['I', 'II', 'III'] as [any, any, any]],
          reflector: 'B' as const,
          ringSettings: [1, 1, 1] as [number, number, number],
          plugboard: ['AV'],
          positions: { left: ['A'], middle: ['A'], right: ['A'] },
          scoringMethod: 'QUADGRAM' as const,
        },
        createdAt: new Date().toISOString(),
      };

      await storage.saveSearchRecord(record);
      const saved = await storage.getSavedSearches();
      expect(saved.length).toBe(1);
      expect(saved[0].title).toBe('Wolfpack Attack Plan');
    });
  });
});
