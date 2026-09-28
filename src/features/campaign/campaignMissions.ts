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

// ================= MISSION 4 =================
export const MISSION_4: CampaignMission = {
  id: 'mission-4-plugboard-problem',
  number: 4,
  title: 'The Plugboard Problem',
  subtitle: 'Steckerbrett Combinatorics & Hill-Climbing Optimization',
  description:
    'Confront Enigma’s greatest defense: the front plugboard. Learn why brute-force is mathematically impossible and use stochastic hill climbing with random restarts to recover unknown stecker cables.',
  difficulty: 'Intermediate',
  estimatedMinutes: 10,
  interceptId: 'intercept-401-golf',
  unlockedReward: 'Plugboard Hill-Climbing Solver',
  steps: [
    {
      id: 'm4_intro',
      title: 'Mission Briefing: Submarine Command Wolfpack',
      instruction:
        'Direction-finding has intercepted a high-priority U-boat fleet command. Captured documents reveal Rotors II-IV-V and starting positions [E, N, I], with plugboard pair A-V confirmed. However, three additional plugboard pairs remain unknown.',
      explanation:
        'With 10 plugboard cables connected, there are over 150 trillion possible cable combinations. Exhaustive search would take thousands of years. Instead, we use stochastic hill climbing.',
      hints: ['Click "Begin Investigation" to analyze the plugboard problem.'],
    },
    {
      id: 'm4_keyspace_question',
      title: 'Step 1: The Combinatorial Explosion',
      instruction: 'Evaluate the security provided by the Enigma Steckerbrett.',
      targetAction: 'ANSWER_QUESTION',
      question: {
        prompt:
          'Why did the German military add the plugboard (Steckerbrett) to the commercial Enigma?',
        choices: [
          'To make the machine physically heavier and harder to steal.',
          'To add an astronomical number of reciprocal substitution pairings (over 150 trillion for 10 pairs), rendering exhaustive brute-force impossible.',
          'To allow operators to type in lowercase letters.',
        ],
        correctIndex: 1,
        explanation:
          'Exactly! The plugboard introduces $150,738,274,937,250$ possible 10-pair configurations, transforming Enigma from a breakable rotor machine into an intractable cipher for pure brute-force.',
      },
      hints: ['Consider how swapping letters on entry and exit multiplies the key combinations.'],
    },
    {
      id: 'm4_launch_hillclimb',
      title: 'Step 2: Launch Plugboard Hill Climbing',
      instruction:
        'In the Automated Search tab, select Strategy: "Plugboard Hill Climbing". Keep known pair [A-V] fixed and launch the solver. Observe the convergence chart as mutations ascend the statistical score.',
      explanation:
        'Hill climbing tests small mutations (adding, removing, or swapping cable pairs) and keeps changes that increase the Quadgram/Chi-squared fitness score of the decrypted text.',
      targetAction: 'RUN_SEARCH',
      hints: ['Select Strategy: "Plugboard Hill Climbing" and click "Launch Search".'],
    },
    {
      id: 'm4_local_optima_question',
      title: 'Step 3: Escaping Local Optima',
      instruction: 'Understand why random restarts are essential in stochastic optimization.',
      targetAction: 'ANSWER_QUESTION',
      question: {
        prompt:
          'What happens when a hill-climbing algorithm reaches a "local optimum" (a peak where every single-cable change produces a worse score, but the text is still imperfect)?',
        choices: [
          'The search gets stuck on the false peak; random restarts from different starting points are required to find the global optimum.',
          'The computer overheats and halts.',
          'The Enigma machine automatically resets its ring settings.',
        ],
        correctIndex: 0,
        explanation:
          'Correct! The fitness landscape has many false peaks (local maxima). Multiple random restarts explore different areas of the plugboard space to reach the true global solution.',
      },
      hints: ['Think of climbing a foggy mountain range with multiple small hills.'],
    },
    {
      id: 'm4_transfer_verify',
      title: 'Step 4: Verify Plaintext on the Simulator',
      instruction:
        'Transfer Candidate #1 (discovered steckers: AV, BS, DL, FU) to the simulator and verify that the plaintext begins with "SUBMARINESCONVERGE...".',
      explanation:
        'Recovering the stecker pairs unlocks the authentic plaintext: "SUBMARINES CONVERGE AT GRID TWELVE TORPEDO LOADED AND READY".',
      targetAction: 'TRANSFER_SIMULATOR',
      hints: ['Click "Transfer to Simulator" and test the message on the simulator tape.'],
    },
    {
      id: 'm4_completed',
      title: 'Mission Complete: Optimization Specialist',
      instruction:
        'Outstanding work! You have mastered plugboard hill climbing and understand how stochastic optimization circumvents astronomical combinatorial search spaces.',
      explanation:
        'You have unlocked the Plugboard Hill-Climbing Engine in the Workstation. In Mission 5, you will combine rotor position searches with plugboard optimization in a Hybrid Attack.',
      targetAction: 'COMPLETE',
      hints: ['Proceed to Mission 5: Multiple Possibilities!'],
    },
  ],
};

// ================= MISSION 5 =================
export const MISSION_5: CampaignMission = {
  id: 'mission-5-multiple-possibilities',
  number: 5,
  title: 'Multiple Possibilities',
  subtitle: 'Hybrid Cryptanalysis & Computational Budgeting',
  description:
    'Investigate a multi-variable tactical signal where both a rotor position and plugboard cables are unknown. Learn to estimate search budgets and execute hybrid cryptanalytic attacks.',
  difficulty: 'Advanced',
  estimatedMinutes: 12,
  interceptId: 'intercept-402-hotel',
  unlockedReward: 'Hybrid Cryptanalysis Engine',
  steps: [
    {
      id: 'm5_intro',
      title: 'Mission Briefing: Battleship Escort Squadron Victor',
      instruction:
        'Naval intercept HOTEL reports capital ship movements breaking toward the Atlantic. Rotors I-III-V and positions [B, M, ?] are known from radar logs, but the right rotor position and multiple plugboard steckers remain unresolved.',
      explanation:
        'When multiple machine dimensions are unknown, we combine bounded exhaustive enumeration of rotor settings with plugboard hill climbing inside a Hybrid Search.',
      hints: ['Click "Begin Investigation" to assess the hybrid search parameters.'],
    },
    {
      id: 'm5_budget_question',
      title: 'Step 1: Computational Budgeting',
      instruction: 'Evaluate search cost estimation for compound attacks.',
      targetAction: 'ANSWER_QUESTION',
      question: {
        prompt:
          'If we must test 26 possible right-rotor positions, and run 3 hill-climbing restarts of 50 iterations for each position, how many total candidate evaluations will be performed?',
        choices: [
          '3,900 evaluations (26 × 3 × 50)',
          '78 evaluations (26 + 50 + 2)',
          '1,000,000 evaluations',
        ],
        correctIndex: 0,
        explanation:
          'Exact! $26 \\times 3 \\times 50 = 3,900$ total machine evaluations. This is well within modern browser capability (~15,000 evaluations/sec) and completes in under a second.',
      },
      hints: ['Multiply the number of positions (26) by restarts (3) and iterations per restart (50).'],
    },
    {
      id: 'm5_run_hybrid',
      title: 'Step 2: Execute Hybrid Attack',
      instruction:
        'Open Automated Search on Intercept Hotel, select Strategy: "Hybrid Search", and click "Launch Search".',
      explanation:
        'The hybrid search engine steps through candidate rotor positions [B M A] through [B M Z], optimizing plugboard pairs for each setting.',
      targetAction: 'RUN_SEARCH',
      hints: ['Select Strategy: "Hybrid Search" and click "Launch Search".'],
    },
    {
      id: 'm5_score_separation_question',
      title: 'Step 3: Evaluating Candidate Confidence',
      instruction: 'Interpret candidate score separation and confidence indicators.',
      targetAction: 'ANSWER_QUESTION',
      question: {
        prompt:
          'The top candidate has position [B M K] with steckers [CG, HZ, IN] and a Quadgram score of -2.85. The second candidate has score -4.50. What does this score separation indicate?',
        choices: [
          'High statistical confidence: the top candidate is significantly closer to natural English/German language statistics than any competing setting.',
          'The second candidate is better because -4.50 is a smaller number.',
          'Both candidates are equally invalid.',
        ],
        correctIndex: 0,
        explanation:
          'Correct! In log-likelihood quadgram scoring, higher (less negative) values indicate natural language. A score separation $> 1.0$ provides definitive confidence in the solution.',
      },
      hints: ['Remember that higher quadgram log-likelihood values represent genuine language patterns.'],
    },
    {
      id: 'm5_transfer_verify',
      title: 'Step 4: Verify Plaintext on the Simulator',
      instruction:
        'Transfer the winning candidate [B M K] (steckers: CG, HZ, IN) to the simulator and confirm decryption of "BATTLESHIP SET COURSE FOR BREST...".',
      explanation:
        'Physical simulator verification confirms our intelligence: the German battleship squadron is proceeding to the French port of Brest.',
      targetAction: 'TRANSFER_SIMULATOR',
      hints: ['Click "Transfer to Simulator" on Candidate #1 and check the decrypted tape.'],
    },
    {
      id: 'm5_completed',
      title: 'Mission Complete: Strategic Cryptanalyst',
      instruction:
        'Brilliant tactical achievement! You have proven capable of budgeting and executing compound hybrid cryptanalysis against complex multi-parameter targets.',
      explanation:
        'You have unlocked the full Hybrid Search Strategy in the Workstation. Prepare for Mission 6: The Analyst’s Desk.',
      targetAction: 'COMPLETE',
      hints: ['Proceed to Mission 6: The Analyst’s Desk!'],
    },
  ],
};

// ================= MISSION 6 =================
export const MISSION_6: CampaignMission = {
  id: 'mission-6-analysts-desk',
  number: 6,
  title: 'The Analyst’s Desk',
  subtitle: 'Open-Ended Multi-Path Cryptanalysis & Intelligence Clues',
  description:
    'An unvetted priority dispatch has arrived from German Naval High Command. Choose your own investigative methodology—crib analysis, statistical inspection, or hybrid optimization—to recover the plaintext and uncover a narrative conspiracy.',
  difficulty: 'Advanced',
  estimatedMinutes: 15,
  interceptId: 'intercept-403-india',
  unlockedReward: 'Senior Cryptanalyst Certification & Unrestricted Lab',
  steps: [
    {
      id: 'm6_intro',
      title: 'Mission Briefing: Operation Kreuzotter Dispatch',
      instruction:
        'A high-level naval command dispatch (Intercept India) has been intercepted on secure frequencies. Code sheets provide partial wheel configuration Rotors III-I-II at starting positions [F, I, X] with stecker pair K-M known, but additional plugboard connections and operational directives are undisclosed.',
      explanation:
        'Unlike structured tutorials, this investigation is open-ended. You may use crib dragging, statistical frequency analysis, or hybrid optimization to solve the message.',
      hints: ['Examine the intelligence briefing and choose your preferred cryptanalytic path.'],
    },
    {
      id: 'm6_strategy_choice',
      title: 'Step 1: Formulate Your Investigative Plan',
      instruction: 'Select the most efficient cryptanalytic approach based on available intelligence.',
      targetAction: 'ANSWER_QUESTION',
      question: {
        prompt:
          'Given that rotor order (III-I-II) and starting positions [F, I, X] are known, and pair [K-M] is confirmed, which tool will solve the remaining steckers most rapidly?',
        choices: [
          'Plugboard Hill Climbing with fixed pair [KM], which will optimize remaining pairs in under 1 second.',
          'Manual trial and error of all 150 trillion plugboard cables.',
          'Resetting the machine to AAA and guessing randomly.',
        ],
        correctIndex: 0,
        explanation:
          'Spot on! Because wheel order and starting positions are already known, bounded Plugboard Hill Climbing will converge on the remaining stecker connections [OW, RX] almost instantaneously.',
      },
      hints: ['Consider which parameters are already known and what tool targets the unknown stecker variables.'],
    },
    {
      id: 'm6_execute_solution',
      title: 'Step 2: Execute Solver & Inspect Decryption',
      instruction:
        'Run the optimization search on Intercept India and inspect the top candidate plaintext.',
      explanation:
        'The decrypted plaintext reveals: "SPECIAL DISPATCH SECRET OPERATION KREUZOTTER COMMENCING NOW".',
      targetAction: 'RUN_SEARCH',
      hints: ['Launch the search on Intercept India with Strategy: Hill Climbing or Hybrid.'],
    },
    {
      id: 'm6_narrative_deduction',
      title: 'Step 3: Uncover the Intelligence Pattern',
      instruction: 'Analyze the intelligence metadata and subtle narrative clues in the dispatch.',
      targetAction: 'ANSWER_QUESTION',
      question: {
        prompt:
          'Archival intelligence notes on Intercepts 4, 5, and 6 contain recurring transmission identifier "ORION-7" and references to missing monthly key sheets. What does this suggest?',
        choices: [
          'A coordinated, high-level naval strategic mystery is developing across multiple Kriegsmarine sectors, pointing toward a larger intelligence breakthrough in the future.',
          'The German operators simply made clerical errors on all three messages.',
          'The Enigma machine was broken.',
        ],
        correctIndex: 0,
        explanation:
          'Precisely! The intercepted communications are subtly linked to a broader intelligence narrative—setting the stage for future advanced campaign operations.',
      },
      hints: ['Review the historical context notes in the intercept archive for recurring references.'],
    },
    {
      id: 'm6_transfer_verify',
      title: 'Step 4: Final Simulator Verification',
      instruction:
        'Transfer the recovered configuration (Rotors III-I-II at FIX, steckers: KM, OW, RX) to the simulator and verify the complete military dispatch.',
      explanation:
        'Entering the ciphertext on the physical simulator illuminates the lamps in exact sequence, confirming flawless cryptographic recovery.',
      targetAction: 'TRANSFER_SIMULATOR',
      hints: ['Click "Transfer to Simulator" and test the decryption on the simulator text tape.'],
    },
    {
      id: 'm6_completed',
      title: 'Campaign Climax: Senior Cryptanalyst Certified',
      instruction:
        'Magnificent work, Analyst! You have successfully completed all primary training missions of Version 0.3, mastering rotor stepping, crib dragging, automated searches, stochastic hill climbing, and hybrid cryptanalysis.',
      explanation:
        'You have unlocked all unrestricted cryptanalysis tools, custom worker concurrency settings, and senior research privileges in the Workstation.',
      targetAction: 'COMPLETE',
      hints: ['Explore the unrestricted Workstation, save discoveries in your Notebook, and tackle Mastery Challenges!'],
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
  {
    id: 'mastery-4-plugboard-optima',
    title: 'Challenge 4: Plugboard Optimization & Local Optima',
    concept: 'Stochastic Hill-Climbing Dynamics',
    prompt:
      'Why is single-run hill climbing without restarts vulnerable to failure on complex Enigma plugboard configurations?',
    choices: [
      'Because single-run hill climbing can become trapped on a sub-optimal local plateau (local maximum) where no single swap improves the score, even though the text is still partially garbled.',
      'Because the Enigma plugboard reverses electrical current every 10 keystrokes.',
      'Because hill climbing can only evaluate German language texts.',
    ],
    correctIndex: 0,
    explanation:
      'The plugboard fitness landscape contains numerous local maxima. Random-restart hill climbing starts from multiple distinct initial states to ensure reaching the global maximum.',
    rewardUnlock: 'Multi-Restart Optimization Controls',
  },
  {
    id: 'mastery-5-computational-budget',
    title: 'Challenge 5: Computational Workload Estimation',
    concept: 'Compound Search Space Budgeting',
    prompt:
      'A cryptanalyst wants to test 60 rotor orders, all 17,576 starting positions, and run 5 hill-climbing restarts per setting. What is the fundamental issue with this attack plan?',
    choices: [
      'The total search space is $60 \\times 17,576 \\times 5 \\times 80 = 421,824,000$ evaluations, which would take over 7 hours in a browser without intelligence constraints.',
      'Enigma machines reject searches with more than 3 rotors.',
      'Quadgram scoring does not work with 60 rotor orders.',
    ],
    correctIndex: 0,
    explanation:
      'Unconstrained compound searches result in over 400 million evaluations. Cryptanalysis requires intelligence-bounded constraints (e.g. narrowing wheel orders or known positions) to keep execution feasible.',
    rewardUnlock: 'Workload Budgeting & Telemetry Analyzer',
  },
  {
    id: 'mastery-6-score-separation',
    title: 'Challenge 6: Statistical Confidence Separation',
    concept: 'Candidate Score Separation Analysis',
    prompt:
      'When evaluating automated search candidates, what does a large score separation (e.g. rank 1 score = -2.80 vs rank 2 score = -4.90) indicate about the candidate?',
    choices: [
      'The top candidate has achieved definitive statistical dominance over random polyalphabetic noise, indicating high probability of genuine plaintext recovery.',
      'The top candidate is corrupted by reflector noise.',
      'Both candidates must be discarded and re-evaluated with a different reflector.',
    ],
    correctIndex: 0,
    explanation:
      'A wide statistical score separation between the top candidate and the runner-up indicates that rank 1 matches genuine language n-gram distribution while alternatives remain scrambled noise.',
    rewardUnlock: 'Confidence Metric Visualizer',
  },
];

export const ALL_MISSIONS = [MISSION_1, MISSION_2, MISSION_3, MISSION_4, MISSION_5, MISSION_6];
