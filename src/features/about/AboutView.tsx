import React from 'react';
import { BookOpen, History, Cpu, FileCode2, Scale } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 text-amber-500 mb-2">
          <History className="w-5 h-5" />
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
            Historical & Technical Documentation
          </span>
        </div>
        <h1 className="font-cinzel text-2xl sm:text-4xl font-bold text-stone-100">
          About Project ENIGMA
        </h1>
        <p className="text-stone-300 font-mono text-xs sm:text-sm mt-2 leading-relaxed">
          An open educational platform combining authentic cryptographic simulation with a historical cryptanalysis campaign.
        </p>
      </div>

      {/* Distinction Between Simulator & Campaign */}
      <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-5 space-y-2">
        <div className="flex items-center gap-2 text-amber-300 font-bold font-cinzel text-sm">
          <Scale className="w-4 h-4" />
          Authentic Simulator vs. Campaign Narrative
        </div>
        <p className="text-xs font-mono text-amber-200/90 leading-relaxed">
          <strong>Mode 1 (Simulator)</strong> is an uncompromising mathematical reproduction of the physical Enigma I machine used by the German Army and Air Force.
        </p>
        <p className="text-xs font-mono text-amber-200/90 leading-relaxed">
          <strong>Mode 2 (Campaign)</strong> is a fictional narrative created to teach historical cryptanalysis concepts progressively. The campaign will never present invented plaintexts as verified historical solutions to genuinely unsolved ciphertexts.
        </p>
      </div>

      {/* Historical Context Section */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <h2 className="font-cinzel text-xl font-bold text-amber-400 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          The History of Enigma Cryptography
        </h2>

        <div className="space-y-4 text-xs sm:text-sm text-stone-300 font-mono leading-relaxed">
          <div>
            <h3 className="font-bold text-stone-100 text-sm mb-1 text-amber-300">1. Origins & Invention (1918)</h3>
            <p className="text-stone-400">
              German engineer <strong>Arthur Scherbius</strong> patented the rotor cipher machine in 1918. Originally designed for commercial banking security, it was heavily modified by the German military (Reichswehr and later Wehrmacht) with the addition of the Steckerbrett (plugboard) in the late 1920s.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-stone-100 text-sm mb-1 text-amber-300">2. The Polish Breakthrough (1932)</h3>
            <p className="text-stone-400">
              Before the outbreak of World War II, three young mathematicians at the Polish Cipher Bureau (Biuro Szyfrów) — <strong>Marian Rejewski, Jerzy Różycki, and Henryk Zygalski</strong> — made the historic mathematical breakthrough. Using permutation cycle theory, Rejewski deduced the secret internal wiring of the military rotors without ever having physical access to the machine. In July 1939, Poland passed replicas of Enigma and their decryption techniques to French and British intelligence at Pyry.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-stone-100 text-sm mb-1 text-amber-300">3. Bletchley Park & The Bombes (1939–1945)</h3>
            <p className="text-stone-400">
              At Government Code and Cypher School (GC&CS) at Bletchley Park, mathematicians including <strong>Alan Turing</strong> and <strong>Gordon Welchman</strong> mechanized cryptanalysis on an industrial scale. They developed the Turing-Welchman Bombe to rapidly test probable plaintext phrases ("cribs") and discover daily key settings across millions of permutations.
            </p>
          </div>
        </div>
      </div>

      {/* Mathematical Principles */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <h2 className="font-cinzel text-xl font-bold text-amber-400 flex items-center gap-2">
          <Cpu className="w-5 h-5" />
          Mechanical & Cryptographic Principles
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 space-y-2">
            <h4 className="font-bold text-amber-300">Rotors (Walzen)</h4>
            <p className="text-stone-400 leading-relaxed">
              Each rotor contains 26 spring-loaded brass pin contacts on one face and 26 flat contact plates on the opposite face, wired in a fixed substitution maze. The ring setting (Ringstellung) offsets the internal wiring relative to the turnover tyre.
            </p>
          </div>

          <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 space-y-2">
            <h4 className="font-bold text-amber-300">Double-Stepping Anomaly</h4>
            <p className="text-stone-400 leading-relaxed">
              Due to the mechanical design of the pawls, when the middle rotor reaches its notch, it steps twice in consecutive strokes: once when triggered by the right rotor, and again on the next stroke when engaging the left rotor ratchet.
            </p>
          </div>

          <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 space-y-2">
            <h4 className="font-bold text-amber-300">The Reflector (Umkehrwalze)</h4>
            <p className="text-stone-400 leading-relaxed">
              Loops current back through the rotor stack in reverse. This made the machine reciprocal (encryption = decryption) but introduced its fatal flaw: <strong className="text-stone-200">a letter can never encrypt to itself</strong>, providing cryptanalysts with a powerful crib-matching heuristic.
            </p>
          </div>

          <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 space-y-2">
            <h4 className="font-bold text-amber-300">The Plugboard (Steckerbrett)</h4>
            <p className="text-stone-400 leading-relaxed">
              Swaps up to 10 letter pairs before and after the rotor stack. With 10 cables, the plugboard alone provides over 150 trillion ($1.5 \times 10^{14}$) possible electrical wiring configurations.
            </p>
          </div>
        </div>
      </div>

      {/* Software Architecture */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 className="font-cinzel text-xl font-bold text-amber-400 flex items-center gap-2">
          <FileCode2 className="w-5 h-5" />
          Software Architecture & Technology Stack
        </h2>

        <p className="text-xs font-mono text-stone-300 leading-relaxed">
          Project ENIGMA Version 0.1 is engineered in TypeScript with React, Vite, Tailwind CSS, Zustand, and IndexedDB. The core cryptographic engine is completely independent of the UI layer, deterministic, and covered by a comprehensive suite of historical test vectors.
        </p>
      </div>
    </div>
  );
};
