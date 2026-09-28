import { EnigmaMachine, EnigmaMachineConfig, RotorType, ReflectorType } from '../enigma';
import { SeededPRNG } from './hillClimbing';

export type ProficiencyCategory =
  | 'enigmaMechanics'
  | 'cribAnalysis'
  | 'statisticalInterpretation'
  | 'searchStrategy'
  | 'configurationVerification';

export type PlayerMasteryLevel = 'Apprentice' | 'Codebreaker' | 'Senior Analyst' | 'Bletchley Master';
export type DifficultyPreference = 'Adaptive' | 'Standard' | 'Guided' | 'Veteran';

export interface PlayerProficiencyRecord {
  id: 'player_profile';
  enigmaMechanics: number; // 0 - 100
  cribAnalysis: number; // 0 - 100
  statisticalInterpretation: number; // 0 - 100
  searchStrategy: number; // 0 - 100
  configurationVerification: number; // 0 - 100
  overallScore: number; // 0 - 100
  masteryLevel: PlayerMasteryLevel;
  difficultyPreference: DifficultyPreference;
  hintsUsedCount: number;
  successfulDeductionsCount: number;
  failedAttemptsCount: number;
  totalVerificationsCount: number;
  recentTelemetry: Array<{
    timestamp: number;
    category: ProficiencyCategory;
    outcome: 'SUCCESS' | 'FAILURE' | 'HINT_USED' | 'EXPERIMENT';
    delta: number;
    description: string;
  }>;
}

export interface ContextualAdvice {
  id: string;
  severity: 'info' | 'suggestion' | 'warning';
  title: string;
  message: string;
  actionRecommendation?: string;
}

export interface ProceduralChallenge {
  id: string;
  title: string;
  briefing: string;
  ciphertext: string;
  plaintext: string;
  targetConfig: EnigmaMachineConfig;
  knownSettings: {
    rotors: [RotorType, RotorType, RotorType];
    reflector: ReflectorType;
    ringSettings: [number, number, number];
    knownPositions: [string | null, string | null, string | null];
    knownPlugboard: string[];
    suggestedCrib?: string;
  };
  recommendedStrategy: 'EXHAUSTIVE' | 'HILL_CLIMBING' | 'HYBRID';
  difficultyScore: number;
}

export const DEFAULT_PROFICIENCY: PlayerProficiencyRecord = {
  id: 'player_profile',
  enigmaMechanics: 25,
  cribAnalysis: 20,
  statisticalInterpretation: 15,
  searchStrategy: 10,
  configurationVerification: 15,
  overallScore: 17,
  masteryLevel: 'Apprentice',
  difficultyPreference: 'Adaptive',
  hintsUsedCount: 0,
  successfulDeductionsCount: 0,
  failedAttemptsCount: 0,
  totalVerificationsCount: 0,
  recentTelemetry: [],
};

/**
 * Calculates overall mastery level based on mean score across all categories.
 */
export function computeMasteryLevel(score: number): PlayerMasteryLevel {
  if (score >= 85) return 'Bletchley Master';
  if (score >= 65) return 'Senior Analyst';
  if (score >= 40) return 'Codebreaker';
  return 'Apprentice';
}

/**
 * Deterministically adjusts player proficiency given an observable gameplay outcome.
 */
export function updateProficiency(
  current: PlayerProficiencyRecord,
  category: ProficiencyCategory,
  outcome: 'SUCCESS' | 'FAILURE' | 'HINT_USED' | 'EXPERIMENT',
  description: string
): PlayerProficiencyRecord {
  let delta = 0;
  let hintsCount = current.hintsUsedCount;
  let successCount = current.successfulDeductionsCount;
  let failCount = current.failedAttemptsCount;
  let verifCount = current.totalVerificationsCount;

  switch (outcome) {
    case 'SUCCESS':
      delta = 8;
      successCount++;
      if (category === 'configurationVerification') verifCount++;
      break;
    case 'FAILURE':
      delta = -3;
      failCount++;
      break;
    case 'HINT_USED':
      delta = -2;
      hintsCount++;
      break;
    case 'EXPERIMENT':
      delta = 2; // Reward meaningful experimentation
      break;
  }

  const updatedCategoryScore = Math.max(0, Math.min(100, current[category] + delta));

  const newProfile = {
    ...current,
    [category]: updatedCategoryScore,
    hintsUsedCount: hintsCount,
    successfulDeductionsCount: successCount,
    failedAttemptsCount: failCount,
    totalVerificationsCount: verifCount,
  };

  const avg = Math.round(
    (newProfile.enigmaMechanics +
      newProfile.cribAnalysis +
      newProfile.statisticalInterpretation +
      newProfile.searchStrategy +
      newProfile.configurationVerification) / 5
  );

  const event = {
    timestamp: Date.now(),
    category,
    outcome,
    delta,
    description,
  };

  return {
    ...newProfile,
    overallScore: avg,
    masteryLevel: computeMasteryLevel(avg),
    recentTelemetry: [event, ...current.recentTelemetry.slice(0, 49)],
  };
}

/**
 * Generates dynamic, contextual assistance based on active workstation parameters.
 */
export function generateContextualAssistance(context: {
  selectedCrib?: string;
  cribClashes?: number;
  totalSearchSpace?: number;
  activeStrategy?: string;
  candidateCount?: number;
  topScore?: number;
  runnerUpScore?: number;
  hillClimbingRestarts?: number;
}): ContextualAdvice | null {
  const {
    selectedCrib,
    cribClashes,
    totalSearchSpace,
    activeStrategy,
    candidateCount,
    topScore,
    runnerUpScore,
  } = context;

  // Case 1: Crib clashes detected
  if (selectedCrib && cribClashes && cribClashes > 0) {
    return {
      id: 'crib-clash-advice',
      severity: 'suggestion',
      title: 'Self-Encryption Elimination',
      message: `The crib "${selectedCrib}" produced ${cribClashes} character clash(es). Remember that Enigma can never encrypt a letter to itself.`,
      actionRecommendation: 'Inspect the non-clashing surviving alignments or test a shorter crib fragment.',
    };
  }

  // Case 2: Excessive search space
  if (totalSearchSpace && totalSearchSpace > 40000 && activeStrategy === 'EXHAUSTIVE') {
    return {
      id: 'search-space-warning',
      severity: 'warning',
      title: 'Large Combinatorial Search Space',
      message: `The configured search involves ${totalSearchSpace.toLocaleString()} permutations. This may take notable processing time.`,
      actionRecommendation: 'Narrow rotor position ranges or lock known wheel orders before executing.',
    };
  }

  // Case 3: Statistical confidence separation
  if (candidateCount && candidateCount >= 2 && topScore !== undefined && runnerUpScore !== undefined) {
    const diff = Math.abs(topScore - runnerUpScore);
    if (diff < 0.005) {
      return {
        id: 'candidate-tie-advice',
        severity: 'info',
        title: 'Close Statistical Scores',
        message: 'The top two candidate configurations have very similar statistical scores.',
        actionRecommendation: 'Transfer candidates to the Simulator to visually verify readability and word boundaries.',
      };
    }
  }

  // Case 4: General guidance
  if (activeStrategy === 'HILL_CLIMBING') {
    return {
      id: 'hill-climbing-info',
      severity: 'info',
      title: 'Plugboard Optimization Dynamics',
      message: 'Hill climbing mutates stecker pairs to ascend the statistical fitness landscape. Multiple random restarts help escape local optima.',
      actionRecommendation: 'Increase random restarts if plaintext remains scrambled.',
    };
  }

  return null;
}

/**
 * Procedurally generates a solvable, mathematically sound training challenge
 * matching the player's demonstrated skill profile and seed.
 */
export function generateAdaptiveChallenge(
  profile: PlayerProficiencyRecord,
  seed: number = 777
): ProceduralChallenge {
  const prng = new SeededPRNG(seed);
  const words = [
    'ADMIRALTYDISPATCHCONVOYARRIVEDSAFELYATPORTSMOUTH',
    'WEATHERSTATIONNORDSEETEMPERATUREEIGHTBAROMETERFALLING',
    'UBOATCOMMANDORDERSALLSUBMARINESRETURNTOPORTFORREFIT',
    'REICHSMARINEREPORTCLEARSEASVISIBILITYEXCELLENT',
  ];

  const chosenPlaintext = prng.choice(words);
  const rotors: [RotorType, RotorType, RotorType] = ['I', 'II', 'III'];
  const posL = String.fromCharCode(65 + prng.nextInt(0, 25));
  const posM = String.fromCharCode(65 + prng.nextInt(0, 25));
  const posR = String.fromCharCode(65 + prng.nextInt(0, 25));

  // Determine difficulty parameters based on profile
  const isBeginner = profile.overallScore < 40 || profile.difficultyPreference === 'Guided';
  const isVeteran = profile.overallScore >= 70 || profile.difficultyPreference === 'Veteran';

  let steckerPairs: string[] = [];
  let knownPositions: [string | null, string | null, string | null] = [posL, posM, null]; // right unknown by default
  let strategy: 'EXHAUSTIVE' | 'HILL_CLIMBING' | 'HYBRID' = 'EXHAUSTIVE';

  if (isBeginner) {
    steckerPairs = [];
    knownPositions = [posL, posM, null];
    strategy = 'EXHAUSTIVE';
  } else if (isVeteran) {
    steckerPairs = ['AV', 'BS', 'DL'];
    knownPositions = [posL, null, null];
    strategy = 'HYBRID';
  } else {
    steckerPairs = ['AV'];
    knownPositions = [posL, posM, null];
    strategy = 'EXHAUSTIVE';
  }

  const targetConfig: EnigmaMachineConfig = {
    rotors: [
      { type: rotors[0], position: posL, ringSetting: 1 },
      { type: rotors[1], position: posM, ringSetting: 1 },
      { type: rotors[2], position: posR, ringSetting: 1 },
    ],
    reflector: 'B',
    plugboard: steckerPairs,
  };

  const machine = new EnigmaMachine(targetConfig);
  const ciphertext = machine.encryptMessage(chosenPlaintext).outputText;

  return {
    id: `adaptive-ch-${seed}`,
    title: `Intelligence Intercept #${seed % 1000}`,
    briefing: `Radio intercept captured on frequency ${300 + (seed % 500)} kHz. Demonstrated analyst proficiency level: ${profile.masteryLevel}.`,
    ciphertext,
    plaintext: chosenPlaintext,
    targetConfig,
    knownSettings: {
      rotors,
      reflector: 'B',
      ringSettings: [1, 1, 1],
      knownPositions,
      knownPlugboard: steckerPairs,
      suggestedCrib: chosenPlaintext.substring(0, 10),
    },
    recommendedStrategy: strategy,
    difficultyScore: isVeteran ? 75 : isBeginner ? 25 : 50,
  };
}
