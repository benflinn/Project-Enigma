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
// Normalized floor for unseen quadgrams is -7.0
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
  SUBM: -3.40,
  UBMA: -3.45,
  BMAR: -3.48,
  MARI: -3.50,
  ARIN: -3.52,
  RINE: -3.55,
  INES: -3.58,
  NVER: -3.60,
  VERG: -3.62,
  ERGE: -3.65,
  ATGR: -3.68,
  TGRI: -3.70,
  GRID: -3.72,
  TWEL: -3.75,
  WELV: -3.78,
  ELVE: -3.80,
  TORP: -3.82,
  ORPE: -3.85,
  RPED: -3.88,
  PEDO: -3.90,
  LOAD: -3.60,
  OADE: -3.65,
  ADED: -3.68,
  DAND: -3.70,
  ANDR: -3.72,
  NDRE: -3.75,
  DREA: -3.78,
  READ: -3.80,
  EADY: -3.82,
  BATT: -3.50,
  ATTL: -3.54,
  TTLE: -3.58,
  LESH: -3.62,
  ESHI: -3.65,
  SHIP: -3.68,
  COUR: -3.70,
  OURS: -3.72,
  URSE: -3.75,
  BRES: -3.80,
  REST: -3.82,
  SPEC: -3.45,
  PECI: -3.48,
  ECIA: -3.52,
  CIAL: -3.55,
  DISP: -3.58,
  ISPA: -3.60,
  SPAT: -3.62,
  PATC: -3.65,
  ATCH: -3.68,
  OPER: -3.70,
  PERA: -3.72,
  ERAT: -3.75,
  RATI: -3.78,
  COMM: -3.80,
  OMME: -3.82,
  MMEN: -3.85,
  MENC: -3.88,
  ENCI: -3.90,
  NCIN: -3.92,
  CING: -3.95,
};

// High-frequency German military quadgrams
export const COMMON_GERMAN_QUADGRAMS: Record<string, number> = {
  EICH: -2.41,
  NDER: -2.49,
  ICHT: -2.53,
  SCHE: -2.58,
  ENSI: -2.62,
  CHTE: -2.66,
  WETT: -2.70,
  ETTE: -2.72,
  TTER: -2.75,
  BERI: -2.79,
  ERIC: -2.81,
  ACHT: -2.85,
  NORD: -2.88,
  ORDS: -2.92,
  RDSE: -2.95,
  DSEE: -2.98,
  WIND: -3.02,
  STAR: -3.06,
  TARK: -3.09,
  ARKE: -3.12,
  SEEA: -3.15,
  EEAC: -3.18,
  EACH: -3.20,
  KLAE: -3.25,
  LAER: -3.28,
  AERU: -3.31,
  ERUN: -3.34,
  RUNG: -3.37,
  BOOT: -3.40,
  UBOO: -3.42,
  KRIE: -3.45,
  RIEG: -3.48,
  IEGS: -3.50,
  EGSM: -3.53,
  GSMA: -3.56,
  SMAR: -3.58,
  MARI: -3.61,
  ARIN: -3.63,
  RINE: -3.66,
  BEFE: -3.69,
  EFEH: -3.72,
  FEHL: -3.75,
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
 * Higher (less negative) values indicate more natural text.
 * Supports both English and German quadgram statistical tables.
 */
export function calculateQuadgramScore(
  text: string,
  language: 'ENGLISH' | 'GERMAN' = 'ENGLISH'
): number {
  const clean = text.toUpperCase().replace(/[^A-Z]/g, '');
  if (clean.length < 4) return -100;

  const table = language === 'GERMAN' ? COMMON_GERMAN_QUADGRAMS : COMMON_ENGLISH_QUADGRAMS;
  let score = 0;
  const floorScore = -7.0; // penalty for unlisted quadgrams

  for (let i = 0; i <= clean.length - 4; i++) {
    const quad = clean.substring(i, i + 4);
    score += table[quad] ?? floorScore;
  }

  // Normalize by number of quadgrams evaluated
  return score / (clean.length - 3);
}

export interface CandidateConfidence {
  rating: 'Definitive' | 'High' | 'Moderate' | 'Low';
  separationRatio: number; // Ratio or delta between rank 1 and rank 2 score
  explanation: string;
}

/**
 * Calculates candidate confidence indicator based on score separation
 * between the top candidate and runner-up.
 */
export function calculateCandidateConfidence(
  topScore: number,
  runnerUpScore: number | undefined,
  method: string
): CandidateConfidence {
  if (runnerUpScore === undefined || Number.isNaN(runnerUpScore)) {
    return {
      rating: 'Moderate',
      separationRatio: 1.0,
      explanation: 'Single candidate evaluated. Verification on simulator recommended.',
    };
  }

  const delta = Math.abs(topScore - runnerUpScore);

  if (method === 'INDEX_OF_COINCIDENCE') {
    if (delta > 0.015 && topScore > 0.055) {
      return {
        rating: 'Definitive',
        separationRatio: delta,
        explanation: 'Top candidate exhibits clear natural language Index of Coincidence (> 0.055) with wide margin over noise.',
      };
    }
    if (delta > 0.008) {
      return {
        rating: 'High',
        separationRatio: delta,
        explanation: 'Elevated IoC with noticeable statistical separation from alternative settings.',
      };
    }
    return {
      rating: 'Moderate',
      separationRatio: delta,
      explanation: 'Marginal IoC separation. Polyalphabetic variance may cause false peaks.',
    };
  }

  if (method === 'QUADGRAM') {
    if (delta > 0.6) {
      return {
        rating: 'Definitive',
        separationRatio: delta,
        explanation: 'Dominant quadgram log-likelihood score indicating genuine language plaintext.',
      };
    }
    if (delta > 0.25) {
      return {
        rating: 'High',
        separationRatio: delta,
        explanation: 'Clear quadgram separation indicating probable plaintext recovery.',
      };
    }
    return {
      rating: 'Moderate',
      separationRatio: delta,
      explanation: 'Close scores between top candidates. Manual inspection advised.',
    };
  }

  // Default / Chi-Square
  if (delta > 15) {
    return {
      rating: 'High',
      separationRatio: delta,
      explanation: 'Statistically significant goodness-of-fit separation.',
    };
  }
  return {
    rating: 'Moderate',
    separationRatio: delta,
    explanation: 'Candidate scores are closely clustered. Review plaintext manually.',
  };
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
