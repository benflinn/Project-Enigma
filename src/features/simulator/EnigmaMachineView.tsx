import React from 'react';
import { RotorAssembly } from './RotorAssembly';
import { Lampboard } from './Lampboard';
import { EnigmaKeyboard } from './EnigmaKeyboard';
import { PlugboardView } from './PlugboardView';
import { TextTape } from './TextTape';
import { ControlPanel } from './ControlPanel';
import { SignalPathViewer } from './SignalPathViewer';
import { Shield } from 'lucide-react';

export const EnigmaMachineView: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Machine Chassis Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900/90 border border-stone-800 p-4 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-amber-400 tracking-wider">
              Enigma I Simulator
            </h1>
          </div>
          <p className="text-xs text-stone-400 font-mono mt-0.5">
            German Military Wehrmacht / Luftwaffe 3-Rotor Electromechanical Cipher Engine
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="brass-badge font-mono text-[11px] font-bold px-3 py-1 rounded shadow tracking-widest uppercase">
            CHIF. Nr. 1939-B
          </div>
        </div>
      </div>

      {/* Control Actions & Presets */}
      <ControlPanel />

      {/* Paper Tape Output */}
      <TextTape />

      {/* Physical Enigma Machine Cabinet */}
      <div className="enigma-cabinet rounded-2xl p-4 sm:p-6 border-4 border-stone-800/80 shadow-2xl space-y-6">
        {/* Section 1: Rotors & Reflector */}
        <RotorAssembly />

        {/* Section 2: Lampboard */}
        <Lampboard />

        {/* Section 3: Keyboard */}
        <EnigmaKeyboard />

        {/* Section 4: Plugboard (Steckerbrett) */}
        <PlugboardView />
      </div>

      {/* Live Electrical Signal Path Explanation */}
      <SignalPathViewer />
    </div>
  );
};
