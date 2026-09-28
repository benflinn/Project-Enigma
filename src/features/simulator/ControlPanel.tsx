import React, { useState } from 'react';
import { useSimulatorStore } from '../../state/simulatorStore';
import { storage, MachinePresetRecord } from '../../storage/db';
import {
  RotateCcw,
  Bookmark,
  Send,
  Trash2,
  Check,
  Upload,
  Layers,
  X,
} from 'lucide-react';

export const ControlPanel: React.FC = () => {
  const {
    config,
    currentPositions,
    initialPositions,
    resetToInitialState,
    setInitialPositions,
    clearText,
    loadConfig,
    encryptBatchMessage,
  } = useSimulatorStore();

  const [presetsOpen, setPresetsOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [savePresetOpen, setSavePresetOpen] = useState(false);

  const [batchInput, setBatchInput] = useState('');
  const [presetName, setPresetName] = useState('');
  const [presetDesc, setPresetDesc] = useState('');
  const [presetsList, setPresetsList] = useState<MachinePresetRecord[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenPresets = async () => {
    const list = await storage.getPresets();
    setPresetsList(list);
    setPresetsOpen(true);
  };

  const handleSelectPreset = (preset: MachinePresetRecord) => {
    loadConfig(preset.config);
    setPresetsOpen(false);
    showNotification(`Loaded preset: "${preset.name}"`);
  };

  const handleSavePreset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetName.trim()) return;

    const newRecord: MachinePresetRecord = {
      id: `custom-${Date.now()}`,
      name: presetName.trim(),
      description: presetDesc.trim() || 'Custom user configuration',
      createdAt: new Date().toISOString(),
      config: JSON.parse(JSON.stringify(config)),
    };

    await storage.savePreset(newRecord);
    setPresetName('');
    setPresetDesc('');
    setSavePresetOpen(false);
    showNotification(`Saved preset "${newRecord.name}"`);
  };

  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchInput.trim()) return;
    encryptBatchMessage(batchInput);
    setBatchInput('');
    setBatchOpen(false);
    showNotification('Batch message encrypted successfully');
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-xl select-none">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Reset Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Reset Machine to Starting Grundstellung */}
          <button
            onClick={() => {
              resetToInitialState();
              showNotification(`Rotors reset to initial position: ${initialPositions.join('')}`);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold font-mono text-xs shadow-md transition-colors"
            title="Restore rotors to original starting positions to reproduce or decrypt a message"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Start ({initialPositions.join('')})
          </button>

          {/* Set Current as Start */}
          <button
            onClick={() => {
              setInitialPositions(currentPositions);
              showNotification(`New starting baseline set: ${currentPositions.join('')}`);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-mono text-xs border border-stone-700 transition-colors"
            title="Set current rotor positions as the baseline for future resets"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            Set Start ({currentPositions.join('')})
          </button>

          {/* Clear Text Display */}
          <button
            onClick={() => {
              clearText();
              showNotification('Text tape cleared');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-red-400 font-mono text-xs border border-stone-700 transition-colors"
            title="Clear text ribbons without moving rotors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Tape
          </button>
        </div>

        {/* Tools & Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setBatchOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono text-xs border border-stone-700 transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-amber-400" />
            Batch Encrypt
          </button>

          <button
            onClick={handleOpenPresets}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono text-xs border border-stone-700 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            Historical Presets
          </button>

          <button
            onClick={() => setSavePresetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono text-xs border border-stone-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            Save Preset
          </button>
        </div>
      </div>

      {notification && (
        <div className="mt-3 py-1.5 px-3 bg-amber-950/60 border border-amber-600/50 rounded text-amber-300 text-xs font-mono flex items-center gap-2 animate-fade-in">
          <Check className="w-3.5 h-3.5 text-amber-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Modal: Batch Encrypt */}
      {batchOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-xl max-w-lg w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
              <h3 className="font-cinzel text-base font-bold text-amber-400 flex items-center gap-2">
                <Send className="w-4 h-4" />
                Batch Message Encryption
              </h3>
              <button
                onClick={() => setBatchOpen(false)}
                className="text-stone-400 hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBatchSubmit} className="space-y-4">
              <p className="text-xs text-stone-300 font-mono">
                Paste or type a plaintext message. Non-alphabetical characters are automatically filtered.
              </p>

              <textarea
                rows={4}
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                placeholder="TYPE OR PASTE MESSAGE HERE..."
                className="w-full bg-stone-950 border border-stone-700 rounded-lg p-3 text-amber-300 font-mono-military text-sm uppercase outline-none focus:border-amber-500"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBatchOpen(false)}
                  className="px-3 py-1.5 rounded bg-stone-800 text-stone-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold font-mono text-xs"
                >
                  Encrypt Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Historical Presets */}
      {presetsOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-xl max-w-xl w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
              <h3 className="font-cinzel text-base font-bold text-amber-400 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Historical & Saved Machine Presets
              </h3>
              <button
                onClick={() => setPresetsOpen(false)}
                className="text-stone-400 hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {presetsList.map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-stone-950 border border-stone-800 hover:border-amber-600/60 rounded-lg flex flex-col justify-between gap-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-amber-300 text-sm">{p.name}</h4>
                      <p className="text-xs text-stone-400 font-mono mt-0.5">{p.description}</p>
                    </div>
                    {p.isHistoricalDefault && (
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/60">
                        Historical
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs font-mono text-stone-400 pt-2 border-t border-stone-800/60">
                    <div>
                      Rotors: <strong className="text-stone-200">{p.config.rotors.map((r) => r.type).join('-')}</strong> | Reflector: <strong className="text-stone-200">{p.config.reflector}</strong> | Rings: <strong className="text-stone-200">{p.config.rotors.map((r) => r.ringSetting).join('-')}</strong>
                    </div>

                    <button
                      onClick={() => handleSelectPreset(p)}
                      className="px-3 py-1 rounded bg-stone-800 hover:bg-amber-600 hover:text-stone-950 text-stone-200 font-bold transition-colors"
                    >
                      Load Setup
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Save Custom Preset */}
      {savePresetOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-xl max-w-md w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
              <h3 className="font-cinzel text-base font-bold text-amber-400 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Save Machine Configuration
              </h3>
              <button
                onClick={() => setSavePresetOpen(false)}
                className="text-stone-400 hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePreset} className="space-y-4">
              <div>
                <label className="block text-xs text-stone-400 font-mono mb-1">Preset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Intercept Key #4"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded p-2 text-stone-200 text-xs font-mono outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-400 font-mono mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Notes on mission or test parameters"
                  value={presetDesc}
                  onChange={(e) => setPresetDesc(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded p-2 text-stone-200 text-xs font-mono outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSavePresetOpen(false)}
                  className="px-3 py-1.5 rounded bg-stone-800 text-stone-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold font-mono text-xs"
                >
                  Save Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
