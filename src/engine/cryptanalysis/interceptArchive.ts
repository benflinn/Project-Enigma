import { EnigmaMachine, EnigmaMachineConfig, RotorType, ReflectorType } from '../enigma';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface KnownMachineSettings {
  rotorOrderKnown: boolean;
  knownRotorOrder?: [RotorType, RotorType, RotorType];
  possibleRotorTypes?: RotorType[];
  ringSettingsKnown: boolean;
  knownRingSettings?: [number, number, number];
  reflectorKnown: boolean;
  knownReflector?: ReflectorType;
  plugboardKnown: boolean;
  knownPlugboard?: string[];
  knownPositions?: [string | null, string | null, string | null]; // null means unknown
  suspectedCribs?: Array<{
    text: string;
    description: string;
    suggestedOffset?: number;
  }>;
}

export interface InterceptTrainingMessage {
  id: string;
  title: string;
  historicalContext: string;
  difficulty: DifficultyLevel;
  ciphertext: string;
  plaintext: string; // Internal truth (hidden from ordinary gameplay UI)
  secretConfig: EnigmaMachineConfig; // Internal truth
  playerKnowns: KnownMachineSettings;
  compatibleTechniques: Array<
    | 'CRIB_ANALYSIS'
    | 'INDEX_OF_COINCIDENCE'
    | 'SINGLE_ROTOR_SEARCH'
    | 'START_POSITION_SEARCH'
    | 'ROTOR_ORDER_SEARCH'
    | 'CHI_SQUARE_FITNESS'
  >;
  missionEligibility?: string[];
}

/**
 * Helper to compute deterministic ciphertext from plaintext using EnigmaMachine
 */
function generateCiphertext(plaintext: string, config: EnigmaMachineConfig): string {
  const machine = new EnigmaMachine(config);
  return machine.encryptMessage(plaintext).outputText;
}

// 1. Beginner 1: Station Alpha (Single rotor position unknown: Left=A, Mid=A, Right=?)
const CONFIG_ALPHA: EnigmaMachineConfig = {
  rotors: [
    { type: 'I', position: 'A', ringSetting: 1 },
    { type: 'II', position: 'A', ringSetting: 1 },
    { type: 'III', position: 'G', ringSetting: 1 },
  ],
  reflector: 'B',
  plugboard: [],
};
const PLAINTEXT_ALPHA = 'WEATHERREPORTTEMPTWELVEBAROMETERSTEADYSEASMODERATE';
const CIPHERTEXT_ALPHA = generateCiphertext(PLAINTEXT_ALPHA, CONFIG_ALPHA);

// 2. Beginner 2: Luftwaffe Flak (Left=M, Mid=F, Right=?)
const CONFIG_BRAVO: EnigmaMachineConfig = {
  rotors: [
    { type: 'II', position: 'M', ringSetting: 1 },
    { type: 'I', position: 'F', ringSetting: 1 },
    { type: 'III', position: 'K', ringSetting: 1 },
  ],
  reflector: 'B',
  plugboard: ['AV', 'BS'],
};
const PLAINTEXT_BRAVO = 'DEFENSEBATTERIESREADYFOROPERATIONALLRADARACTIVE';
const CIPHERTEXT_BRAVO = generateCiphertext(PLAINTEXT_BRAVO, CONFIG_BRAVO);

// 3. Intermediate 1: Kriegsmarine Patrol (All 3 positions unknown: C-F-X)
const CONFIG_CHARLIE: EnigmaMachineConfig = {
  rotors: [
    { type: 'I', position: 'C', ringSetting: 1 },
    { type: 'IV', position: 'F', ringSetting: 1 },
    { type: 'III', position: 'X', ringSetting: 1 },
  ],
  reflector: 'B',
  plugboard: [],
};
const PLAINTEXT_CHARLIE = 'CONVOYESCORTARRIVEDATPOINTCHARLIEAWAITINGORDERS';
const CIPHERTEXT_CHARLIE = generateCiphertext(PLAINTEXT_CHARLIE, CONFIG_CHARLIE);

// 4. Intermediate 2: Biscay U-Boat (Crib: WETTERBERICHT at offset 0, positions B-E-T)
const CONFIG_DELTA: EnigmaMachineConfig = {
  rotors: [
    { type: 'III', position: 'B', ringSetting: 1 },
    { type: 'II', position: 'E', ringSetting: 1 },
    { type: 'I', position: 'T', ringSetting: 1 },
  ],
  reflector: 'B',
  plugboard: ['DL', 'FU'],
};
const PLAINTEXT_DELTA = 'WETTERBERICHTNORDSEEWINDSTARKESEEACHTKLAERUNG';
const CIPHERTEXT_DELTA = generateCiphertext(PLAINTEXT_DELTA, CONFIG_DELTA);

// 5. Advanced 1: High Command (Rotor order from {I, II, III} + start positions D-A-W)
const CONFIG_ECHO: EnigmaMachineConfig = {
  rotors: [
    { type: 'II', position: 'D', ringSetting: 1 },
    { type: 'III', position: 'A', ringSetting: 1 },
    { type: 'I', position: 'W', ringSetting: 1 },
  ],
  reflector: 'B',
  plugboard: [],
};
const PLAINTEXT_ECHO = 'GENERALATTACKPOSTPONEDUNTILDAWNSUPPLIESARRIVING';
const CIPHERTEXT_ECHO = generateCiphertext(PLAINTEXT_ECHO, CONFIG_ECHO);

// 6. Advanced 2: North Atlantic U-Flotilla (Rotor subset IV-II-V + positions N-O-R + Stecker)
const CONFIG_FOXTROT: EnigmaMachineConfig = {
  rotors: [
    { type: 'IV', position: 'N', ringSetting: 1 },
    { type: 'II', position: 'O', ringSetting: 1 },
    { type: 'V', position: 'R', ringSetting: 1 },
  ],
  reflector: 'B',
  plugboard: ['OW', 'RX'],
};
const PLAINTEXT_FOXTROT = 'WOLFPACKCONVERGEATGRIDFOURTYNINEREFUELINGATDUSK';
const CIPHERTEXT_FOXTROT = generateCiphertext(PLAINTEXT_FOXTROT, CONFIG_FOXTROT);

// 7. Mission 4 / Advanced: Submarine Command Wolfpack (Plugboard optimization focus: Rotors II-IV-V, pos E-N-I, Stecker: AV, BS, DL, FU)
const CONFIG_GOLF: EnigmaMachineConfig = {
  rotors: [
    { type: 'II', position: 'E', ringSetting: 1 },
    { type: 'IV', position: 'N', ringSetting: 1 },
    { type: 'V', position: 'I', ringSetting: 1 },
  ],
  reflector: 'B',
  plugboard: ['AV', 'BS', 'DL', 'FU'],
};
const PLAINTEXT_GOLF = 'SUBMARINESCONVERGEATGRIDTWELVETORPEDOLOADEDANDREADY';
const CIPHERTEXT_GOLF = generateCiphertext(PLAINTEXT_GOLF, CONFIG_GOLF);

// 8. Mission 5 / Advanced: Bismarck Escort Squadron (Hybrid search focus: Rotors I-III-V, pos B-M-?, Stecker: CG, HZ, IN)
const CONFIG_HOTEL: EnigmaMachineConfig = {
  rotors: [
    { type: 'I', position: 'B', ringSetting: 1 },
    { type: 'III', position: 'M', ringSetting: 1 },
    { type: 'V', position: 'K', ringSetting: 1 },
  ],
  reflector: 'B',
  plugboard: ['CG', 'HZ', 'IN'],
};
const PLAINTEXT_HOTEL = 'BATTLESHIPSETCOURSEFORBRESTREFUELINGATPOINTVICTOR';
const CIPHERTEXT_HOTEL = generateCiphertext(PLAINTEXT_HOTEL, CONFIG_HOTEL);

// 9. Mission 6 / Master: Reichsmarine High-Command Dispatch (Open-ended Analyst Desk: Rotors III-I-II, pos F-I-X, Stecker: KM, OW, RX)
const CONFIG_INDIA: EnigmaMachineConfig = {
  rotors: [
    { type: 'III', position: 'F', ringSetting: 1 },
    { type: 'I', position: 'I', ringSetting: 1 },
    { type: 'II', position: 'X', ringSetting: 1 },
  ],
  reflector: 'B',
  plugboard: ['KM', 'OW', 'RX'],
};
const PLAINTEXT_INDIA = 'SPECIALDISPATCHSECRETOPERATIONKREUZOTTERCOMMENCINGNOW';
const CIPHERTEXT_INDIA = generateCiphertext(PLAINTEXT_INDIA, CONFIG_INDIA);

export const TRAINING_MESSAGES: InterceptTrainingMessage[] = [
  {
    id: 'intercept-101-alpha',
    title: 'Naval Weather Station Alpha',
    historicalContext:
      'A routine coastal observation broadcast from Station Alpha on 120 kHz. Direction-finding confirms transmitter in the Heligoland Bight. Bletchley intelligence confirmed daily rotor wheels I-II-III and ring settings.',
    difficulty: 'beginner',
    ciphertext: CIPHERTEXT_ALPHA,
    plaintext: PLAINTEXT_ALPHA,
    secretConfig: CONFIG_ALPHA,
    playerKnowns: {
      rotorOrderKnown: true,
      knownRotorOrder: ['I', 'II', 'III'],
      ringSettingsKnown: true,
      knownRingSettings: [1, 1, 1],
      reflectorKnown: true,
      knownReflector: 'B',
      plugboardKnown: true,
      knownPlugboard: [],
      knownPositions: ['A', 'A', null], // only right rotor is unknown
      suspectedCribs: [
        {
          text: 'WEATHER',
          description: 'Standard opening meteorology prefix',
          suggestedOffset: 0,
        },
      ],
    },
    compatibleTechniques: ['SINGLE_ROTOR_SEARCH', 'CRIB_ANALYSIS', 'INDEX_OF_COINCIDENCE'],
    missionEligibility: ['mission-3'],
  },
  {
    id: 'intercept-102-bravo',
    title: 'Luftwaffe Flak Defense Sector',
    historicalContext:
      'A tactical defense report sent to airfield command. Captured day-sheet confirms Rotors II-I-III with plugboard connections A-V and B-S. Left and middle rotor positions are verified as M and F.',
    difficulty: 'beginner',
    ciphertext: CIPHERTEXT_BRAVO,
    plaintext: PLAINTEXT_BRAVO,
    secretConfig: CONFIG_BRAVO,
    playerKnowns: {
      rotorOrderKnown: true,
      knownRotorOrder: ['II', 'I', 'III'],
      ringSettingsKnown: true,
      knownRingSettings: [1, 1, 1],
      reflectorKnown: true,
      knownReflector: 'B',
      plugboardKnown: true,
      knownPlugboard: ['AV', 'BS'],
      knownPositions: ['M', 'F', null],
      suspectedCribs: [
        {
          text: 'DEFENSE',
          description: 'Sector unit identifier',
          suggestedOffset: 0,
        },
      ],
    },
    compatibleTechniques: ['SINGLE_ROTOR_SEARCH', 'CRIB_ANALYSIS', 'CHI_SQUARE_FITNESS'],
  },
  {
    id: 'intercept-201-charlie',
    title: 'Kriegsmarine Patrol Orders',
    historicalContext:
      'Surface escort deployment transmission. Daily wheel order I-IV-III is known from recovered documents, but message key indicators were not logged. All three rotor positions must be searched.',
    difficulty: 'intermediate',
    ciphertext: CIPHERTEXT_CHARLIE,
    plaintext: PLAINTEXT_CHARLIE,
    secretConfig: CONFIG_CHARLIE,
    playerKnowns: {
      rotorOrderKnown: true,
      knownRotorOrder: ['I', 'IV', 'III'],
      ringSettingsKnown: true,
      knownRingSettings: [1, 1, 1],
      reflectorKnown: true,
      knownReflector: 'B',
      plugboardKnown: true,
      knownPlugboard: [],
      knownPositions: [null, null, null],
      suspectedCribs: [
        {
          text: 'CONVOY',
          description: 'Escort order subject',
          suggestedOffset: 0,
        },
      ],
    },
    compatibleTechniques: ['START_POSITION_SEARCH', 'INDEX_OF_COINCIDENCE', 'CRIB_ANALYSIS'],
  },
  {
    id: 'intercept-202-delta',
    title: 'Biscay U-Boat Weather Broadcast',
    historicalContext:
      'Signals intelligence intercept matching routine submarine weather traffic. Transmissions at 0800 hours traditionally begin with the German meteorological crib "WETTERBERICHT".',
    difficulty: 'intermediate',
    ciphertext: CIPHERTEXT_DELTA,
    plaintext: PLAINTEXT_DELTA,
    secretConfig: CONFIG_DELTA,
    playerKnowns: {
      rotorOrderKnown: true,
      knownRotorOrder: ['III', 'II', 'I'],
      ringSettingsKnown: true,
      knownRingSettings: [1, 1, 1],
      reflectorKnown: true,
      knownReflector: 'B',
      plugboardKnown: true,
      knownPlugboard: ['DL', 'FU'],
      knownPositions: [null, null, null],
      suspectedCribs: [
        {
          text: 'WETTERBERICHT',
          description: 'Weather report standard German crib',
          suggestedOffset: 0,
        },
      ],
    },
    compatibleTechniques: ['CRIB_ANALYSIS', 'START_POSITION_SEARCH', 'CHI_SQUARE_FITNESS'],
    missionEligibility: ['mission-2'],
  },
  {
    id: 'intercept-301-echo',
    title: 'High Command Tactical Directive',
    historicalContext:
      'Priority telegram from Army Group Centre. The three rotors are known to be chosen from wheels I, II, and III, but the order and initial starting positions are unconfirmed.',
    difficulty: 'advanced',
    ciphertext: CIPHERTEXT_ECHO,
    plaintext: PLAINTEXT_ECHO,
    secretConfig: CONFIG_ECHO,
    playerKnowns: {
      rotorOrderKnown: false,
      possibleRotorTypes: ['I', 'II', 'III'],
      ringSettingsKnown: true,
      knownRingSettings: [1, 1, 1],
      reflectorKnown: true,
      knownReflector: 'B',
      plugboardKnown: true,
      knownPlugboard: [],
      knownPositions: [null, null, null],
      suspectedCribs: [
        {
          text: 'GENERAL',
          description: 'Command salutation',
          suggestedOffset: 0,
        },
      ],
    },
    compatibleTechniques: ['ROTOR_ORDER_SEARCH', 'START_POSITION_SEARCH', 'INDEX_OF_COINCIDENCE'],
  },
  {
    id: 'intercept-302-foxtrot',
    title: 'North Atlantic U-Flotilla Rendezvous',
    historicalContext:
      'Encrypted wolfpack coordination transmission. Station triangulation places origin in the Bay of Biscay. Captured naval codebook confirms Stecker pairs O-W and R-X.',
    difficulty: 'advanced',
    ciphertext: CIPHERTEXT_FOXTROT,
    plaintext: PLAINTEXT_FOXTROT,
    secretConfig: CONFIG_FOXTROT,
    playerKnowns: {
      rotorOrderKnown: false,
      possibleRotorTypes: ['II', 'IV', 'V'],
      ringSettingsKnown: true,
      knownRingSettings: [1, 1, 1],
      reflectorKnown: true,
      knownReflector: 'B',
      plugboardKnown: true,
      knownPlugboard: ['OW', 'RX'],
      knownPositions: [null, null, null],
      suspectedCribs: [
        {
          text: 'WOLFPACK',
          description: 'Submarine tactical group',
          suggestedOffset: 0,
        },
      ],
    },
    compatibleTechniques: ['ROTOR_ORDER_SEARCH', 'START_POSITION_SEARCH', 'CHI_SQUARE_FITNESS'],
  },
  {
    id: 'intercept-401-golf',
    title: 'Submarine Command Wolfpack (Grid 12)',
    historicalContext:
      'Intercepted operational command for Atlantic wolfpack deployment. Rotors II-IV-V and starting positions E-N-I are recovered from a captured weather trawler log, but multiple Stecker connections remain unknown. Intelligence notes reference mysterious transmission routing code "ORION-7".',
    difficulty: 'advanced',
    ciphertext: CIPHERTEXT_GOLF,
    plaintext: PLAINTEXT_GOLF,
    secretConfig: CONFIG_GOLF,
    playerKnowns: {
      rotorOrderKnown: true,
      knownRotorOrder: ['II', 'IV', 'V'],
      ringSettingsKnown: true,
      knownRingSettings: [1, 1, 1],
      reflectorKnown: true,
      knownReflector: 'B',
      plugboardKnown: false,
      knownPlugboard: ['AV'], // Player knows AV from clue; BS, DL, FU to be discovered via Hill Climbing
      knownPositions: ['E', 'N', 'I'],
      suspectedCribs: [
        {
          text: 'SUBMARINES',
          description: 'U-Boat fleet identifier',
          suggestedOffset: 0,
        },
      ],
    },
    compatibleTechniques: ['CHI_SQUARE_FITNESS', 'CRIB_ANALYSIS'],
    missionEligibility: ['mission-4'],
  },
  {
    id: 'intercept-402-hotel',
    title: 'Battleship Escort Squadron Victor',
    historicalContext:
      'High-priority tactical movement order for capital ships breaking out into the Atlantic. Wheel order is locked to Rotors I-III-V at ring settings 1-1-1. Rotor positions B-M-? have one unknown wheel, and plugboard steckers must be optimized.',
    difficulty: 'advanced',
    ciphertext: CIPHERTEXT_HOTEL,
    plaintext: PLAINTEXT_HOTEL,
    secretConfig: CONFIG_HOTEL,
    playerKnowns: {
      rotorOrderKnown: true,
      knownRotorOrder: ['I', 'III', 'V'],
      ringSettingsKnown: true,
      knownRingSettings: [1, 1, 1],
      reflectorKnown: true,
      knownReflector: 'B',
      plugboardKnown: false,
      knownPlugboard: ['CG'], // Player knows CG; HZ, IN to be discovered via Hybrid search
      knownPositions: ['B', 'M', null],
      suspectedCribs: [
        {
          text: 'BATTLESHIP',
          description: 'Naval vessel class',
          suggestedOffset: 0,
        },
      ],
    },
    compatibleTechniques: ['START_POSITION_SEARCH', 'CRIB_ANALYSIS', 'CHI_SQUARE_FITNESS'],
    missionEligibility: ['mission-5'],
  },
  {
    id: 'intercept-403-india',
    title: 'Reichsmarine Dispatch (Operation Kreuzotter)',
    historicalContext:
      'Top-secret strategic directive intercepted by Government Code and Cypher School (Bletchley Park). Multiple investigative routes exist: crib dragging against known naval operational codenames, statistical language analysis, or multi-stage hybrid search.',
    difficulty: 'advanced',
    ciphertext: CIPHERTEXT_INDIA,
    plaintext: PLAINTEXT_INDIA,
    secretConfig: CONFIG_INDIA,
    playerKnowns: {
      rotorOrderKnown: true,
      knownRotorOrder: ['III', 'I', 'II'],
      ringSettingsKnown: true,
      knownRingSettings: [1, 1, 1],
      reflectorKnown: true,
      knownReflector: 'B',
      plugboardKnown: false,
      knownPlugboard: ['KM'],
      knownPositions: ['F', 'I', 'X'],
      suspectedCribs: [
        {
          text: 'SPECIALDISPATCH',
          description: 'Standard administrative header',
          suggestedOffset: 0,
        },
      ],
    },
    compatibleTechniques: ['CRIB_ANALYSIS', 'START_POSITION_SEARCH', 'CHI_SQUARE_FITNESS', 'INDEX_OF_COINCIDENCE'],
    missionEligibility: ['mission-6'],
  },
];

export function getTrainingMessageById(id: string): InterceptTrainingMessage | undefined {
  return TRAINING_MESSAGES.find((m) => m.id === id);
}
