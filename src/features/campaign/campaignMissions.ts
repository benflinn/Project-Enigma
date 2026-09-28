export interface MissionStep {
  id: string;
  title: string;
  instruction: string;
  explanation?: string;
  hints: string[];
  targetAction?:
    | 'PRESS_ANY_KEY'
    | 'PRESS_A_REPEATEDLY'
    | 'ANSWER_QUESTION'
    | 'RESET_MACHINE'
    | 'DRAG_CRIB'
    | 'RUN_SEARCH'
    | 'TRANSFER_SIMULATOR'
    | 'COMPLETE';
  question?: {
    prompt: string;
    choices: string[];
    correctIndex: number;
    explanation: string;
  };
  requiredKeystrokes?: number;
  highlightedElement?: string;
}

export interface CampaignMission {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedMinutes: number;
  interceptId?: string;
  steps: MissionStep[];
  unlockedReward?: string;
}

export interface MasteryChallenge {
  id: string;
  title: string;
  concept: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  rewardUnlock: string;
}

// ================= MISSION 1 =================
export const MISSION_1: CampaignMission = {
  id: 'mission-1-first-message',
  number: 1,
  title: 'Your First Encrypted Message',
  subtitle: 'Rotor Advancement & Polyalphabetic Cipher Foundations',
  description:
    'Discover how the physical Enigma machine steps its rotors on every keypress and why repeated letters never produce the same ciphertext character.',
  difficulty: 'Beginner',
  estimatedMinutes: 5,
  unlockedReward: 'Physical Simulator & Signal Tracing',
  steps: [
    {
      id: 'm1_intro',
      title: 'Mission Briefing: Your First Encrypted Message',
      instruction:
        'Welcome to Bletchley Park. Before we can break enemy ciphers, you must understand how the military Enigma machine operates. Begin by inspecting the machine.',
      explanation:
        'The German military Enigma I is an electromechanical cipher machine with three rotating wheels (rotors), a reflector, a lampboard, and a plugboard.',
      hints: ['Click "Begin Investigation" to start hands-on testing.'],
    },
    {
      id: 'm1_first_key',
      title: 'Step 1: The Initial Contact',
      instruction: 'Press ANY letter on the keyboard below.',
      targetAction: 'PRESS_ANY_KEY',
      highlightedElement: 'keyboard',
      hints: [
        'Click any key on the virtual keyboard, or press a letter on your physical keyboard.',
        'For example, press the letter "A".',
      ],
    },
    {
      id: 'm1_observe_lamp_and_rotor',
      title: 'Step 2: Dual Reaction',
      instruction:
        'Notice two simultaneous events: a lamp illuminated on the lampboard, AND the right rotor stepped forward by one letter.',
      explanation:
        'Every time an operator presses a key, mechanical pawls advance the rightmost rotor BEFORE electrical current passes through the rotor maze to light up the encrypted letter.',
      highlightedElement: 'rotors',
      hints: [
        'Look at the rotor windows above the keyboard to see the position letter change.',
        'Click "Continue" when you are ready to test uniform input sequences.',
      ],
    },
    {
      id: 'm1_repeated_a',
      title: 'Step 3: The Uniform Input Test',
      instruction: 'Now, press the letter "A" repeatedly 4 times.',
      targetAction: 'PRESS_A_REPEATEDLY',
      requiredKeystrokes: 4,
      highlightedElement: 'keyboard',
      hints: [
        'Type "A" four times on your keyboard.',
        'Watch both the illuminated lamps and the right rotor advancing on each keystroke.',
      ],
    },
    {
      id: 'm1_discovery_question',
      title: 'Step 4: Cryptanalytic Deduction',
      instruction: 'Examine your output tape above. When you pressed "A" repeatedly, what happened to the output?',
      targetAction: 'ANSWER_QUESTION',
      highlightedElement: 'output-tape',
      question: {
        prompt: 'When you pressed "A" four times in succession, what happened to the output letters?',
        choices: [
          'The exact same letter illuminated all four times.',
          'Different letters illuminated because the rotor stepped forward each time.',
          'The machine locked up and produced no output.',
        ],
        correctIndex: 1,
        explanation:
          'Because the rotor advances with each stroke, the internal wiring circuit changes for every single letter, producing a polyalphabetic substitution cipher.',
      },
      hints: [
        'Look at the sequence of letters generated on the output display.',
        'Did "A" always encrypt to the exact same letter, or did the output change?',
      ],
    },
    {
      id: 'm1_explanation_polyalphabetic',
      title: 'Step 5: The Polyalphabetic Principle',
      instruction: 'Review the mathematical foundation of Enigma.',
      explanation:
        'Unlike a simple monoalphabetic substitution cipher (where "A" always becomes "X"), Enigma is polyalphabetic. Because the rotor advances on each stroke, the internal circuit is different for every character. Furthermore, because of the Reflector (Umkehrwalze), a letter can NEVER encrypt to itself!',
      hints: ['Read through the discovery notes, then proceed to test reciprocal decryption.'],
    },
    {
      id: 'm1_reciprocal_test',
      title: 'Step 6: Symmetrical Encryption & Decryption',
      instruction:
        'Enigma is reciprocal: if you reset the machine to its starting state and type the ciphertext, you get your original message back! Click "Reset Machine to Initial State".',
      targetAction: 'RESET_MACHINE',
      highlightedElement: 'reset-btn',
      hints: ['Click the "Reset to Start" button on the control panel to return rotors to their starting positions.'],
    },
    {
      id: 'm1_completed',
      title: 'Mission Complete: Recruit Decryption Specialist',
      instruction:
        'Congratulations! You have mastered the fundamental mechanics of the Wehrmacht Enigma machine.',
      explanation:
        'You now know that Enigma: 1. Advances rotors on every keystroke. 2. Produces a polyalphabetic ciphertext. 3. Never encrypts a letter to itself. 4. Is reciprocal for identical initial settings.',
      targetAction: 'COMPLETE',
      hints: ['You are now ready to tackle Mission 2: Finding a Clue!'],
    },
  ],
};

// ================= MISSION 2 =================
export const MISSION_2: CampaignMission = {
  id: 'mission-2-finding-a-clue',
  number: 2,
  title: 'Finding a Clue: The Crib',
  subtitle: 'Crib Dragging & Self-Encryption Elimination',
  description:
    'Learn how British intelligence exploited German routine habits using suspected plaintext fragments (cribs) and Enigma’s fatal non-self-encryption flaw.',
  difficulty: 'Intermediate',
  estimatedMinutes: 8,
  interceptId: 'intercept-202-delta',
  unlockedReward: 'Interactive Crib-Testing Tool',
  steps: [
    {
      id: 'm2_intro',
      title: 'Mission Briefing: Routine Traffic in the Bay of Biscay',
      instruction:
        'We have intercepted an encrypted Kriegsmarine transmission from a U-boat in the Bay of Biscay. German operators broadcast daily weather reports at 0800 hours using standard formats.',
      explanation:
        'In cryptanalysis, a suspected piece of plaintext is called a "crib". Weather transmissions almost always begin with the German word "WETTERBERICHT" (Weather Report).',
      hints: ['Click "Begin Crib Analysis" to start testing suspected words.'],
    },
    {
      id: 'm2_non_self_encryption_rule',
      title: 'Step 1: The Fatal Reflector Flaw',
      instruction: 'Understand Enigma’s most critical mathematical vulnerability.',
      explanation:
        'Inside Enigma, electrical current flows through the plugboard, three rotors, hits the Reflector (Umkehrwalze), and returns back along a paired wire. Because the reflector connects contacts in pairs, a letter CAN NEVER encrypt to itself! An "E" can never become an "E", and a "W" can never become a "W".',
      hints: ['Remember: If ciphertext letter = plaintext letter, that position is 100% impossible.'],
    },
    {
      id: 'm2_collision_quiz',
      title: 'Step 2: Detecting Alignment Clashes',
      instruction: 'Test your understanding of self-encryption elimination.',
      targetAction: 'ANSWER_QUESTION',
      question: {
        prompt:
          'Suppose the first letter of ciphertext is "W". Can the crib "WETTERBERICHT" (which begins with "W") start at index 0?',
        choices: [
          'Yes, because "W" turning into "W" is a lucky direct match.',
          'No, because Enigma can NEVER encrypt a letter to itself (W cannot become W).',
          'It depends on which reflector (B or C) is installed.',
        ],
        correctIndex: 1,
        explanation:
          'Correct! If the ciphertext has "W" at index 0 and the crib has "W" at index 0, that alignment creates a clash (collision) and is mathematically impossible.',
      },
      hints: [
        'Think about the reflector circuit: Can any current loop back to the exact same key that was pressed?',
      ],
    },
    {
      id: 'm2_drag_crib',
      title: 'Step 3: Dragging the Crib Across Ciphertext',
      instruction:
        'In the Crib-Testing tool, we slide ("drag") the word WETTERBERICHT across every index of the ciphertext. Click "Inspect Alignments" to evaluate surviving placements.',
      explanation:
        'At each offset, we compare every letter of the crib against the ciphertext letter above it. If even ONE letter clashes, the entire offset is eliminated.',
      targetAction: 'DRAG_CRIB',
      hints: ['Inspect the surviving vs eliminated alignments in the crib analysis summary.'],
    },
    {
      id: 'm2_surviving_deduction',
      title: 'Step 4: Plausible vs. Verified Alignments',
      instruction: 'Interpret what a surviving alignment really means.',
      targetAction: 'ANSWER_QUESTION',
      question: {
        prompt:
          'If a suspected crib alignment survives with ZERO letter clashes, does that prove the crib is in the exact right position?',
        choices: [
          'Yes, surviving the clash test guarantees the decryption is solved.',
          'No, it only proves the alignment is plausible; we still need to find the rotor settings that generate it.',
          'No, it means the message was encrypted with a different machine.',
        ],
        correctIndex: 1,
        explanation:
          'Precisely! Non-self-encryption eliminates impossible positions, narrowing down the search space. Surviving offsets provide high-probability targets for automated rotor searches.',
      },
      hints: ['Consider whether avoiding a clash is proof of truth or merely proof of possibility.'],
    },
    {
      id: 'm2_completed',
      title: 'Mission Complete: Crib Specialist Certified',
      instruction:
        'Superb deduction! You now understand how Bletchley Park cryptanalysts used crib dragging to drastically reduce Enigma’s key search space.',
      explanation:
        'You have unlocked the Crib-Testing Tool in the Workstation. In Mission 3, you will use verified cribs to execute your first automated configuration search.',
      targetAction: 'COMPLETE',
      hints: ['Proceed to Mission 3: Your First Automated Breakthrough!'],
    },
  ],
};

// ================= MISSION 3 =================
export const MISSION_3: CampaignMission = {
  id: 'mission-3-automated-breakthrough',
  number: 3,
  title: 'Your First Automated Breakthrough',
  subtitle: 'Bounded Search Execution & Simulator Verification',
  description:
    'Execute a multi-threaded automated configuration search on an intercepted naval transmission, identify the correct rotor position, and verify plaintext recovery.',
  difficulty: 'Advanced',
  estimatedMinutes: 10,
  interceptId: 'intercept-101-alpha',
  unlockedReward: 'Automated Search Engine & Advanced Workstation',
  steps: [
    {
      id: 'm3_intro',
      title: 'Mission Briefing: Coastal Station Alpha Intercept',
      instruction:
        'Naval intelligence has intercepted transmission ALPHA from Heligoland Bight. Captured code sheets confirm the daily wheel order is Rotors I-II-III with default ring settings. Left and middle rotors are locked at [A] and [A]. Only the right rotor position is unknown.',
      explanation:
        'Instead of searching all 17,576 rotor combinations, our intelligence narrows the search space to just 26 possible right-rotor positions (A through Z).',
      hints: ['Click "Begin Automated Attack" to configure the bounded search.'],
    },
    {
      id: 'm3_keyspace_question',
      title: 'Step 1: The Power of Bounded Searches',
      instruction: 'Evaluate the efficiency of intelligence-bounded attacks.',
      targetAction: 'ANSWER_QUESTION',
      question: {
        prompt:
          'If rotor order (I-II-III) and the left two rotor positions [A, A] are known, how many starting positions must our automated solver test?',
        choices: [
          '17,576 configurations (26 × 26 × 26)',
          '26 configurations (one for each letter of the right rotor)',
          '150,000,000 configurations (including all steckers)',
        ],
        correctIndex: 1,
        explanation:
          'Exact! Because only the right rotor position is unknown, the search space is bounded to exactly 26 evaluations, making instant browser decryption possible.',
      },
      hints: ['Count how many letters exist on a single Enigma rotor wheel.'],
    },
    {
      id: 'm3_run_search',
      title: 'Step 2: Launch the Automated Solver',
      instruction:
        'Open the Automated Search tool on Intercept Alpha and click "Launch Search". Observe the real-time speed and score convergence graph.',
      explanation:
        'The Web Worker decrypts the ciphertext for each candidate setting and calculates its Index of Coincidence and Quadgram fitness score.',
      targetAction: 'RUN_SEARCH',
      hints: ['Navigate to the Automated Search tab and click "Launch Search".'],
    },
    {
      id: 'm3_identify_candidate',
      title: 'Step 3: Analyze the Discovered Candidates',
      instruction: 'Inspect the resulting candidates table. What starting position produces clear German/English plaintext?',
      targetAction: 'ANSWER_QUESTION',
      question: {
        prompt:
          'Which right rotor starting position yielded the highest statistical score and readable plaintext "WEATHERREPORTTEMPTWELVE..."?',
        choices: [
          'Position "A" (Rotors I-II-III at AAA)',
          'Position "G" (Rotors I-II-III at AAG)',
          'Position "Z" (Rotors I-II-III at AAZ)',
        ],
        correctIndex: 1,
        explanation:
          'Outstanding! Starting position "G" (Rotors I-II-III at [A A G]) achieves the highest statistical score and unlocks the weather report plaintext.',
      },
      hints: ['Check the top candidate (#1) in the results table for Intercept Alpha.'],
    },
    {
      id: 'm3_transfer_simulator',
      title: 'Step 4: Verify on the Authentic Simulator',
      instruction:
        'Click "Transfer to Simulator" on Candidate #1. Switch to the Enigma Simulator tab and verify that typing the ciphertext reproduces the plaintext.',
      explanation:
        'Authentic cryptanalysis requires physical verification. Transferring the key restores the exact rotor positions, ring settings, and plugboard.',
      targetAction: 'TRANSFER_SIMULATOR',
      hints: ['Click "Transfer to Simulator" on candidate #1, then check the simulator view.'],
    },
    {
      id: 'm3_completed',
      title: 'Campaign Breakthrough: Cryptanalyst Mastered!',
      instruction:
        'Congratulations! You have conducted a complete cryptanalytic operation from intercept analysis to automated breaking and simulator verification.',
      explanation:
        'You have unlocked Advanced Mode in the Cryptanalysis Workstation, giving you unrestricted control over rotor permutations, custom position ranges, and statistical scoring models.',
      targetAction: 'COMPLETE',
      hints: ['Explore the unrestricted Workstation or attempt Mastery Challenges!'],
    },
  ],
};

// ================= MASTERY CHALLENGES =================
export const MASTERY_CHALLENGES: MasteryChallenge[] = [
  {
    id: 'mastery-1-collision-detection',
    title: 'Challenge 1: Crib Collision Inspection',
    concept: 'Non-Self-Encryption Principle',
    prompt:
      'Given ciphertext "H K M T Z P" and candidate crib "B E R L I N", which index contains an impossible collision (self-encryption clash)?',
    choices: [
      'Index 0 (H vs B)',
      'Index 3 (T vs L)',
      'Index 4 (Z vs I)',
      'There are no collisions in this alignment',
    ],
    correctIndex: 3,
    explanation:
      'Comparing letter by letter: H!=B, K!=E, M!=R, T!=L, Z!=I, P!=N. None of the pairs match, so this alignment is plausible (zero clashes).',
    rewardUnlock: 'Advanced Crib Diagnostics',
  },
  {
    id: 'mastery-2-rotor-permutations',
    title: 'Challenge 2: Wheel Order Permutations',
    concept: 'Combinatorial Keyspace Mathematics',
    prompt:
      'The German military Enigma I has 5 available rotor wheels (I through V). How many distinct 3-rotor orders (permutations) can be chosen and arranged in the machine?',
    choices: [
      '15 permutations (5 + 4 + 3)',
      '60 permutations (5 × 4 × 3)',
      '125 permutations (5 × 5 × 5)',
      '10 permutations (5! / (3! 2!))',
    ],
    correctIndex: 1,
    explanation:
      'The number of ordered arrangements of 3 distinct rotors chosen from 5 is $5 \\times 4 \\times 3 = 60$ permutations.',
    rewardUnlock: 'Full 5-Wheel Permutation Selector',
  },
  {
    id: 'mastery-3-ic-distinction',
    title: 'Challenge 3: Statistical Index of Coincidence',
    concept: 'Statistical Plaintext Identification',
    prompt:
      'An automated search decrypts three candidate texts of 100 characters. Text A has IoC = 0.038, Text B has IoC = 0.041, and Text C has IoC = 0.067. Which candidate is most likely genuine English plaintext?',
    choices: [
      'Text A (IoC = 0.038)',
      'Text B (IoC = 0.041)',
      'Text C (IoC = 0.067)',
      'All three have equal likelihood',
    ],
    correctIndex: 2,
    explanation:
      'Natural English language text has an expected Index of Coincidence of ~0.0667, whereas random polyalphabetic noise yields ~0.0385. Text C is the clear plaintext.',
    rewardUnlock: 'Automated IoC Threshold Analyzer',
  },
];

export const ALL_MISSIONS = [MISSION_1, MISSION_2, MISSION_3];
