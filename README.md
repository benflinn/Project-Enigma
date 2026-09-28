# PROJECT ENIGMA (Version 0.1)

An authentic browser-based historical Enigma machine simulator and story-driven cryptanalysis training environment.

---

## 1. Overview & Project Vision

Project ENIGMA is designed around two independent modes:

1. **Authentic Enigma Simulator (Mode 1)**: An uncompromising, mathematically precise simulation of the historical German military Enigma I (Wehrmacht / Luftwaffe 3-rotor machine). Operators can configure rotor types (I–V), ring settings (Ringstellung), starting positions (Grundstellung), reflectors (UKW A, B, C), and plugboard connections (Steckerbrett).
2. **Cryptanalysis Campaign (Mode 2)**: A narrative pedagogical experience. Version 0.1 includes the complete opening mission: **"Your First Encrypted Message"**, introducing rotor advancement, polyalphabetic substitution, and reciprocal decryption through guided discovery and progressive assistance.

---

## 2. Technology Stack

- **Core Framework**: React 19, TypeScript (Strict Mode)
- **Bundler & Build Tool**: Vite 6
- **Styling**: Tailwind CSS v4, Lucide Icons, Custom Enigma Mechanical Aesthetics
- **State Management**: Zustand v5
- **Persistence**: IndexedDB (via `idb` with schema versioning)
- **Unit & Cryptographic Testing**: Vitest, React Testing Library, jsdom
- **Browser & E2E Testing**: Playwright

---

## 3. Software Architecture

The application is structured into decoupled, modular layers:

```text
src/
├── app/                  # Application shell, navigation bar, modal dialogs
├── components/           # Reusable UI primitives (Buttons, Cards, Badges)
├── features/
│   ├── home/             # Project landing page & quick launch hub
│   ├── simulator/        # Physical machine view: Rotors, Lampboard, Keyboard, Plugboard, Tape
│   ├── campaign/         # Story campaign: TutorialMissionView, hint tiering, deduction engine
│   ├── workstation/      # Cryptanalysis Workstation roadmap (planned v0.2 automated solvers)
│   └── about/            # Historical context, Bletchley Park/Polish Cipher Bureau history
├── engine/
│   ├── enigma/           # Pure TypeScript cryptographic engine (independent of React/Zustand)
│   │   ├── rotor.ts          # Rotor forward/reverse transformations & turnover notch detection
│   │   ├── reflector.ts      # Symmetric involution reflectors (UKW A, B, C)
│   │   ├── plugboard.ts      # Steckerbrett pairwise letter swapping & validation
│   │   ├── enigmaMachine.ts  # Master machine: stepping, double-stepping, full 13-stage signal trace
│   │   ├── inputNormalizer.ts# Military 5-character grouping & text sanitization
│   │   └── constants.ts      # Historically authentic rotor & reflector wirings
│   └── cryptanalysis/    # Interfaces and Web Worker contracts for future algorithmic solvers
├── state/                # Zustand global stores (simulatorStore, campaignStore, settingsStore)
├── storage/              # IndexedDB adapter with schema versioning & reset mechanisms
├── styles/               # CSS custom properties, chassis textures, illuminated lamp glows
└── tests/                # Cryptographic test vectors, unit tests, and component test suites
```

---

## 4. Cryptographic Implementation Details

### Historical Rotor Wirings (Enigma I / M3)
- **Rotor I**: `EKMFLGDQVZNTOWYHXUSPAIBRCJ`, Turnover Notch: **Q** (steps adjacent rotor on $Q \to R$)
- **Rotor II**: `AJDKSIRUXBLHWTMCQGZNPYFVOE`, Turnover Notch: **E** (steps adjacent rotor on $E \to F$)
- **Rotor III**: `BDFHJLCPRTXVZNYEIWGAKMUSQO`, Turnover Notch: **V** (steps adjacent rotor on $V \to W$)
- **Rotor IV**: `ESOVPZJAYQUIRHXLNFTGKDCMWB`, Turnover Notch: **J** (steps adjacent rotor on $J \to K$)
- **Rotor V**: `VZBRGITYUPSDNHLXAWMJQOFECK`, Turnover Notch: **Z** (steps adjacent rotor on $Z \to A$)

### Reflectors (Umkehrwalze)
- **Reflector A**: `EJMZALYXVBWFCRQUONTSPIKHGD`
- **Reflector B**: `YRUHQSLDPXNGOKMIEBFZCWVJAT` (Standard 1939 Wehrmacht)
- **Reflector C**: `FVPJIAOYEDRZXWGCTKUQSBNMHL`

### Double-Stepping Anomaly
Stepping occurs **before** electrical signal transmission. On every keypress:
1. The right rotor always advances.
2. If the middle rotor is at its turnover notch, on the subsequent keystroke its ratchet pawl advances **both** the middle rotor again and the left rotor.
3. If the right rotor was at its turnover notch, the middle rotor advances.

### Signal Path Trace
The engine computes and exposes the exact 13-stage electrical journey for every letter:
$$\text{Key} \to \text{Plugboard (In)} \to \text{ETW} \to R_3 \to R_2 \to R_1 \to \text{UKW} \to R_1^{-1} \to R_2^{-1} \to R_3^{-1} \to \text{ETW} \to \text{Plugboard (Out)} \to \text{Lamp}$$

---

## 5. Installation & Development

### Prerequisites
- **Node.js**: v18+ LTS (Tested on Node.js v24.14.0)
- **npm**: v10+

### Installation
```bash
# Clone or navigate to the repository
cd enigma

# Install all dependencies
npm install
```

### Running the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your web browser.

### Running Automated Cryptographic & Component Tests
```bash
# Run all Vitest unit, cryptographic, and component tests
npm test

# Run tests in watch mode
npm run test:watch
```

### TypeScript Type Checking & Production Build
```bash
# Verify TypeScript strict compliance
npm run typecheck

# Create optimized production build
npm run build
```

---

## 6. Verification & Test Vectors

Historical accuracy is verified by automated test suites:
- **Test Vector 1**: Rotors I-II-III, Reflector B, Ring settings `AAA` (1,1,1), Starting position `AAA`, No plugboard:
  - Input: `AAAAA` $\longrightarrow$ Output: `BDZGO`
- **Test Vector 2 (Military Intercept with Plugs)**: Rotors II-IV-V, Reflector B, Ring settings `02 21 12` (`BUL`), Start `BLA`, 10 Stecker pairs (`AV BS CG DL FU HZ IN KM OW RX`):
  - Encryption and reciprocal decryption symmetry verified identically.
- **Double-Stepping Verification**: Tested on Rotors I-II-III starting at `A-D-U` advancing sequentially through `A-D-V` $\to$ `A-E-W` $\to$ `B-F-X` (verifying middle rotor double advance and left rotor turnover).
- **Involutory Non-Self-Encryption Verification**: Validated across the alphabet that $E(x) \neq x$.

---

## 7. Known Limitations & Milestone 0.2 Roadmap

### Version 0.1 Scope (Delivered)
- Full 3-rotor Wehrmacht Enigma I simulation with Rotors I–V, Reflector B, Steckerbrett.
- QWERTZ physical and virtual keyboard integration.
- Electrical circuit signal path explanation viewer.
- Mission 1 Tutorial with persistent IndexedDB progress.
- Machine configuration preset manager.

### Planned for Milestone 0.2 (Upcoming)
- **Turing-Welchman Bombe Simulator**: Automated crib-drag menu solver.
- **Polish Cyclometer & Zygalski Sheets**: Permutation cycle indicators.
- **Parallel Web Worker Cryptanalysis**: Multi-threaded Index of Coincidence and Hill-Climbing plugboard solver.
- **Missions 2 through 7**: Advanced fictional cryptanalysis campaign missions.
