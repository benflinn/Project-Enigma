# PROJECT ENIGMA — Version 0.3
### Authentic Wehrmacht Enigma Simulator, Cryptanalysis Workstation & Adaptive Intelligence

PROJECT ENIGMA is an authentic, browser-based historical German military Enigma I (Wehrmacht/Luftwaffe) machine simulator, story-driven cryptanalysis training campaign, and parallel multi-worker cryptanalytic research laboratory built with React 19, TypeScript, Vite, Tailwind CSS, Zustand, and IndexedDB.

---

## 🏛️ Project Overview & Architecture

Project ENIGMA is structured into two complementary modes:

1. **Mode 1: Authentic Enigma Simulator (Independent Engine & Physical Interface)**
   - Complete historical Wehrmacht Enigma I emulation with 5 interchangeable rotors (I, II, III, IV, V), turnover notches, middle rotor double-stepping anomaly (*Anomalie des Fortschaltmechanismus*), 3 reflectors (A, B, C), configurable Ringstellung (ring settings 1–26), and Steckerbrett (plugboard twin-socket cross-wiring).
   - Electrical signal tracing viewer computing live 13-stage circuit paths through the machine.
   - Symmetrical reciprocal encryption/decryption ($E_K(E_K(P)) = P$).

2. **Mode 2: The Cryptanalysis Workstation & Training Campaign (Version 0.3)**
   - **Signals Intercept Archive**: 9 reproducible training intercepts spanning beginner, intermediate, advanced, and open-ended analyst investigations with interconnected intelligence storyline lore.
   - **Optimization Engine (Plugboard Hill Climbing)**: Stochastic random-restart hill-climbing solver using systematic 1-stecker pairwise neighborhood operators and reproducible Mulberry32 PRNG to discover unknown plugboard connections.
   - **Search Strategies**:
     - *Strategy A: Exhaustive Bounded Search* (permutations across rotor orders and wheel starting positions).
     - *Strategy B: Plugboard Hill Climbing* (stochastic stecker optimization with random restarts).
     - *Strategy C: Hybrid Search* (compound rotor position enumeration with plugboard hill climbing).
   - **Parallel Web Worker Pool**: Configurable concurrency pool (1–4 background threads) with task partitioning, aggregated progress telemetry, candidate deduplication, and cancellation.
   - **Computational Cost Estimator**: Workload calculation and automatic warning indicators for heavy combinatorial search spaces.
   - **Statistical Analysis & Language Models**: Index of Coincidence (IoC), Chi-Squared ($\chi^2$) goodness-of-fit distance, and Quadgram log-likelihood scoring supporting both English and German language statistical tables with candidate confidence separation ratings.
   - **Crib-Testing Tool**: Drag suspected plaintext fragments ("cribs") across ciphertext to eliminate impossible alignments using Enigma's fundamental mathematical property that *no character can ever encrypt to itself* ($C_i \neq P_i$).
   - **Candidate Comparison & Inspection**: Side-by-side configuration diffing (rotors, starting positions, stecker cable modifications, statistical confidence separation, and plaintext comparison).
   - **Adaptive Difficulty & Proficiency Engine**: 5-domain competence tracking (Enigma mechanics, crib analysis, statistical interpretation, search strategy, configuration verification) with real-time contextual hints and procedurally generated verifiable challenges.
   - **Storyline Training Campaign (6 Playable Operations)**:
     - *Operation 1: Your First Encrypted Message* (Rotor advancement & polyalphabetic mechanics).
     - *Operation 2: Finding a Clue* (Crib dragging & self-encryption elimination).
     - *Operation 3: Your First Automated Breakthrough* (Bounded keyspace breaking & physical simulator verification).
     - *Operation 4: The Plugboard Problem* (Steckerbrett combinatorics, hill climbing, and local maxima).
     - *Operation 5: Multiple Possibilities* (Hybrid cryptanalysis, workload budgeting, and score separation).
     - *Operation 6: The Analyst’s Desk* (Open-ended multi-path cryptanalysis and narrative conspiracy clues).
   - **Optional Mastery Challenges (6 Challenges)**: Practical understanding assessments unlocking advanced workstation tools and telemetry analyzers.

---

## 💻 Tech Stack & Engineering Standards

- **Core Framework**: React 19, TypeScript 5.7 (Strict type-checking)
- **Bundler & Worker Pipeline**: Vite 6.2 with dedicated Web Worker pool compilation
- **Styling**: Tailwind CSS v4 with bespoke historical brass & Bletchley Park dark research aesthetic
- **State Management**: Zustand v5
- **Local Persistence**: IndexedDB (Schema v3 with automated migration, adaptive profile store, and saved search presets)
- **Testing**: Vitest 3.0 & React Testing Library (59 passing tests)

---

## 🔬 Cryptanalysis Engine Details

### 1. Plugboard Hill Climbing & Local Optima
Because 10 plugboard pairs introduce $150,738,274,937,250$ combinations, exhaustive brute-force is computationally impossible. The hill-climbing solver applies pairwise letter swaps:
$$\text{Neighbor}(S, x, y) = S \setminus \{(x, \cdot), (y, \cdot)\} \cup \{(x, y)\}$$
Testing all 325 candidate swaps per pass and ascending the quadgram fitness landscape. Multi-start exploration from seeded PRNG perturbations prevents entrapment on sub-optimal local plateaus.

### 2. Candidate Confidence & Score Separation
Evaluates statistical confidence by computing the log-likelihood distance $\Delta$ between the top-ranked candidate and the runner-up:
$$\Delta = S_{\text{rank 1}} - S_{\text{rank 2}}$$
A separation $\Delta > 0.5$ in quadgram scoring or $\Delta > 0.015$ in IoC indicates definitive emergence above polyalphabetic noise.

### 3. Parallel Worker Partitioning
Search spaces are partitioned across $N$ worker threads:
- For exhaustive/hybrid searches: partition rotor orders or left-rotor position slices.
- For hill-climbing: partition random restart batches with deterministic seed offsets ($S_i = S_{\text{base}} + 1000 \cdot i$).

---

## 🚀 Getting Started

### Prerequisites
- Node.js LTS (v20+ recommended)
- npm

### Installation & Development
```bash
# Clone or navigate to the repository
cd enigma

# Install dependencies
npm install

# Start local development server
npm run dev

# Run unit and integration tests
npm test

# Run TypeScript strict typecheck
npm run typecheck

# Build for production
npm run build
```

---

## 🧪 Automated Test Suite

Run the full test suite with:
```bash
npm test
```
The test suite validates:
- Authentic Wehrmacht Enigma I wiring & rotor stepping test vectors (e.g., `AAAAA` $\to$ `BDZGO`).
- Middle rotor double-stepping anomaly mechanics.
- Involutory encryption/decryption symmetry.
- Statistical calculations (IoC, Chi-squared, Quadgrams for English and German).
- Bounded plugboard hill climbing and deterministic stecker recovery on naval wolfpack intercepts.
- Search space estimation and budget warning triggers.
- Multi-worker search bounds partitioning.
- Candidate confidence ratings and score separation calculations.
- Adaptive proficiency scoring, mastery transitions, and contextual assistance.
- Procedural challenge generator validity and solvability.
- IndexedDB Schema v3 migrations and search preset persistence.
- Campaign progression across all 6 operations and 6 mastery challenges.

---

## 🗺️ Roadmap: Version 0.4
- Historical Turing-Welchman Bombe diagonal board menu graph solver.
- Polish Zygalski perforated sheet visualizer.
- WebAssembly-accelerated cryptanalysis kernels.
- Scripted narrative climax for the seven intercepted naval dispatches.
