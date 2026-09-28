import React, { useState, useEffect } from 'react';
import { HomeView } from '../features/home/HomeView';
import { EnigmaMachineView } from '../features/simulator/EnigmaMachineView';
import { TutorialMissionView } from '../features/campaign/TutorialMissionView';
import { WorkstationView } from '../features/workstation/WorkstationView';
import { AboutView } from '../features/about/AboutView';
import { useSettingsStore } from '../state/settingsStore';
import {
  Shield,
  Home,
  Sliders,
  BookOpen,
  Cpu,
  Info,
  Settings,
  RefreshCw,
  X,
} from 'lucide-react';

export type NavigationTab = 'home' | 'simulator' | 'campaign' | 'workstation' | 'about';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const {
    reducedMotion,
    setReducedMotion,
    loadSettings,
    resetAllSettings,
  } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleResetAllData = async () => {
    await resetAllSettings();
    setResetConfirmOpen(false);
    setSettingsOpen(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-600 selection:text-white">
      {/* Top Application Navigation Bar */}
      <header className="sticky top-0 z-40 bg-stone-950/90 backdrop-blur-md border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo / Brand */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 text-left group cursor-pointer outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-stone-900 border border-stone-700 flex items-center justify-center text-amber-500 shadow group-hover:border-amber-500 transition-colors">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-cinzel text-base font-bold text-amber-400 tracking-wider block">
                PROJECT ENIGMA
              </span>
              <span className="text-[10px] text-stone-400 font-mono block -mt-1">
                Historical Simulator & Workstation v0.3
              </span>
            </div>
          </button>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-900/80 p-1 rounded-xl border border-stone-800">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-600/50 shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              Home
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                activeTab === 'simulator'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-600/50 shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Enigma Simulator
            </button>

            <button
              onClick={() => setActiveTab('campaign')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                activeTab === 'campaign'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-600/50 shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Campaign
            </button>

            <button
              onClick={() => setActiveTab('workstation')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                activeTab === 'workstation'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-600/50 shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Workstation
              <span className="text-[9px] bg-stone-800 text-amber-400/90 px-1 rounded border border-stone-700">
                v0.3
              </span>
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                activeTab === 'about'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-600/50 shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              About & History
            </button>
          </nav>

          {/* Quick Actions (Settings & Sound) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 rounded-lg bg-stone-900 border border-stone-800 hover:border-stone-700 text-stone-300 hover:text-amber-400 transition-colors cursor-pointer"
              title="Preferences & Accessibility Settings"
              aria-label="Preferences"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-around border-t border-stone-800/80 py-2 bg-stone-950 px-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-2.5 py-1 rounded text-xs font-mono ${
              activeTab === 'home' ? 'text-amber-400 font-bold' : 'text-stone-400'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-2.5 py-1 rounded text-xs font-mono ${
              activeTab === 'simulator' ? 'text-amber-400 font-bold' : 'text-stone-400'
            }`}
          >
            Simulator
          </button>
          <button
            onClick={() => setActiveTab('campaign')}
            className={`px-2.5 py-1 rounded text-xs font-mono ${
              activeTab === 'campaign' ? 'text-amber-400 font-bold' : 'text-stone-400'
            }`}
          >
            Campaign
          </button>
          <button
            onClick={() => setActiveTab('workstation')}
            className={`px-2.5 py-1 rounded text-xs font-mono ${
              activeTab === 'workstation' ? 'text-amber-400 font-bold' : 'text-stone-400'
            }`}
          >
            Workstation
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-2.5 py-1 rounded text-xs font-mono ${
              activeTab === 'about' ? 'text-amber-400 font-bold' : 'text-stone-400'
            }`}
          >
            About
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'home' && <HomeView onNavigate={setActiveTab} />}
        {activeTab === 'simulator' && <EnigmaMachineView />}
        {activeTab === 'campaign' && <TutorialMissionView />}
        {activeTab === 'workstation' && <WorkstationView />}
        {activeTab === 'about' && <AboutView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-900 bg-stone-950 py-6 text-center text-xs font-mono text-stone-500">
        <p>PROJECT ENIGMA • Version 0.1 • Dedicated to the Cryptanalysts of the Biuro Szyfrów & Bletchley Park</p>
      </footer>

      {/* Preferences & Accessibility Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-cinzel text-base font-bold text-amber-400 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings & Accessibility
              </h3>
              <button
                onClick={() => setSettingsOpen(false)}
                className="text-stone-400 hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono text-stone-300">
              {/* Reduced Motion */}
              <div className="flex items-center justify-between p-2.5 bg-stone-950 rounded-lg border border-stone-800">
                <div>
                  <span className="font-bold block text-stone-200">Reduced Motion</span>
                  <span className="text-[11px] text-stone-400">Minimizes keypress & lamp animations</span>
                </div>
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={(e) => setReducedMotion(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </div>

              {/* Reset All IndexedDB Data */}
              <div className="pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setResetConfirmOpen(true)}
                  className="w-full py-2 rounded bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset Campaign Progress & Storage
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Reset Dialog */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-red-800 rounded-xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <h4 className="font-cinzel text-red-400 font-bold text-base">Confirm Reset</h4>
            <p className="text-xs font-mono text-stone-300 leading-relaxed">
              This will reset your campaign tutorial progress and custom machine presets stored in IndexedDB. Are you sure?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="px-3 py-1.5 rounded bg-stone-800 text-stone-300 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={handleResetAllData}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs font-mono"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
