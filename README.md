# PROJECT ENIGMA — Version 0.2
### Authentic Wehrmacht Enigma Simulator & Cryptanalysis Research Workstation

PROJECT ENIGMA is an authentic, browser-based historical German military Enigma I (Wehrmacht/Luftwaffe) machine simulator, story-driven cryptanalysis training campaign, and multi-threaded cryptanalytic research laboratory built with React 19, TypeScript, Vite, Tailwind CSS, Zustand, and IndexedDB.

---

## 🏛️ Project Overview & Architecture

Project ENIGMA is structured into two complementary modes:

1. **Mode 1: Authentic Enigma Simulator (Independent Engine & Physical Interface)**
   - Complete historical Wehrmacht Enigma I emulation with 5 interchangeable rotors (I, II, III, IV, V), turnover notches, middle rotor double-stepping anomaly (*Anomalie des Fortschaltmechanismus*), 3 reflectors (A, B, C), configurable Ringstellung (ring settings 1–26), and Steckerbrett (plugboard twin-socket cross-wiring).
   - Electrical signal tracing viewer computing live 13-stage circuit paths through the machine.
   - Symmetrical reciprocal encryption/decryption ($E_K(E_K(P)) = P$).

2. **Mode 2: The Cryptanalysis Workstation & Training Campaign (Version 0.2)**
   - **Signals Intercept Archive**: 6 reproducible training intercepts spanning beginner, intermediate, and advanced cryptanalytic difficulty.
   - **Statistical Analysis Engine**: Index of Coincidence (IoC), Chi-Squared ($\chi^2$) goodness-of-fit distance, and Quadgram log-likelihood scoring with interactive monogram frequency distribution visualizers.
   - **Crib-Testing Tool**: Drag suspected plaintext fragments ("cribs") across ciphertext to eliminate impossible alignments using Enigma's fundamental mathematical property that *no character can ever encrypt to itself* ($C_i \neq P_i$).
   - **Multi-Threaded Automated Search Engine**: Dedicated background Web Worker executing bounded keyspace searches across rotor permutations, custom starting position windows, and scoring models without blocking UI rendering (60 FPS).
   - **Investigation Notebook**: Persistent hypothesis logging, candidate configuration comparison, and one-click transfer to the physical simulator.
   - **Storyline Training Campaign (3 Full Operations)**:
     - *Operation 1: Your First Encrypted Message* (Rotor advancement & polyalphabetic mechanics).
     - *Operation 2: Finding a Clue* (Crib dragging & self-encryption elimination).
     - *Operation 3: Your First Automated Breakthrough* (Bounded keyspace breaking & physical simulator verification).
   - **Optional Mastery Challenges**: Practical assessments unlocking Advanced Workstation features early.

---

## 💻 Tech Stack & Engineering Standards

- **Core Framework**: React 19, TypeScript 5.7 (Strict type-checking)
- **Bundler & Worker Pipeline**: Vite 6.2 with dedicated Web Worker compilation
- **Styling**: Tailwind CSS v4 with bespoke historical brass & Bletchley Park dark research aesthetic
- **State Management**: Zustand v5
- **Local Persistence**: IndexedDB (Schema v2 with automated migration and store isolation)
- **Testing**: Vitest 3.0 & React Testing Library

---

## 🔬 Cryptanalysis Engine Details

### 1. Index of Coincidence (IoC)
Calculates the probability that two randomly selected characters from a text are identical:
$$\text{IC} = \frac{\sum_{i=\text{A}}^{\text{Z}} f_i(f_i - 1)}{N(N - 1)}$$
- Natural English Plaintext: $\approx 0.0667$
- Natural German Plaintext: $\approx 0.0762$
- Uniform Polyalphabetic Enigma Noise: $\approx 0.0385$

### 2. Crib-Dragging Non-Self-Encryption Elimination
Because electrical current in an Enigma machine loops through the paired contacts of the Reflector (Umkehrwalze), a character can never encrypt to itself:
$$\forall i, \quad E(P_i) \neq P_i$$
When placing a crib of length $L$ at offset $k$, if $\exists j \in [0, L-1]$ such that $C_{k+j} = \text{Crib}_j$, the alignment is discarded as mathematically impossible.

### 3. Web Worker Bounded Keyspace Solver
- Runs in a background thread via `src/engine/cryptanalysis/searchWorker.ts` and `searchClient.ts`.
- Evaluates candidate rotor orders, ring settings, and starting positions against candidate ciphertexts.
- Ranks candidate results deterministically using fitness functions (IoC, Chi-squared, Quadgram log-likelihood, and exact crib matching).
- Supports instant cancellation and session isolation against stale responses.

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
- Statistical calculations (IoC, Chi-squared, Quadgrams).
- Crib clash detection and impossible alignment elimination.
- Bounded search deterministic candidate discovery on intercepted naval messages.
- Search cancellation and progress telemetry.
- IndexedDB Schema v2 migrations and investigation notebook persistence.
- Campaign mission progression, deduction prompts, and mastery challenge unlocks.

---

## 🗺️ Roadmap: Version 0.3
- Integration of Turing-Welchman Bombe menu electrical diagonal board simulation.
- Polish Zygalski perforated sheet visualizer.
- Plugboard hill-climbing optimization heuristics.
- German language reference quadgram libraries.
