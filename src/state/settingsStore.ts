import { create } from 'zustand';
import { AppSettingsRecord, storage } from '../storage/db';

export interface SettingsState extends AppSettingsRecord {
  setTheme: (theme: 'dark' | 'military' | 'high-contrast') => void;
  setSoundEnabled: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  setAutoGroupFiveLetters: (enabled: boolean) => void;
  setShowSignalExplanation: (enabled: boolean) => void;
  setKeyboardLayout: (layout: 'QWERTZ' | 'QWERTY') => void;
  loadSettings: () => Promise<void>;
  resetAllSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  id: 'preferences',
  theme: 'military',
  soundEnabled: true,
  reducedMotion: false,
  autoGroupFiveLetters: true,
  showSignalExplanation: true,
  keyboardLayout: 'QWERTZ',

  setTheme: (theme) => {
    set({ theme });
    storage.saveSettings({ theme });
  },

  setSoundEnabled: (soundEnabled) => {
    set({ soundEnabled });
    storage.saveSettings({ soundEnabled });
  },

  setReducedMotion: (reducedMotion) => {
    set({ reducedMotion });
    storage.saveSettings({ reducedMotion });
  },

  setAutoGroupFiveLetters: (autoGroupFiveLetters) => {
    set({ autoGroupFiveLetters });
    storage.saveSettings({ autoGroupFiveLetters });
  },

  setShowSignalExplanation: (showSignalExplanation) => {
    set({ showSignalExplanation });
    storage.saveSettings({ showSignalExplanation });
  },

  setKeyboardLayout: (keyboardLayout) => {
    set({ keyboardLayout });
    storage.saveSettings({ keyboardLayout });
  },

  loadSettings: async () => {
    const loaded = await storage.getSettings();
    set(loaded);
  },

  resetAllSettings: async () => {
    await storage.resetAllData();
    const loaded = await storage.getSettings();
    set(loaded);
  },
}));
