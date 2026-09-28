import React from 'react';
import { useSimulatorStore } from '../../state/simulatorStore';
import { Activity, ArrowRight, Zap, Info } from 'lucide-react';

export const SignalPathViewer: React.FC = () => {
  const { lastResult, showSignalPath, toggleSignalPath } = useSimulatorStore();

  if (!showSignalPath) {
    return (
      <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-stone-400 text-xs font-mono">
          <Activity className="w-4 h-4 text-amber-500" />
          <span>Circuit Signal Path Trace is hidden</span>
        </div>
        <button
          onClick={() => toggleSignalPath(true)}
          className="text-xs text-amber-400 hover:text-amber-300 font-mono underline"
        >
          Show Signal Path
        </button>
      </div>
    );
  }

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3 border-b border-stone-800 pb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <h2 className="font-cinzel tracking-wider text-amber-400 font-bold text-sm uppercase">
            Stromlauf (Electrical Signal Path)
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleSignalPath(false)}
            className="text-xs text-stone-400 hover:text-stone-200 font-mono"
          >
            Hide Trace
          </button>
        </div>
      </div>

      {!lastResult ? (
        <div className="py-8 text-center text-stone-400 font-mono text-xs flex flex-col items-center gap-2">
          <Info className="w-5 h-5 text-stone-400" />
          <span>Press any key on the keyboard to trace its live electrical circuit journey.</span>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Summary Banner */}
          <div className="bg-stone-950 border border-stone-800 rounded-lg p-2.5 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-stone-400">Input:</span>
              <span className="px-2 py-0.5 rounded bg-stone-800 text-amber-300 font-bold font-mono-military text-sm">
                '{lastResult.inputChar}'
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-stone-400">
              <span>Rotors:</span>
              <span className="text-stone-400 font-mono">
                {lastResult.previousPositions.join('')}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-amber-400 font-bold font-mono">
                {lastResult.currentPositions.join('')}
              </span>
              {lastResult.stepping.middleStepped && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 rounded ml-1">
                  {lastResult.stepping.leftStepped ? 'DOUBLE-STEP' : 'MID-STEP'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stone-400">Output:</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold font-mono-military text-sm">
                '{lastResult.outputChar}'
              </span>
            </div>
          </div>

          {/* Step list / timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[11px] font-mono max-h-80 overflow-y-auto pr-1">
            {lastResult.signalPath.map((step, idx) => {
              const isFwd = step.stage.includes('FWD') || step.stage === 'PLUGBOARD_IN' || step.stage === 'KEYBOARD' || step.stage === 'ETW_IN';
              const isRef = step.stage === 'REFLECTOR';

              return (
                <div
                  key={idx}
                  className={`
                    p-2 rounded-lg border flex flex-col justify-between
                    ${
                      isRef
                        ? 'bg-amber-950/40 border-amber-700/60 text-amber-200'
                        : isFwd
                        ? 'bg-stone-950/70 border-stone-800 text-stone-300'
                        : 'bg-stone-950/90 border-stone-800/90 text-stone-300'
                    }
                  `}
                >
                  <div className="flex items-center justify-between text-[10px] text-stone-400 border-b border-stone-800/80 pb-1 mb-1">
                    <span className="font-bold text-amber-400/90">
                      {idx + 1}. {step.name}
                    </span>
                    <span className="text-[9px] uppercase px-1 rounded bg-stone-900 text-stone-400">
                      {isRef ? 'Reflect' : isFwd ? 'Forward →' : '← Reverse'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between font-bold my-1">
                    <span className="bg-stone-900 px-1.5 py-0.5 rounded border border-stone-700 text-stone-200">
                      '{step.inputChar}'
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                    <span className="bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-800/60 text-amber-300">
                      '{step.outputChar}'
                    </span>
                  </div>

                  <p className="text-[10px] text-stone-400 truncate mt-1">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
