/**
 * Statistical Analysis Engine for Cryptanalysis.
 * Provides letter frequency analysis, Index of Coincidence (IoC),
 * Chi-squared goodness-of-fit, and N-gram scoring models.
 *
 * Implemented as pure, deterministic functions independent of UI frameworks.
 */

export interface LetterFrequency {
  letter: string;
  count: number;
  observedPercentage: number;
  expectedPercentage: number;
  difference: number;
}

export interface StatisticalSummary {
  textLength: number;
  uniqueLetters: number;
  indexOfCoincidence: number;
  normalizedIC: number; // IC * 26 (1.0 = uniform random, ~1.73 = English)
  chiSquared: number;
  quadgramScore?: number;
  isLikelyNaturalLanguage: boolean;
  frequencies: LetterFrequency[];
}

// Standard English letter frequencies (percentages summing to 100)
export const ENGLISH_LETTER_FREQUENCIES: Record<string, number> = {
  A: 8.167,
  B: 1.492,
  C: 2.782,
  D: 4.253,
  E: 12.702,
  F: 2.228,
  G: 2.015,
  H: 6.094,
  I: 6.966,
  J: 0.153,
  K: 0.772,
  L: 4.025,
  M: 2.406,
  N: 6.749,
  O: 7.507,
  P: 1.929,
  Q: 0.095,
  R: 5.987,
  S: 6.327,
  T: 9.056,
  U: 2.758,
  V: 0.978,
  W: 2.360,
  X: 0.150,
  Y: 1.974,
  Z: 0.074,
};

// Standard German letter frequencies for future multi-lingual support
export const GERMAN_LETTER_FREQUENCIES: Record<string, number> = {
  A: 6.51,
  B: 1.89,
  C: 3.06,
  D: 5.08,
  E: 17.40,
  F: 1.66,
  G: 3.01,
  H: 4.76,
  I: 7.55,
  J: 0.27,
  K: 1.21,
  L: 3.44,
  M: 2.53,
  N: 9.78,
  O: 2.51,
  P: 0.79,
  Q: 0.02,
  R: 7.00,
  S: 7.27,
  T: 6.15,
  U: 4.35,
  V: 0.67,
  W: 1.89,
  X: 0.03,
  Y: 0.04,
  Z: 1.13,
};

// Theoretical IC reference values
export const IC_REFERENCE = {
  UNIFORM_RANDOM: 1 / 26, // ~0.03846
  ENGLISH: 0.0667,
  GERMAN: 0.0762,
  FRENCH: 0.0778,
};

// High-frequency English quadgrams (log10 probabilities for fast candidate scoring)
// Normalized floor for unseen quadgrams is -10.0
export const COMMON_ENGLISH_QUADGRAMS: Record<string, number> = {
  TION: -2.31,
  NTHE: -2.48,
  THER: -2.52,
  THAT: -2.61,
  OFTH: -2.65,
  FTHE: -2.67,
  THES: -2.71,
  WITH: -2.82,
  INTH: -2.85,
  ATIO: -2.91,
  HERE: -2.95,
  FROM: -3.01,
  THEI: -3.05,
  TING: -3.08,
  MENT: -3.12,
  WHIC: -3.15,
  HICH: -3.16,
  THIS: -3.18,
  HAVE: -3.21,
  THEM: -3.24,
  SAND: -3.27,
  ANDT: -3.29,
  EVER: -3.32,
  OTHE: -3.35,
  STHE: -3.38,
  VERY: -3.40,
  ONTH: -3.42,
  WERE: -3.45,
  THEP: -3.47,
  STAT: -3.50,
  PRES: -3.52,
  ORDE: -3.55,
  REPO: -3.58,
  PORT: -3.60,
  ENIG: -3.62,
  NIGM: -3.64,
  IGMA: -3.65,
  SECR: -3.68,
  ECRE: -3.70,
  CRET: -3.72,
  MESS: -3.74,
  ESSA: -3.75,
  SSAG: -3.77,
  SAGE: -3.78,
  ATTE: -3.80,
  TTAC: -3.82,
  TACK: -3.84,
  CONV: -3.86,
  ONVO: -3.88,
  NVOY: -3.90,
  POSI: -3.92,
  OSIT: -3.94,
  SITI: -3.95,
  ITIO: -3.97,
};

/**
 * Calculates letter counts from an uppercase string.
 */
export function calculateLetterCounts(text: string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (let i = 65; i <= 90; i++) {
    counts[String.fromCharCode(i)] = 0;
  }

  const clean = text.toUpperCase().replace(/[^A-Z]/g, '');
  for (const char of clean) {
    counts[char] = (counts[char] || 0) + 1;
  }
  return counts;
}

/**
 * Calculates the Index of Coincidence (IoC) of a text.
 * Formula: sum(f_i * (f_i - 1)) / (N * (N - 1))
 * A random polyalphabetic cipher (Enigma) yields ~0.038.
 * Natural English plaintext yields ~0.0667.
 */
export function calculateIndexOfCoincidence(text: string): number {
  const clean = text.toUpperCase().replace(/[^A-Z]/g, '');
  const n = clean.length;
  if (n <= 1) return 0;

  const counts = calculateLetterCounts(clean);
  let sum = 0;
  for (const count of Object.values(counts)) {
    sum += count * (count - 1);
  }

  return sum / (n * (n - 1));
}

/**
 * Computes the Chi-squared statistic comparing observed text letter frequencies
 * against a reference language distribution (defaults to English).
 * Lower values indicate a closer match to natural language.
 */
export function calculateChiSquared(
  text: string,
  reference: Record<string, number> = ENGLISH_LETTER_FREQUENCIES
): number {
  const clean = text.toUpperCase().replace(/[^A-Z]/g, '');
  const n = clean.length;
  if (n === 0) return 9999;

  const counts = calculateLetterCounts(clean);
  let chi2 = 0;

  for (let i = 65; i <= 90; i++) {
    const char = String.fromCharCode(i);
    const observed = counts[char] || 0;
    const expected = (reference[char] / 100) * n;
    if (expected > 0) {
      chi2 += Math.pow(observed - expected, 2) / expected;
    }
  }

  return chi2;
}

/**
 * Calculates quadgram fitness score for candidate plaintexts.
 * Higher (less negative) values indicate more natural English text.
 */
export function calculateQuadgramScore(text: string): number {
  const clean = text.toUpperCase().replace(/[^A-Z]/g, '');
  if (clean.length < 4) return -100;

  let score = 0;
  const floorScore = -7.0; // penalty for unlisted quadgrams

  for (let i = 0; i <= clean.length - 4; i++) {
    const quad = clean.substring(i, i + 4);
    score += COMMON_ENGLISH_QUADGRAMS[quad] ?? floorScore;
  }

  // Normalize by number of quadgrams evaluated
  return score / (clean.length - 3);
}

/**
 * Generates a comprehensive statistical profile of a text.
 */
export function analyzeTextStatistics(
  text: string,
  reference: Record<string, number> = ENGLISH_LETTER_FREQUENCIES
): StatisticalSummary {
  const clean = text.toUpperCase().replace(/[^A-Z]/g, '');
  const n = clean.length;
  const counts = calculateLetterCounts(clean);
  const ic = calculateIndexOfCoincidence(clean);
  const chi2 = calculateChiSquared(clean, reference);
  const quadScore = calculateQuadgramScore(clean);

  const frequencies: LetterFrequency[] = [];
  let uniqueLetters = 0;

  for (let i = 65; i <= 90; i++) {
    const char = String.fromCharCode(i);
    const count = counts[char] || 0;
    if (count > 0) uniqueLetters++;
    const observedPct = n > 0 ? (count / n) * 100 : 0;
    const expectedPct = reference[char] || 0;

    frequencies.push({
      letter: char,
      count,
      observedPercentage: observedPct,
      expectedPercentage: expectedPct,
      difference: observedPct - expectedPct,
    });
  }

  // A text is likely natural language if IC is elevated towards English (> 0.055)
  // or Chi-squared is low (< 50 for moderate length texts)
  const isLikelyNatural = (ic > 0.052 && n >= 20) || (chi2 < 45 && n >= 25);

  return {
    textLength: n,
    uniqueLetters,
    indexOfCoincidence: ic,
    normalizedIC: ic * 26,
    chiSquared: chi2,
    quadgramScore: quadScore,
    isLikelyNaturalLanguage: isLikelyNatural,
    frequencies,
  };
}
