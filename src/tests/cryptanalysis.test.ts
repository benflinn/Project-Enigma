import { describe, it, expect } from 'vitest';
import {
  calculateIndexOfCoincidence,
  calculateChiSquared,
  calculateQuadgramScore,
  analyzeTextStatistics,
} from '../engine/cryptanalysis/statistics';
import {
  analyzeCribPlacements,
  evaluateCribOffset,
} from '../engine/cryptanalysis/cribAnalysis';
import {
  executeBoundedSearch,
  SearchBounds,
  sortCandidates,
  CandidateResult,
} from '../engine/cryptanalysis/searchEngine';
import {
  TRAINING_MESSAGES,
  getTrainingMessageById,
} from '../engine/cryptanalysis/interceptArchive';
import { EnigmaMachine } from '../engine/enigma';

describe('Statistical Analysis Engine', () => {
  const englishSample =
    'THISISANEXTENDEDENGLISHPLAINTEXTSAMPLECONTAININGCOMMONWORDSANDSTANDARDLETTERFREQUENCIES';
  const randomSample =
    'QWZXJVKFPBNMDLKJHQWERTPOIUYTRAGSDFZXCVBNMKJHGFDSAQWERTYUIOPLKJHGFDSAZXCVBNM';

  it('calculates expected Index of Coincidence for English vs. random text', () => {
    const englishIC = calculateIndexOfCoincidence(englishSample);
    const randomIC = calculateIndexOfCoincidence(randomSample);

    // English text should be significantly elevated towards ~0.066
    expect(englishIC).toBeGreaterThan(0.055);
    // Random / polyalphabetic noise should be close to ~0.038
    expect(randomIC).toBeLessThan(0.048);
  });

  it('calculates Chi-squared goodness-of-fit accurately', () => {
    const englishChi2 = calculateChiSquared(englishSample);
    const randomChi2 = calculateChiSquared(randomSample);

    // Natural English should have a much lower chi-squared error against English frequencies
    expect(englishChi2).toBeLessThan(randomChi2);
  });

  it('evaluates Quadgram likelihood scores', () => {
    const readableText = 'WEATHERREPORTATTACKATDAWN';
    const gibberishText = 'QXJVKFPBZXWQPMTRLKJZQWX';

    const readableScore = calculateQuadgramScore(readableText);
    const gibberishScore = calculateQuadgramScore(gibberishText);

    expect(readableScore).toBeGreaterThan(gibberishScore);
  });

  it('produces a comprehensive statistical summary profile', () => {
    const summary = analyzeTextStatistics(englishSample);
    expect(summary.textLength).toBe(englishSample.length);
    expect(summary.uniqueLetters).toBeGreaterThan(10);
    expect(summary.frequencies.length).toBe(26);
    expect(summary.isLikelyNaturalLanguage).toBe(true);
  });
});

describe('Crib Analysis & Self-Encryption Elimination', () => {
  const cipher = 'WETTERBERICHTNORDSEEWINDSTARKESEEACHTKLAERUNG';

  it('detects letter clash and eliminates impossible alignment', () => {
    // If cipher starts with 'W' and crib is 'WETTER', index 0 has a clash (W==W)
    const clashCipher = 'WXYZABCDEF';
    const result = evaluateCribOffset(clashCipher, 'WETTER', 0);

    expect(result.isPlausible).toBe(false);
    expect(result.clashCount).toBeGreaterThanOrEqual(1);
    expect(result.clashes[0].letter).toBe('W');
  });

  it('identifies plausible alignment when no characters collide', () => {
    const nonClashCipher = 'ABCDEF';
    const result = evaluateCribOffset(nonClashCipher, 'UVWXYZ', 0);

    expect(result.isPlausible).toBe(true);
    expect(result.clashCount).toBe(0);
  });

  it('drags crib across full ciphertext and calculates elimination percentage', () => {
    const summary = analyzeCribPlacements(cipher, 'WETTER');
    expect(summary.totalPositionsEvaluated).toBe(cipher.length - 'WETTER'.length + 1);
    expect(summary.plausibleCount).toBeGreaterThan(0);
    expect(summary.eliminatedCount).toBeGreaterThan(0);
    expect(summary.eliminationPercentage).toBeGreaterThan(0);
  });
});

describe('Training Intercept Archive & Machine Determinism', () => {
  it('contains at least 6 verified training messages across all difficulties', () => {
    expect(TRAINING_MESSAGES.length).toBeGreaterThanOrEqual(6);

    const beginner = TRAINING_MESSAGES.filter((m) => m.difficulty === 'beginner');
    const intermediate = TRAINING_MESSAGES.filter((m) => m.difficulty === 'intermediate');
    const advanced = TRAINING_MESSAGES.filter((m) => m.difficulty === 'advanced');

    expect(beginner.length).toBeGreaterThanOrEqual(2);
    expect(intermediate.length).toBeGreaterThanOrEqual(2);
    expect(advanced.length).toBeGreaterThanOrEqual(2);
  });

  it('verifies that every training message decrypts back to its known plaintext', () => {
    for (const msg of TRAINING_MESSAGES) {
      const machine = new EnigmaMachine(msg.secretConfig);
      const decrypted = machine.encryptMessage(msg.ciphertext).outputText;
      expect(decrypted).toBe(msg.plaintext);
    }
  });
});

describe('Bounded Automated Search Engine', () => {
  it('deterministically recovers known right-rotor key for Intercept Alpha', async () => {
    const msg = getTrainingMessageById('intercept-101-alpha');
    expect(msg).toBeDefined();

    const bounds: SearchBounds = {
      rotorOrders: [['I', 'II', 'III']],
      reflector: 'B',
      ringSettings: [1, 1, 1],
      plugboard: [],
      positions: {
        left: ['A'],
        middle: ['A'],
        right: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
      },
      scoringMethod: 'INDEX_OF_COINCIDENCE',
      maxCandidates: 10,
    };

    const { candidates, progress } = await executeBoundedSearch({
      sessionId: 'test-search-alpha',
      bounds,
      ciphertext: msg!.ciphertext,
    });

    expect(progress.status).toBe('COMPLETED');
    expect(progress.evaluatedCount).toBe(26);
    expect(candidates.length).toBeGreaterThan(0);

    // Candidate #1 should be position 'G', which matches the secret config
    const best = candidates[0];
    expect(best.config.rotors[2].position).toBe('G');
    expect(best.plaintext).toBe(msg!.plaintext);
  });

  it('correctly handles search cancellation', async () => {
    const bounds: SearchBounds = {
      rotorOrders: [['I', 'II', 'III']],
      reflector: 'B',
      ringSettings: [1, 1, 1],
      plugboard: [],
      positions: {
        left: ['A', 'B', 'C', 'D'],
        middle: ['A', 'B', 'C', 'D'],
        right: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
      },
      scoringMethod: 'INDEX_OF_COINCIDENCE',
    };

    const { progress } = await executeBoundedSearch({
      sessionId: 'test-cancel',
      bounds,
      ciphertext: 'HELLOWORLDTHISISATEST',
      isCancelled: () => true,
    });

    expect(progress.status).toBe('CANCELLED');
  });

  it('sorts candidates deterministically with stable tie-breaking', () => {
    const cand1: CandidateResult = {
      rank: 0,
      score: 0.065,
      rawMetric: 0.065,
      config: {
        rotors: [
          { type: 'I', position: 'A', ringSetting: 1 },
          { type: 'II', position: 'B', ringSetting: 1 },
          { type: 'III', position: 'C', ringSetting: 1 },
        ],
        reflector: 'B',
        plugboard: [],
      },
      plaintext: 'SAMPLEONE',
    };

    const cand2: CandidateResult = {
      rank: 0,
      score: 0.075,
      rawMetric: 0.075,
      config: {
        rotors: [
          { type: 'I', position: 'A', ringSetting: 1 },
          { type: 'II', position: 'A', ringSetting: 1 },
          { type: 'III', position: 'A', ringSetting: 1 },
        ],
        reflector: 'B',
        plugboard: [],
      },
      plaintext: 'SAMPLETWO',
    };

    const sorted = sortCandidates([cand1, cand2], 10);
    expect(sorted[0].rank).toBe(1);
    expect(sorted[0].score).toBe(0.075);
    expect(sorted[1].rank).toBe(2);
    expect(sorted[1].score).toBe(0.065);
  });
});
