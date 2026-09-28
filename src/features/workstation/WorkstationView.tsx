import React from 'react';
import { Cpu, Lock, Terminal, Wrench, ShieldAlert, Clock } from 'lucide-react';

export const WorkstationView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-600/50 text-amber-400 text-xs font-mono mb-3">
              <Clock className="w-3.5 h-3.5" />
              Upcoming Feature • Version 0.2 Roadmap
            </div>
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-stone-100">
              Cryptanalysis Workstation
            </h1>
            <p className="text-stone-400 font-mono text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              An advanced automated laboratory for breaking intercepted Enigma traffic using historical and modern cryptanalytic methods.
            </p>
          </div>

          <div className="shrink-0 p-4 rounded-xl bg-stone-950 border border-stone-800 flex flex-col items-center justify-center text-center">
            <Cpu className="w-8 h-8 text-amber-500 mb-1 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400">Status</span>
            <span className="text-xs font-mono font-bold text-amber-400">In Design (v0.2)</span>
          </div>
        </div>
      </div>

      {/* Honest Upcoming Notice */}
      <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-5 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs font-mono text-amber-200">
          <strong className="text-amber-300 block font-bold">Historical Integrity Notice:</strong>
          <p>
            In accordance with the Version 0.1 specification, automated breaking engines and hill-climbing solvers are not active in this release. All features below represent the active architectural contracts being built for Milestone 0.2.
          </p>
        </div>
      </div>

      {/* Planned Feature Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <Terminal className="w-5 h-5" />
            <h3 className="font-cinzel font-bold text-base text-stone-100">
              Turing-Welchman Bombe Simulator
            </h3>
          </div>
          <p className="text-xs text-stone-400 font-mono leading-relaxed">
            Simulates the electromechanical Bombe developed at Bletchley Park to test "menus" derived from cribs (known plaintext guesses) across 17,576 rotor alignments simultaneously.
          </p>
          <div className="text-[11px] font-mono text-stone-500 pt-2 border-t border-stone-800">
            Target: Diagonal board crib validation & stop detection
          </div>
        </div>

        <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <Wrench className="w-5 h-5" />
            <h3 className="font-cinzel font-bold text-base text-stone-100">
              Polish Cyclometer & Zygalski Perforated Sheets
            </h3>
          </div>
          <p className="text-xs text-stone-400 font-mono leading-relaxed">
            Recreates Marian Rejewski's card-catalog cycle method and Zygalski sheets for determining rotor order and female indicator positions from early 1930s transmissions.
          </p>
          <div className="text-[11px] font-mono text-stone-500 pt-2 border-t border-stone-800">
            Target: Indicator exploitation & permutation cycle theory
          </div>
        </div>

        <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <Cpu className="w-5 h-5" />
            <h3 className="font-cinzel font-bold text-base text-stone-100">
              Multi-Threaded Web Worker Solvers
            </h3>
          </div>
          <p className="text-xs text-stone-400 font-mono leading-relaxed">
            Offloads computationally intensive ciphertext-only attacks (Index of Coincidence, Bigram/Trigram scoring, and Hill-Climbing plugboard optimization) to background Web Workers without freezing the UI.
          </p>
          <div className="text-[11px] font-mono text-stone-500 pt-2 border-t border-stone-800">
            Target: Fast parallel IC calculation & sinkhorn optimization
          </div>
        </div>

        <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <Lock className="w-5 h-5" />
            <h3 className="font-cinzel font-bold text-base text-stone-100">
              Bletchley Park Banburismus Analysis
            </h3>
          </div>
          <p className="text-xs text-stone-400 font-mono leading-relaxed">
            Alan Turing's probability scoring method utilizing overlapping message depths on Banbury sheets to eliminate unlikely right rotor combinations before running the Bombes.
          </p>
          <div className="text-[11px] font-mono text-stone-500 pt-2 border-t border-stone-800">
            Target: Deciban scoring & letter-frequency cross-matching
          </div>
        </div>
      </div>
    </div>
  );
};
