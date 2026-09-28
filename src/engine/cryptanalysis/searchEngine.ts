import { EnigmaMachine, EnigmaMachineConfig, RotorType, ReflectorType } from '../enigma';
import {
  calculateIndexOfCoincidence,
  calculateChiSquared,
  calculateQuadgramScore,
  calculateCandidateConfidence,
  CandidateConfidence,
} from './statistics';
import {
  executePlugboardHillClimbing,
  HillClimbRestartPoint,
} from './hillClimbing';

export type ScoringMethod = 'INDEX_OF_COINCIDENCE' | 'CHI_SQUARE' | 'QUADGRAM' | 'CRIB_MATCH';
export type SearchStrategy = 'EXHAUSTIVE' | 'HILL_CLIMBING' | 'HYBRID';

export interface HillClimbingSearchConfig {
  maxRestarts: number;
  maxIterationsPerRestart: number;
  maxSteckerPairs?: number;
  fixedPlugboardPairs?: string[];
  randomSeed?: number;
}

export interface SearchBounds {
  strategy?: SearchStrategy;
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
  language?: 'ENGLISH' | 'GERMAN';
  crib?: {
    text: string;
    offset?: number;
  };
  maxCandidates?: number;
  hillClimbing?: HillClimbingSearchConfig;
}

export interface CandidateResult {
  rank: number;
  score: number;
  rawMetric: number;
  config: EnigmaMachineConfig;
  plaintext: string;
  cribMatched?: boolean;
  confidence?: CandidateConfidence;
}

export interface ScoreHistoryPoint {
  evaluations: number;
  bestScore: number;
  timestamp: number;
  restart?: number;
}

export interface SearchProgress {
  sessionId: string;
  strategy: SearchStrategy;
  evaluatedCount: number;
  totalCount: number;
  percentComplete: number;
  elapsedMs: number;
  configsPerSecond: number;
  currentBestScore: number;
  currentBestCandidate: CandidateResult | null;
  scoreHistory: ScoreHistoryPoint[];
  restartsHistory?: HillClimbRestartPoint[];
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

export interface SearchCostEstimate {
  totalCombinations: number;
  estimatedDurationMs: number;
  isExcessive: boolean;
  warningMessage?: string;
  strategy: SearchStrategy;
}

/**
 * Calculates total combinations defined in the search bounds based on chosen strategy.
 */
export function calculateTotalSearchSpace(bounds: SearchBounds): number {
  const strategy = bounds.strategy ?? 'EXHAUSTIVE';
  const rotorOrdersCount = Math.max(1, bounds.rotorOrders.length);
  const leftCount = Math.max(1, bounds.positions.left.length);
  const middleCount = Math.max(1, bounds.positions.middle.length);
  const rightCount = Math.max(1, bounds.positions.right.length);
  const positionSpace = rotorOrdersCount * leftCount * middleCount * rightCount;

  if (strategy === 'EXHAUSTIVE') {
    return positionSpace;
  }

  if (strategy === 'HILL_CLIMBING') {
    const restarts = bounds.hillClimbing?.maxRestarts ?? 5;
    const iters = bounds.hillClimbing?.maxIterationsPerRestart ?? 80;
    return restarts * iters;
  }

  if (strategy === 'HYBRID') {
    const restarts = bounds.hillClimbing?.maxRestarts ?? 3;
    const iters = bounds.hillClimbing?.maxIterationsPerRestart ?? 50;
    return positionSpace * (restarts * iters);
  }

  return positionSpace;
}

/**
 * Estimates computational cost and provides warnings if search is computationally prohibitive.
 */
export function estimateSearchCost(bounds: SearchBounds): SearchCostEstimate {
  const strategy = bounds.strategy ?? 'EXHAUSTIVE';
  const total = calculateTotalSearchSpace(bounds);

  // Approximate throughput: ~15,000 evaluations per second in modern JS engine
  const estimatedDurationMs = Math.round((total / 15000) * 1000);

  let isExcessive = false;
  let warningMessage: string | undefined;

  if (strategy === 'EXHAUSTIVE') {
    if (total > 35000) {
      isExcessive = true;
      warningMessage = `Exhaustive search space (${total.toLocaleString()} configurations) is very large. Consider fixing known rotor positions or using crib-dragging.`;
    }
  } else if (strategy === 'HYBRID') {
    if (total > 50000) {
      isExcessive = true;
      warningMessage = `Hybrid search estimated at ${total.toLocaleString()} evaluations (~${(estimatedDurationMs / 1000).toFixed(1)}s). Reduce rotor search ranges or restart limits.`;
    }
  }

  return {
    totalCombinations: total,
    estimatedDurationMs,
    isExcessive,
    warningMessage,
    strategy,
  };
}

/**
 * Evaluates fitness score for a decrypted candidate plaintext.
 * Always returns a score where HIGHER is better for uniform sorting.
 */
export function evaluateCandidateFitness(
  plaintext: string,
  method: ScoringMethod,
  crib?: { text: string; offset?: number },
  language: 'ENGLISH' | 'GERMAN' = 'ENGLISH'
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
      const quad = calculateQuadgramScore(plaintext, language);
      return { score: quad, rawMetric: quad };
    }

    case 'CRIB_MATCH': {
      if (!crib || !crib.text) {
        const quad = calculateQuadgramScore(plaintext, language);
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
      const quad = calculateQuadgramScore(plaintext, language);
      const compositeScore = matchRatio * 100 + (quad * 10);

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
 * calculates candidate confidence gap, and applies stable tie-breaking.
 */
export function sortCandidates(
  candidates: CandidateResult[],
  maxLimit: number = 20,
  method: string = 'QUADGRAM'
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

    // Tie-breaker: plugboard
    const plugA = a.config.plugboard.join('');
    const plugB = b.config.plugboard.join('');
    return plugA.localeCompare(plugB);
  });

  const capped = sorted.slice(0, maxLimit);
  return capped.map((cand, idx) => {
    const runnerUp = sorted[idx === 0 ? 1 : 0];
    const confidence = idx === 0 ? calculateCandidateConfidence(cand.score, runnerUp?.score, method) : undefined;
    return {
      ...cand,
      rank: idx + 1,
      confidence: confidence || cand.confidence,
    };
  });
}

/**
 * Executes a search using the chosen strategy (Exhaustive, Hill Climbing, or Hybrid).
 */
export async function executeBoundedSearch(
  options: SearchExecutionOptions
): Promise<{ candidates: CandidateResult[]; progress: SearchProgress }> {
  const { sessionId, bounds, ciphertext, onProgress, isCancelled } = options;
  const strategy = bounds.strategy ?? 'EXHAUSTIVE';
  const startTime = performance.now();
  const totalCount = calculateTotalSearchSpace(bounds);
  const maxCandidates = bounds.maxCandidates ?? 20;
  const language = bounds.language ?? 'ENGLISH';

  let evaluatedCount = 0;
  let candidates: CandidateResult[] = [];
  let currentBestScore = -Infinity;
  let currentBestCandidate: CandidateResult | null = null;
  const scoreHistory: ScoreHistoryPoint[] = [];
  let restartsHistory: HillClimbRestartPoint[] = [];

  const rawString = typeof ciphertext === 'string' ? ciphertext : String(ciphertext || '');
  const cleanCipher = rawString.toUpperCase().replace(/[^A-Z]/g, '');

  let lastYieldTime = startTime;
  const YIELD_INTERVAL_MS = 25;

  if (strategy === 'HILL_CLIMBING') {
    // Strategy B: Dedicated Plugboard Optimization
    const baseRotorOrder = bounds.rotorOrders[0] ?? ['I', 'II', 'III'];
    const basePosL = bounds.positions.left[0] ?? 'A';
    const basePosM = bounds.positions.middle[0] ?? 'A';
    const basePosR = bounds.positions.right[0] ?? 'A';

    const baseConfig: EnigmaMachineConfig = {
      rotors: [
        { type: baseRotorOrder[0], position: basePosL, ringSetting: bounds.ringSettings[0] },
        { type: baseRotorOrder[1], position: basePosM, ringSetting: bounds.ringSettings[1] },
        { type: baseRotorOrder[2], position: basePosR, ringSetting: bounds.ringSettings[2] },
      ],
      reflector: bounds.reflector,
      plugboard: [...bounds.plugboard],
    };

    const hcResult = executePlugboardHillClimbing({
      baseConfig,
      ciphertext: cleanCipher,
      scoringMethod: bounds.scoringMethod,
      language,
      crib: bounds.crib,
      maxRestarts: bounds.hillClimbing?.maxRestarts ?? 8,
      maxIterationsPerRestart: bounds.hillClimbing?.maxIterationsPerRestart ?? 100,
      maxSteckerPairs: bounds.hillClimbing?.maxSteckerPairs ?? 6,
      fixedPlugboardPairs: bounds.hillClimbing?.fixedPlugboardPairs ?? bounds.plugboard,
      randomSeed: bounds.hillClimbing?.randomSeed ?? 42,
      isCancelled,
      onIteration: (info) => {
        evaluatedCount = (info.restartIndex - 1) * (bounds.hillClimbing?.maxIterationsPerRestart ?? 100) + info.iteration;
        currentBestScore = info.bestGlobalScore;
        const now = performance.now();
        if (now - lastYieldTime >= YIELD_INTERVAL_MS) {
          lastYieldTime = now;
          const elapsedMs = Math.max(1, now - startTime);
          const progress: SearchProgress = {
            sessionId,
            strategy,
            evaluatedCount,
            totalCount,
            percentComplete: totalCount > 0 ? Math.min(99, (evaluatedCount / totalCount) * 100) : 0,
            elapsedMs,
            configsPerSecond: Math.round((evaluatedCount / elapsedMs) * 1000),
            currentBestScore,
            currentBestCandidate,
            scoreHistory: [...scoreHistory],
            restartsHistory: [...restartsHistory],
            status: 'RUNNING',
          };
          onProgress?.(progress);
        }
      },
    });

    evaluatedCount = hcResult.totalEvaluations;
    currentBestScore = hcResult.bestScore;
    restartsHistory = hcResult.restartsHistory;

    currentBestCandidate = {
      rank: 1,
      score: hcResult.bestScore,
      rawMetric: hcResult.bestScore,
      config: hcResult.bestConfig,
      plaintext: hcResult.bestPlaintext,
    };
    candidates = [currentBestCandidate];

    for (const pt of hcResult.scoreHistory) {
      scoreHistory.push({
        evaluations: pt.evaluations,
        bestScore: pt.bestScore,
        timestamp: Math.round(performance.now() - startTime),
        restart: pt.restart,
      });
    }
  } else if (strategy === 'HYBRID') {
    // Strategy C: Hybrid Position Enumeration + Plugboard Hill Climbing
    for (const rotorOrder of bounds.rotorOrders) {
      for (const posL of bounds.positions.left) {
        for (const posM of bounds.positions.middle) {
          for (const posR of bounds.positions.right) {
            if (isCancelled && isCancelled()) break;

            const baseConfig: EnigmaMachineConfig = {
              rotors: [
                { type: rotorOrder[0], position: posL, ringSetting: bounds.ringSettings[0] },
                { type: rotorOrder[1], position: posM, ringSetting: bounds.ringSettings[1] },
                { type: rotorOrder[2], position: posR, ringSetting: bounds.ringSettings[2] },
              ],
              reflector: bounds.reflector,
              plugboard: [...bounds.plugboard],
            };

            const subResult = executePlugboardHillClimbing({
              baseConfig,
              ciphertext: cleanCipher,
              scoringMethod: bounds.scoringMethod,
              language,
              crib: bounds.crib,
              maxRestarts: bounds.hillClimbing?.maxRestarts ?? 3,
              maxIterationsPerRestart: bounds.hillClimbing?.maxIterationsPerRestart ?? 50,
              maxSteckerPairs: bounds.hillClimbing?.maxSteckerPairs ?? 6,
              fixedPlugboardPairs: bounds.hillClimbing?.fixedPlugboardPairs ?? bounds.plugboard,
              randomSeed: (bounds.hillClimbing?.randomSeed ?? 100) + evaluatedCount,
              isCancelled,
            });

            evaluatedCount += subResult.totalEvaluations;

            const candidate: CandidateResult = {
              rank: 0,
              score: subResult.bestScore,
              rawMetric: subResult.bestScore,
              config: subResult.bestConfig,
              plaintext: subResult.bestPlaintext,
            };

            if (subResult.bestScore > currentBestScore) {
              currentBestScore = subResult.bestScore;
              currentBestCandidate = candidate;
              scoreHistory.push({
                evaluations: evaluatedCount,
                bestScore: subResult.bestScore,
                timestamp: Math.round(performance.now() - startTime),
              });
            }

            candidates.push(candidate);
            candidates = sortCandidates(candidates, maxCandidates, bounds.scoringMethod);

            const now = performance.now();
            if (now - lastYieldTime >= YIELD_INTERVAL_MS) {
              lastYieldTime = now;
              const elapsedMs = Math.max(1, now - startTime);
              const progress: SearchProgress = {
                sessionId,
                strategy,
                evaluatedCount,
                totalCount,
                percentComplete: totalCount > 0 ? (evaluatedCount / totalCount) * 100 : 0,
                elapsedMs,
                configsPerSecond: Math.round((evaluatedCount / elapsedMs) * 1000),
                currentBestScore,
                currentBestCandidate,
                scoreHistory: [...scoreHistory],
                status: 'RUNNING',
              };
              onProgress?.(progress);
              await new Promise((resolve) => setTimeout(resolve, 0));
            }
          }
        }
      }
    }
  } else {
    // Strategy A: Exhaustive Enumeration
    for (const rotorOrder of bounds.rotorOrders) {
      for (const posL of bounds.positions.left) {
        for (const posM of bounds.positions.middle) {
          for (const posR of bounds.positions.right) {
            if (isCancelled && isCancelled()) {
              const now = performance.now();
              const elapsedMs = Math.max(1, now - startTime);
              const progress: SearchProgress = {
                sessionId,
                strategy: 'EXHAUSTIVE',
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
              bounds.crib,
              language
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
              candidates = sortCandidates(candidates, maxCandidates, bounds.scoringMethod);
            }

            // Periodic progress update and async tick
            const now = performance.now();
            if (now - lastYieldTime >= YIELD_INTERVAL_MS || evaluatedCount === totalCount) {
              lastYieldTime = now;
              const elapsedMs = Math.max(1, now - startTime);
              const progress: SearchProgress = {
                sessionId,
                strategy: 'EXHAUSTIVE',
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
              await new Promise((resolve) => setTimeout(resolve, 0));
            }
          }
        }
      }
    }
  }

  const finalElapsed = Math.max(1, performance.now() - startTime);
  const finalProgress: SearchProgress = {
    sessionId,
    strategy,
    evaluatedCount,
    totalCount: Math.max(totalCount, evaluatedCount),
    percentComplete: 100,
    elapsedMs: finalElapsed,
    configsPerSecond: Math.round((evaluatedCount / finalElapsed) * 1000),
    currentBestScore,
    currentBestCandidate,
    scoreHistory,
    restartsHistory,
    status: 'COMPLETED',
  };

  if (onProgress) onProgress(finalProgress);

  return {
    candidates: sortCandidates(candidates, maxCandidates, bounds.scoringMethod),
    progress: finalProgress,
  };
}
