import React from 'react';
import { useSimulatorStore } from '../../state/simulatorStore';
import { Lightbulb } from 'lucide-react';

const LAMPBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K'],
  ['P', 'Y', 'X', 'C', 'V', 'B', 'N', 'M', 'L'],
];

export const Lampboard: React.FC = () => {
  const { activeLamp } = useSimulatorStore();

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-xl select-none">
      <div className="flex items-center justify-between mb-4 border-b border-stone-800 pb-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <h2 className="font-cinzel tracking-wider text-amber-400 font-bold text-sm uppercase">
            Glühlampenfeld (Lampboard)
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {activeLamp ? (
            <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-mono font-bold animate-pulse">
              LIT: {activeLamp}
            </span>
          ) : (
            <span className="text-xs text-stone-400 font-mono">
              Ready
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 py-2">
        {LAMPBOARD_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-2 sm:gap-3">
            {row.map((letter) => {
              const isActive = activeLamp === letter;
              return (
                <div
                  key={letter}
                  data-testid={`lamp-${letter}`}
                  data-active={isActive ? 'true' : 'false'}
                  aria-label={`Lamp ${letter} ${isActive ? 'Illuminated' : 'Off'}`}
                  className={`
                    w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center
                    font-mono-military font-bold text-sm sm:text-base border-2 transition-all duration-100
                    enigma-lamp
                    ${
                      isActive
                        ? 'active z-10'
                        : 'bg-stone-950 border-stone-800 text-stone-500 shadow-inner'
                    }
                  `}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
