import React, { useEffect, useCallback } from 'react';
import { useSimulatorStore } from '../../state/simulatorStore';
import { useCampaignStore } from '../../state/campaignStore';
import { Keyboard as KeyboardIcon } from 'lucide-react';

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K'],
  ['P', 'Y', 'X', 'C', 'V', 'B', 'N', 'M', 'L'],
];

export const EnigmaKeyboard: React.FC = () => {
  const { pressKey, releaseKey, activeKey } = useSimulatorStore();
  const { isTutorialActive, recordKeystroke } = useCampaignStore();

  const handleKeyPress = useCallback(
    (letter: string) => {
      const clean = letter.toUpperCase();
      const res = pressKey(clean);
      if (res && isTutorialActive) {
        recordKeystroke(res.inputChar, res.outputChar, res.currentPositions);
      }
    },
    [pressKey, isTutorialActive, recordKeystroke]
  );

  const handleKeyRelease = useCallback(
    (letter?: string) => {
      releaseKey(letter);
    },
    [releaseKey]
  );

  // Global physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in form inputs or modals
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toUpperCase();
      if (key >= 'A' && key <= 'Z' && key.length === 1) {
        e.preventDefault();
        if (activeKey !== key) {
          handleKeyPress(key);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key >= 'A' && key <= 'Z' && key.length === 1) {
        handleKeyRelease(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyPress, handleKeyRelease, activeKey]);

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-xl select-none">
      <div className="flex items-center justify-between mb-4 border-b border-stone-800 pb-2">
        <div className="flex items-center gap-2">
          <KeyboardIcon className="w-5 h-5 text-stone-400" />
          <h2 className="font-cinzel tracking-wider text-amber-400 font-bold text-sm uppercase">
            Tastatur (QWERTZ Keyboard)
          </h2>
        </div>
        <span className="text-xs text-stone-400 font-mono hidden sm:inline">
          Physical Typing Supported [A-Z]
        </span>
      </div>

      <div className="flex flex-col items-center gap-3 py-2">
        {KEYBOARD_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-2 sm:gap-3">
            {row.map((letter) => {
              const isPressed = activeKey === letter;
              return (
                <button
                  key={letter}
                  type="button"
                  data-testid={`key-${letter}`}
                  aria-label={`Key ${letter}`}
                  onMouseDown={() => handleKeyPress(letter)}
                  onMouseUp={() => handleKeyRelease(letter)}
                  onMouseLeave={() => handleKeyRelease(letter)}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handleKeyPress(letter);
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handleKeyRelease(letter);
                  }}
                  className={`
                    w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center
                    font-mono-military font-bold text-base sm:text-lg border-2
                    cursor-pointer transition-all outline-none focus:ring-2 focus:ring-amber-500/50
                    enigma-key
                    ${
                      isPressed
                        ? 'pressed bg-stone-950 border-amber-600 text-amber-400 shadow-inner'
                        : 'bg-gradient-to-b from-stone-800 to-stone-950 border-stone-600 text-stone-200 shadow-md hover:border-amber-500/70 hover:text-white'
                    }
                  `}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
