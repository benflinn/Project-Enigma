import { EnigmaMachine, EnigmaMachineConfig } from '../enigma';
import { ScoringMethod, evaluateCandidateFitness } from './searchEngine';

export interface HillClimbingOptions {
  baseConfig: EnigmaMachineConfig;
  ciphertext: string;
  scoringMethod: ScoringMethod;
  language?: 'ENGLISH' | 'GERMAN';
  crib?: {
    text: string;
    offset?: number;
  };
  maxRestarts: number;
  maxIterationsPerRestart: number;
  maxSteckerPairs?: number; // e.g. 2 to 10 pairs (default 6)
  fixedPlugboardPairs?: string[]; // Pairs known with certainty
  randomSeed?: number;
  targetScore?: number; // Early termination threshold
  onIteration?: (info: HillClimbingIterationInfo) => void;
  isCancelled?: () => boolean;
}

export interface HillClimbingIterationInfo {
  restartIndex: number;
  iteration: number;
  currentScore: number;
  bestGlobalScore: number;
  currentPlugboard: string[];
  bestGlobalPlugboard: string[];
}

export interface HillClimbRestartPoint {
  restartIndex: number;
  iterations: number;
  finalScore: number;
  bestScore: number;
  bestPlugboard: string[];
}

export interface HillClimbingResult {
  bestConfig: EnigmaMachineConfig;
  bestScore: number;
  bestPlaintext: string;
  totalEvaluations: number;
  totalRestarts: number;
  restartsHistory: HillClimbRestartPoint[];
  converged: boolean;
  scoreHistory: Array<{ evaluations: number; bestScore: number; restart: number }>;
}

/**
 * Fast, deterministic pseudo-random number generator (Mulberry32)
 * Ensures 100% reproducible test vectors and optimization sessions.
 */
export class SeededPRNG {
  private state: number;

  constructor(seed: number = 123456789) {
    this.state = seed >>> 0;
  }

  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  public choice<T>(array: T[]): T {
    const idx = this.nextInt(0, array.length - 1);
    return array[idx];
  }
}

/**
 * Validates that plugboard pairs are strictly pairwise reciprocal and disjoint.
 */
export function isValidPlugboard(pairs: string[]): boolean {
  const seen = new Set<string>();
  for (const pair of pairs) {
    if (pair.length !== 2) return false;
    const a = pair[0].toUpperCase();
    const b = pair[1].toUpperCase();
    if (a === b) return false;
    if (a < 'A' || a > 'Z' || b < 'A' || b > 'Z') return false;
    if (seen.has(a) || seen.has(b)) return false;
    seen.add(a);
    seen.add(b);
  }
  return true;
}

/**
 * Normalizes plugboard pairs into alphabetical canonical order: e.g. ['VA', 'BC'] -> ['AV', 'BC']
 */
export function canonicalizePlugboard(pairs: string[]): string[] {
  const canonical = pairs.map((pair) => {
    const a = pair[0].toUpperCase();
    const b = pair[1].toUpperCase();
    return a < b ? `${a}${b}` : `${b}${a}`;
  });
  return canonical.sort();
}

/**
 * Generates all unsteckered letters from current plugboard pairs.
 */
export function getAvailableLetters(plugboard: string[]): string[] {
  const used = new Set<string>();
  for (const p of plugboard) {
    used.add(p[0]);
    used.add(p[1]);
  }
  const available: string[] = [];
  for (let i = 65; i <= 90; i++) {
    const char = String.fromCharCode(i);
    if (!used.has(char)) {
      available.push(char);
    }
  }
  return available;
}

/**
 * Applies a single pairwise swap or stecker connection between charA and charB.
 * Safely disconnects prior connections to charA and charB (unless fixed) and creates (charA, charB).
 */
export function applyPairSwap(
  currentPlugboard: string[],
  fixedLetters: Set<string>,
  charA: string,
  charB: string,
  maxPairs: number
): string[] {
  if (fixedLetters.has(charA) || fixedLetters.has(charB)) {
    return currentPlugboard;
  }

  // Remove any mutable pair containing charA or charB
  const remaining = currentPlugboard.filter((p) => {
    if (p.includes(charA) || p.includes(charB)) return false;
    return true;
  });

  if (charA !== charB && remaining.length < maxPairs) {
    const newPair = charA < charB ? `${charA}${charB}` : `${charB}${charA}`;
    if (!remaining.includes(newPair)) {
      remaining.push(newPair);
    }
  }

  return canonicalizePlugboard(remaining);
}

/**
 * Generates a valid neighbor configuration by applying one stochastic mutation.
 */
export function generatePlugboardNeighbor(
  currentPlugboard: string[],
  fixedPairs: Set<string>,
  maxPairs: number,
  prng: SeededPRNG
): string[] {
  const plugboard = [...currentPlugboard];
  const mutablePairs = plugboard.filter((p) => !fixedPairs.has(p));
  const availableLetters = getAvailableLetters(plugboard);

  const mutationTypes: Array<'ADD' | 'REMOVE' | 'MODIFY' | 'SWAP_PAIRS'> = [];

  if (plugboard.length < maxPairs && availableLetters.length >= 2) {
    mutationTypes.push('ADD');
  }
  if (mutablePairs.length > 0) {
    mutationTypes.push('REMOVE');
    if (availableLetters.length >= 1) {
      mutationTypes.push('MODIFY');
    }
  }
  if (mutablePairs.length >= 2) {
    mutationTypes.push('SWAP_PAIRS');
  }

  if (mutationTypes.length === 0) {
    return plugboard;
  }

  const chosenMutation = prng.choice(mutationTypes);

  switch (chosenMutation) {
    case 'ADD': {
      const idx1 = prng.nextInt(0, availableLetters.length - 1);
      let idx2 = prng.nextInt(0, availableLetters.length - 1);
      while (idx2 === idx1) {
        idx2 = prng.nextInt(0, availableLetters.length - 1);
      }
      const a = availableLetters[idx1];
      const b = availableLetters[idx2];
      const newPair = a < b ? `${a}${b}` : `${b}${a}`;
      plugboard.push(newPair);
      break;
    }

    case 'REMOVE': {
      const pairToRemove = prng.choice(mutablePairs);
      const idx = plugboard.indexOf(pairToRemove);
      if (idx !== -1) {
        plugboard.splice(idx, 1);
      }
      break;
    }

    case 'MODIFY': {
      const pairToModify = prng.choice(mutablePairs);
      const idx = plugboard.indexOf(pairToModify);
      if (idx !== -1) {
        const keepFirst = prng.next() < 0.5;
        const keptLetter = keepFirst ? pairToModify[0] : pairToModify[1];
        const newLetter = prng.choice(availableLetters);
        const newPair = keptLetter < newLetter ? `${keptLetter}${newLetter}` : `${newLetter}${keptLetter}`;
        plugboard[idx] = newPair;
      }
      break;
    }

    case 'SWAP_PAIRS': {
      const p1 = prng.choice(mutablePairs);
      let p2 = prng.choice(mutablePairs);
      while (p2 === p1 && mutablePairs.length > 1) {
        p2 = prng.choice(mutablePairs);
      }
      const idx1 = plugboard.indexOf(p1);
      const idx2 = plugboard.indexOf(p2);
      if (idx1 !== -1 && idx2 !== -1 && idx1 !== idx2) {
        const a = p1[0];
        const b = p1[1];
        const c = p2[0];
        const d = p2[1];
        const newP1 = a < c ? `${a}${c}` : `${c}${a}`;
        const newP2 = b < d ? `${b}${d}` : `${d}${b}`;
        plugboard[idx1] = newP1;
        plugboard[idx2] = newP2;
      }
      break;
    }
  }

  return canonicalizePlugboard(plugboard);
}

/**
 * Executes bounded random-restart hill-climbing optimization to discover
 * unknown plugboard connections for a fixed rotor setting.
 * Uses systematic 1-stecker neighborhood sweeps combined with stochastic restarts.
 */
export function executePlugboardHillClimbing(
  options: HillClimbingOptions
): HillClimbingResult {
  const {
    baseConfig,
    ciphertext,
    scoringMethod,
    crib,
    maxRestarts,
    maxIterationsPerRestart,
    maxSteckerPairs = 6,
    fixedPlugboardPairs = [],
    randomSeed = 42,
    targetScore,
    onIteration,
    isCancelled,
  } = options;

  const prng = new SeededPRNG(randomSeed);
  const cleanCipher = ciphertext.toUpperCase().replace(/[^A-Z]/g, '');
  const fixedSet = new Set(canonicalizePlugboard(fixedPlugboardPairs));
  const fixedLetters = new Set<string>();
  for (const pair of fixedPlugboardPairs) {
    if (pair.length === 2) {
      fixedLetters.add(pair[0].toUpperCase());
      fixedLetters.add(pair[1].toUpperCase());
    }
  }

  let totalEvaluations = 0;
  let globalBestScore = -Infinity;
  let globalBestPlugboard = canonicalizePlugboard(fixedPlugboardPairs);
  let globalBestPlaintext = '';
  const restartsHistory: HillClimbRestartPoint[] = [];
  const scoreHistory: Array<{ evaluations: number; bestScore: number; restart: number }> = [];

  const alphabet: string[] = [];
  for (let i = 65; i <= 90; i++) alphabet.push(String.fromCharCode(i));

  // Helper to evaluate a candidate plugboard
  const evaluate = (plugboard: string[]): { score: number; plaintext: string } => {
    totalEvaluations++;
    const config: EnigmaMachineConfig = {
      rotors: [
        { ...baseConfig.rotors[0] },
        { ...baseConfig.rotors[1] },
        { ...baseConfig.rotors[2] },
      ],
      reflector: baseConfig.reflector,
      plugboard,
    };
    const machine = new EnigmaMachine(config);
    const plaintext = machine.encryptMessage(cleanCipher).outputText;
    const { score } = evaluateCandidateFitness(plaintext, scoringMethod, crib);
    return { score, plaintext };
  };

  for (let r = 0; r < maxRestarts; r++) {
    if (isCancelled && isCancelled()) break;

    // Start with fixed pairs plus random initial perturbation for restarts > 0
    let currentPlugboard = canonicalizePlugboard(fixedPlugboardPairs);
    if (r > 0) {
      const initialAdds = prng.nextInt(1, Math.min(3, maxSteckerPairs - fixedSet.size));
      for (let i = 0; i < initialAdds; i++) {
        currentPlugboard = generatePlugboardNeighbor(currentPlugboard, fixedSet, maxSteckerPairs, prng);
      }
    }

    let { score: currentScore, plaintext: currentPlaintext } = evaluate(currentPlugboard);
    let restartBestScore = currentScore;
    let restartBestPlugboard = [...currentPlugboard];

    if (currentScore > globalBestScore) {
      globalBestScore = currentScore;
      globalBestPlugboard = [...currentPlugboard];
      globalBestPlaintext = currentPlaintext;
      scoreHistory.push({
        evaluations: totalEvaluations,
        bestScore: globalBestScore,
        restart: r + 1,
      });
    }

    let pass = 0;
    let improvedInPass = true;

    while (improvedInPass && pass < maxIterationsPerRestart) {
      if (isCancelled && isCancelled()) break;
      improvedInPass = false;
      pass++;

      // Permute alphabet testing order using PRNG for diverse exploration
      const letters = [...alphabet].sort(() => prng.next() - 0.5);

      for (let i = 0; i < letters.length; i++) {
        if (isCancelled && isCancelled()) break;
        const charA = letters[i];
        if (fixedLetters.has(charA)) continue;

        for (let j = i; j < letters.length; j++) {
          const charB = letters[j];
          if (fixedLetters.has(charB)) continue;

          const candidatePlugboard = applyPairSwap(
            currentPlugboard,
            fixedLetters,
            charA,
            charB,
            maxSteckerPairs
          );

          const { score: candScore, plaintext: candPlaintext } = evaluate(candidatePlugboard);

          if (candScore > currentScore + 0.0001) {
            currentScore = candScore;
            currentPlugboard = candidatePlugboard;
            currentPlaintext = candPlaintext;
            improvedInPass = true;

            if (candScore > restartBestScore) {
              restartBestScore = candScore;
              restartBestPlugboard = [...candidatePlugboard];
            }

            if (candScore > globalBestScore) {
              globalBestScore = candScore;
              globalBestPlugboard = [...candidatePlugboard];
              globalBestPlaintext = candPlaintext;
              scoreHistory.push({
                evaluations: totalEvaluations,
                bestScore: globalBestScore,
                restart: r + 1,
              });
            }
          }
        }
      }

      if (onIteration) {
        onIteration({
          restartIndex: r + 1,
          iteration: pass,
          currentScore,
          bestGlobalScore: globalBestScore,
          currentPlugboard,
          bestGlobalPlugboard: globalBestPlugboard,
        });
      }

      if (targetScore && globalBestScore >= targetScore) {
        break;
      }
    }

    restartsHistory.push({
      restartIndex: r + 1,
      iterations: pass,
      finalScore: currentScore,
      bestScore: restartBestScore,
      bestPlugboard: restartBestPlugboard,
    });

    if (targetScore && globalBestScore >= targetScore) {
      break;
    }
  }

  const bestConfig: EnigmaMachineConfig = {
    rotors: [
      { ...baseConfig.rotors[0] },
      { ...baseConfig.rotors[1] },
      { ...baseConfig.rotors[2] },
    ],
    reflector: baseConfig.reflector,
    plugboard: globalBestPlugboard,
  };

  return {
    bestConfig,
    bestScore: globalBestScore,
    bestPlaintext: globalBestPlaintext,
    totalEvaluations,
    totalRestarts: restartsHistory.length,
    restartsHistory,
    converged: targetScore ? globalBestScore >= targetScore : true,
    scoreHistory,
  };
}
