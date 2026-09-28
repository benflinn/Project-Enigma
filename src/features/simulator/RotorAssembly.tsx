import React from 'react';
import { useSimulatorStore } from '../../state/simulatorStore';
import { RotorType, ReflectorType } from '../../engine/enigma';
import { ChevronUp, ChevronDown, Cog } from 'lucide-react';

const AVAILABLE_ROTORS: { type: RotorType; label: string; notch: string }[] = [
  { type: 'I', label: 'Rotor I (Q)', notch: 'Q' },
  { type: 'II', label: 'Rotor II (E)', notch: 'E' },
  { type: 'III', label: 'Rotor III (V)', notch: 'V' },
  { type: 'IV', label: 'Rotor IV (J)', notch: 'J' },
  { type: 'V', label: 'Rotor V (Z)', notch: 'Z' },
];

const AVAILABLE_REFLECTORS: { type: ReflectorType; label: string }[] = [
  { type: 'A', label: 'Reflector A (1937)' },
  { type: 'B', label: 'Reflector B (Standard)' },
  { type: 'C', label: 'Reflector C (1940)' },
];

export const RotorAssembly: React.FC = () => {
  const {
    config,
    currentPositions,
    stepRotorManual,
    setRotorType,
    setRotorRingSetting,
    setReflector,
    machine,
  } = useSimulatorStore();

  const rotors = machine.getRotors();

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-xl select-none">
      <div className="flex items-center justify-between mb-3 border-b border-stone-800 pb-2">
        <div className="flex items-center gap-2">
          <Cog className="w-5 h-5 text-amber-500 animate-spin-slow" />
          <h2 className="font-cinzel tracking-wider text-amber-400 font-bold text-sm uppercase">
            Rotor Vault & Umkehrwalze
          </h2>
        </div>
        <span className="text-xs text-stone-400 font-mono">
          Wehrmacht Enigma I
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Reflector Slot */}
        <div className="bg-stone-950/80 border border-stone-800 rounded-lg p-3 flex flex-col justify-between items-center text-center">
          <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400">
            Reflector (UKW)
          </span>
          <div className="my-2 py-2 px-4 rounded bg-stone-900 border border-stone-700 text-amber-400 font-bold font-cinzel text-xl shadow-inner">
            {config.reflector}
          </div>
          <div className="w-full">
            <label htmlFor="reflector-select" className="sr-only">Reflector Type</label>
            <select
              id="reflector-select"
              aria-label="Reflector Type"
              value={config.reflector}
              onChange={(e) => setReflector(e.target.value as ReflectorType)}
              className="w-full text-xs bg-stone-900 border border-stone-700 text-stone-300 rounded px-2 py-1 outline-none focus:border-amber-500"
            >
              {AVAILABLE_REFLECTORS.map((r) => (
                <option key={r.type} value={r.type}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3 Rotors: Left (0), Middle (1), Right (2) */}
        {(['Left (Fast 3)', 'Middle (Fast 2)', 'Right (Fast 1)'] as const).map((slotLabel, index) => {
          const slot = index as 0 | 1 | 2;
          const rotorConfig = config.rotors[slot];
          const currentLetter = currentPositions[slot];
          const isAtNotch = rotors[slot].isAtNotch();
          const notchLetter = rotors[slot].getNotchLetter();

          return (
            <div
              key={slot}
              className="bg-stone-950/90 border border-stone-800 rounded-lg p-3 flex flex-col items-center justify-between"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                  {slotLabel}
                </span>
                {isAtNotch && (
                  <span
                    className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 rounded font-mono"
                    title={`At turnover notch (${notchLetter})`}
                  >
                    NOTCH
                  </span>
                )}
              </div>

              {/* Rotor Window & Drum Stepping */}
              <div className="flex items-center gap-3 my-1">
                {/* Step Up Button */}
                <button
                  onClick={() => stepRotorManual(slot, -1)}
                  className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-400 transition-colors border border-stone-700 shadow"
                  title="Step rotor backwards"
                  aria-label={`Step rotor ${slot + 1} backwards`}
                >
                  <ChevronUp className="w-4 h-4" />
                </button>

                {/* Display Window */}
                <div className="relative w-14 h-16 bg-stone-950 border-2 border-stone-700 rounded flex flex-col items-center justify-center shadow-inner overflow-hidden">
                  <div className="absolute top-0 w-full h-2 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
                  <span className="font-mono-military text-2xl font-black text-amber-300 tracking-wider">
                    {currentLetter}
                  </span>
                  <div className="absolute bottom-0 w-full h-2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                  {/* Subtle notch line indicator on tyre */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-3 bg-stone-600 rounded-l" />
                </div>

                {/* Step Down Button */}
                <button
                  onClick={() => stepRotorManual(slot, 1)}
                  className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-400 transition-colors border border-stone-700 shadow"
                  title="Step rotor forward"
                  aria-label={`Step rotor ${slot + 1} forward`}
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Controls: Type & Ring Setting */}
              <div className="w-full space-y-1.5 mt-2">
                <div className="flex items-center justify-between text-[11px] gap-1">
                  <label htmlFor={`rotor-${slot}-type`} className="text-stone-400">Rotor:</label>
                  <select
                    id={`rotor-${slot}-type`}
                    aria-label={`Rotor in slot ${slot + 1}`}
                    value={rotorConfig.type}
                    onChange={(e) => setRotorType(slot, e.target.value as RotorType)}
                    className="bg-stone-900 border border-stone-700 text-stone-200 text-xs rounded px-1.5 py-0.5 outline-none focus:border-amber-500"
                  >
                    {AVAILABLE_ROTORS.map((r) => (
                      <option key={r.type} value={r.type}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between text-[11px] gap-1">
                  <label htmlFor={`rotor-${slot}-ring`} className="text-stone-400">Ring (1-26):</label>
                  <div className="flex items-center gap-1">
                    <input
                      id={`rotor-${slot}-ring`}
                      aria-label={`Ring setting for rotor in slot ${slot + 1}`}
                      type="number"
                      min={1}
                      max={26}
                      value={rotorConfig.ringSetting}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= 1 && val <= 26) {
                          setRotorRingSetting(slot, val);
                        }
                      }}
                      className="w-12 bg-stone-900 border border-stone-700 text-center text-amber-300 font-mono text-xs rounded px-1 py-0.5 outline-none focus:border-amber-500"
                    />
                    <span className="text-[10px] text-stone-400 font-mono">
                      ({String.fromCharCode(64 + rotorConfig.ringSetting)})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
