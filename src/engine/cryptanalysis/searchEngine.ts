import { EnigmaMachine, EnigmaMachineConfig, RotorType, ReflectorType } from '../enigma';
import {
  calculateIndexOfCoincidence,
  calculateChiSquared,
  calculateQuadgramScore,
} from './statistics';

export type ScoringMethod = 'INDEX_OF_COINCIDENCE' | 'CHI_SQUARE' | 'QUADGRAM' | 'CRIB_MATCH';

export interface SearchBounds {
  rotorOrders: Array<[RotorType, RotorType, RotorType]>;
  reflector: ReflectorType;
  ringSettings: [number, number, number];
  plugboard: string[];
  positions: {
    left: string[];
    middle: string[];
    right: string[];
  };
  scoringMethod: ScoringMethod;
  crib?: {
    text: string;
    offset?: number;
  };
  maxCandidates?: number;
}

export interface CandidateResult {
  rank: number;
  score: number;
  rawMetric: number;
  config: EnigmaMachineConfig;
  plaintext: string;
  cribMatched?: boolean;
}

export interface ScoreHistoryPoint {
  evaluations: number;
  bestScore: number;
  timestamp: number;
}

export interface SearchProgress {
  sessionId: string;
  evaluatedCount: number;
  totalCount: number;
  percentComplete: number;
  elapsedMs: number;
  configsPerSecond: number;
  currentBestScore: number;
  currentBestCandidate: CandidateResult | null;
  scoreHistory: ScoreHistoryPoint[];
  status: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'CANCELLED' | 'ERROR';
  errorMessage?: string;
}

export interface SearchExecutionOptions {
  sessionId: string;
  bounds: SearchBounds;
  ciphertext: string;
  onProgress?: (progress: SearchProgress) => void;
  isCancelled?: () => boolean;
}

/**
 * Calculates total combinations defined in the search bounds.
 */
export function calculateTotalSearchSpace(bounds: SearchBounds): number {
  const rotorOrdersCount = Math.max(1, bounds.rotorOrders.length);
  const leftCount = Math.max(1, bounds.positions.left.length);
  const middleCount = Math.max(1, bounds.positions.middle.length);
  const rightCount = Math.max(1, bounds.positions.right.length);

  return rotorOrdersCount * leftCount * middleCount * rightCount;
}

/**
 * Evaluates fitness score for a decrypted candidate plaintext.
 * Always returns a score where HIGHER is better for uniform sorting.
 */
export function evaluateCandidateFitness(
  plaintext: string,
  method: ScoringMethod,
  crib?: { text: string; offset?: number }
): { score: number; rawMetric: number; cribMatched?: boolean } {
  switch (method) {
    case 'INDEX_OF_COINCIDENCE': {
      const ic = calculateIndexOfCoincidence(plaintext);
      return { score: ic, rawMetric: ic };
    }

    case 'CHI_SQUARE': {
      const chi2 = calculateChiSquared(plaintext);
      // Invert chi2 so lower chi2 yields higher score (range typically 0 - 1000)
      const score = 1000 / (1 + chi2);
      return { score, rawMetric: chi2 };
    }

    case 'QUADGRAM': {
      const quad = calculateQuadgramScore(plaintext);
      return { score: quad, rawMetric: quad };
    }

    case 'CRIB_MATCH': {
      if (!crib || !crib.text) {
        const quad = calculateQuadgramScore(plaintext);
        return { score: quad, rawMetric: quad };
      }

      const offset = crib.offset ?? 0;
      const cleanCrib = crib.text.toUpperCase();
      if (offset + cleanCrib.length > plaintext.length) {
        return { score: -100, rawMetric: 0, cribMatched: false };
      }

      const segment = plaintext.substring(offset, offset + cleanCrib.length);
      let matchCount = 0;
      for (let i = 0; i < cleanCrib.length; i++) {
        if (segment[i] === cleanCrib[i]) matchCount++;
      }

      const matchRatio = matchCount / cleanCrib.length;
      const isFullMatch = matchCount === cleanCrib.length;
      // Combine crib match ratio with quadgram tie-breaker
      const quad = calculateQuadgramScore(plaintext);
      const compositeScore = matchRatio * 100 + (quad + 10);

      return {
        score: compositeScore,
        rawMetric: matchRatio * 100,
        cribMatched: isFullMatch,
      };
    }

    default:
      return { score: 0, rawMetric: 0 };
  }
}

/**
 * Deterministically sorts candidate results by score (descending),
 * with stable tie-breaking on rotor order and positions.
 */
export function sortCandidates(
  candidates: CandidateResult[],
  maxLimit: number = 20
): CandidateResult[] {
  const sorted = [...candidates].sort((a, b) => {
    if (Math.abs(b.score - a.score) > 0.00001) {
      return b.score - a.score;
    }
    // Tie-breaker: rotor types
    const rotorsA = a.config.rotors.map((r) => r.type).join('-');
    const rotorsB = b.config.rotors.map((r) => r.type).join('-');
    if (rotorsA !== rotorsB) return rotorsA.localeCompare(rotorsB);

    // Tie-breaker: rotor positions
    const posA = a.config.rotors.map((r) => r.position).join('');
    const posB = b.config.rotors.map((r) => r.position).join('');
    return posA.localeCompare(posB);
  });

  const capped = sorted.slice(0, maxLimit);
  return capped.map((cand, idx) => ({ ...cand, rank: idx + 1 }));
}

/**
 * Executes an exhaustive, bounded search over the specified parameter space.
 * Yields progress periodically and supports cancellation.
 */
export async function executeBoundedSearch(
  options: SearchExecutionOptions
): Promise<{ candidates: CandidateResult[]; progress: SearchProgress }> {
  const { sessionId, bounds, ciphertext, onProgress, isCancelled } = options;
  const startTime = performance.now();
  const totalCount = calculateTotalSearchSpace(bounds);
  const maxCandidates = bounds.maxCandidates ?? 20;

  let evaluatedCount = 0;
  let candidates: CandidateResult[] = [];
  let currentBestScore = -Infinity;
  let currentBestCandidate: CandidateResult | null = null;
  const scoreHistory: ScoreHistoryPoint[] = [];

  const rawString = typeof ciphertext === 'string' ? ciphertext : String(ciphertext || '');
  const cleanCipher = rawString.toUpperCase().replace(/[^A-Z]/g, '');

  let lastYieldTime = startTime;
  const YIELD_INTERVAL_MS = 25; // Cooperative UI yielding frequency

  for (const rotorOrder of bounds.rotorOrders) {
    for (const posL of bounds.positions.left) {
      for (const posM of bounds.positions.middle) {
        for (const posR of bounds.positions.right) {
          if (isCancelled && isCancelled()) {
            const now = performance.now();
            const elapsedMs = Math.max(1, now - startTime);
            const progress: SearchProgress = {
              sessionId,
              evaluatedCount,
              totalCount,
              percentComplete: totalCount > 0 ? (evaluatedCount / totalCount) * 100 : 0,
              elapsedMs,
              configsPerSecond: Math.round((evaluatedCount / elapsedMs) * 1000),
              currentBestScore,
              currentBestCandidate,
              scoreHistory,
              status: 'CANCELLED',
            };
            if (onProgress) onProgress(progress);
            return { candidates, progress };
          }

          const config: EnigmaMachineConfig = {
            rotors: [
              { type: rotorOrder[0], position: posL, ringSetting: bounds.ringSettings[0] },
              { type: rotorOrder[1], position: posM, ringSetting: bounds.ringSettings[1] },
              { type: rotorOrder[2], position: posR, ringSetting: bounds.ringSettings[2] },
            ],
            reflector: bounds.reflector,
            plugboard: [...bounds.plugboard],
          };

          const machine = new EnigmaMachine(config);
          const plaintext = machine.encryptMessage(cleanCipher).outputText;
          const { score, rawMetric, cribMatched } = evaluateCandidateFitness(
            plaintext,
            bounds.scoringMethod,
            bounds.crib
          );

          evaluatedCount++;

          const candidate: CandidateResult = {
            rank: 0,
            score,
            rawMetric,
            config,
            plaintext,
            cribMatched,
          };

          if (score > currentBestScore) {
            currentBestScore = score;
            currentBestCandidate = candidate;
            scoreHistory.push({
              evaluations: evaluatedCount,
              bestScore: score,
              timestamp: Math.round(performance.now() - startTime),
            });
          }

          // Insert or update candidate list if worthy
          if (
            candidates.length < maxCandidates ||
            score > (candidates[candidates.length - 1]?.score ?? -Infinity)
          ) {
            candidates.push(candidate);
            candidates = sortCandidates(candidates, maxCandidates);
          }

          // Periodic progress update and async tick
          const now = performance.now();
          if (now - lastYieldTime >= YIELD_INTERVAL_MS || evaluatedCount === totalCount) {
            lastYieldTime = now;
            const elapsedMs = Math.max(1, now - startTime);
            const progress: SearchProgress = {
              sessionId,
              evaluatedCount,
              totalCount,
              percentComplete: totalCount > 0 ? (evaluatedCount / totalCount) * 100 : 0,
              elapsedMs,
              configsPerSecond: Math.round((evaluatedCount / elapsedMs) * 1000),
              currentBestScore,
              currentBestCandidate,
              scoreHistory: [...scoreHistory],
              status: evaluatedCount === totalCount ? 'COMPLETED' : 'RUNNING',
            };

            if (onProgress) onProgress(progress);
            // Let the JS event loop breathe
            await new Promise((resolve) => setTimeout(resolve, 0));
          }
        }
      }
    }
  }

  const finalElapsed = Math.max(1, performance.now() - startTime);
  const finalProgress: SearchProgress = {
    sessionId,
    evaluatedCount,
    totalCount,
    percentComplete: 100,
    elapsedMs: finalElapsed,
    configsPerSecond: Math.round((evaluatedCount / finalElapsed) * 1000),
    currentBestScore,
    currentBestCandidate,
    scoreHistory,
    status: 'COMPLETED',
  };

  if (onProgress) onProgress(finalProgress);

  return {
    candidates: sortCandidates(candidates, maxCandidates),
    progress: finalProgress,
  };
}
