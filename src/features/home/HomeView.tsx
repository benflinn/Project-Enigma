import React from 'react';
import { Shield, BookOpen, Sparkles, Key, Zap, Lock, Cpu, ArrowRight } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (tab: 'home' | 'simulator' | 'campaign' | 'workstation' | 'about') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      {/* Hero Header */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-600/50 text-amber-400 text-xs font-mono mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Version 0.2 • The Cryptanalysis Workstation & Multi-Mission Campaign
        </div>
        <h1 className="font-cinzel text-3xl sm:text-5xl font-extrabold text-stone-100 tracking-wider">
          PROJECT ENIGMA
        </h1>
        <p className="text-sm sm:text-base text-stone-300 font-mono max-w-2xl mx-auto leading-relaxed">
          An authentic browser-based historical Enigma machine simulator, story-driven cryptanalysis training campaign, and high-performance Web Worker breaking laboratory.
        </p>
      </div>

      {/* Core Experiences Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mode 1: Authentic Simulator */}
        <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 border-2 border-stone-800 hover:border-amber-500/60 rounded-2xl p-6 shadow-xl space-y-5 transition-all group flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-600/50 flex items-center justify-center text-amber-400">
              <Key className="w-6 h-6" />
            </div>
            <h2 className="font-cinzel text-xl font-bold text-stone-100">
              Enigma Simulator
            </h2>
            <p className="text-xs text-stone-400 font-mono leading-relaxed">
              Operate a fully functional simulation of the historical German military Enigma I. Configure 3 interchangeable rotors, adjust ring settings (Ringstellung), connect plugboard pairs (Steckerbrett), and watch real-time lampboard illumination and electrical circuit paths.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => onNavigate('simulator')}
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
            >
              Launch Simulator
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mode 2: Cryptanalysis Campaign */}
        <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 border-2 border-stone-800 hover:border-amber-500/60 rounded-2xl p-6 shadow-xl space-y-5 transition-all group flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-600/50 flex items-center justify-center text-amber-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="font-cinzel text-xl font-bold text-stone-100">
              Training Campaign
            </h2>
            <p className="text-xs text-stone-400 font-mono leading-relaxed">
              Step into Bletchley Park across 3 complete operations: master polyalphabetic rotor stepping in Mission 1, exploit non-self-encryption with crib dragging in Mission 2, and execute automated breakthroughs in Mission 3.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => onNavigate('campaign')}
              className="w-full py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-600/50 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
            >
              Enter Campaign Hub
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mode 3: Cryptanalysis Workstation */}
        <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 border-2 border-stone-800 hover:border-amber-500/60 rounded-2xl p-6 shadow-xl space-y-5 transition-all group flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-600/50 flex items-center justify-center text-amber-400">
              <Cpu className="w-6 h-6" />
            </div>
            <h2 className="font-cinzel text-xl font-bold text-stone-100">
              Cryptanalysis Workstation
            </h2>
            <p className="text-xs text-stone-400 font-mono leading-relaxed">
              Access the research laboratory. Drag suspected cribs to eliminate impossible alignments, calculate Index of Coincidence (IoC), and launch parallel Web Worker searches across bounded rotor keyspaces.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => onNavigate('workstation')}
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
            >
              Open Workstation
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Engineering & Historical Standards Highlights */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <h3 className="font-cinzel text-lg font-bold text-amber-400 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Cryptographic & Architectural Standards
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Zap className="w-4 h-4" />
              <span>Authentic Mechanics</span>
            </div>
            <p className="text-stone-400 leading-relaxed">
              Validated against independently documented historical test vectors (e.g., AAAAA with Rotors I-II-III yields BDZGO). Correct middle rotor double-stepping anomaly.
            </p>
          </div>

          <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Cpu className="w-4 h-4" />
              <span>Multi-Threaded Solvers</span>
            </div>
            <p className="text-stone-400 leading-relaxed">
              Automated configuration searches run in dedicated background Web Workers, maintaining a responsive 60fps UI while testing thousands of cryptographic keys per second.
            </p>
          </div>

          <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Lock className="w-4 h-4" />
              <span>Local Persistence</span>
            </div>
            <p className="text-stone-400 leading-relaxed">
              Zero cloud tracking or backend servers. All machine configurations, notebook hypotheses, and campaign unlocks persist in client-side IndexedDB.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
