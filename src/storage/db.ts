import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { EnigmaMachineConfig } from '../engine/enigma';

export interface CampaignProgressRecord {
  missionId: string;
  completed: boolean;
  completedAt?: string;
  currentStepIndex: number;
  hintsUsedCount: number;
  keystrokesCount: number;
  deductionsMade: string[];
}

export interface MachinePresetRecord {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  config: EnigmaMachineConfig;
  isHistoricalDefault?: boolean;
}

export interface AppSettingsRecord {
  id: 'preferences';
  theme: 'dark' | 'military' | 'high-contrast';
  soundEnabled: boolean;
  reducedMotion: boolean;
  autoGroupFiveLetters: boolean;
  showSignalExplanation: boolean;
  keyboardLayout: 'QWERTZ' | 'QWERTY';
}

export interface NotebookEntryRecord {
  id: string;
  messageId: string;
  title: string;
  notes: string;
  config: EnigmaMachineConfig;
  candidateScore?: number;
  decryptedPlaintext?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UnlockedFeaturesRecord {
  id: 'unlocks';
  advancedWorkstationControls: boolean;
  cribAnalysisUnlocked: boolean;
  automatedSearchUnlocked: boolean;
  statisticalToolsUnlocked: boolean;
  completedMissions: string[];
  completedMasteryChallenges: string[];
}

export interface EnigmaDBSchema extends DBSchema {
  settings: {
    key: string;
    value: AppSettingsRecord;
  };
  campaign_progress: {
    key: string; // missionId
    value: CampaignProgressRecord;
  };
  machine_presets: {
    key: string; // preset id
    value: MachinePresetRecord;
  };
  simulator_state: {
    key: string;
    value: {
      id: 'last_state';
      config: EnigmaMachineConfig;
      inputText: string;
      outputText: string;
    };
  };
  notebook_entries: {
    key: string;
    value: NotebookEntryRecord;
  };
  unlocked_features: {
    key: string;
    value: UnlockedFeaturesRecord;
  };
}

const DB_NAME = 'project_enigma_db';
const DB_VERSION = 2;

class StorageManager {
  private dbPromise: Promise<IDBPDatabase<EnigmaDBSchema>> | null = null;

  private async getDB(): Promise<IDBPDatabase<EnigmaDBSchema> | null> {
    if (typeof indexedDB === 'undefined') {
      return null;
    }
    if (!this.dbPromise) {
      this.dbPromise = openDB<EnigmaDBSchema>(DB_NAME, DB_VERSION, {
        upgrade(db, _oldVersion, _newVersion) {
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('campaign_progress')) {
            db.createObjectStore('campaign_progress', { keyPath: 'missionId' });
          }
          if (!db.objectStoreNames.contains('machine_presets')) {
            db.createObjectStore('machine_presets', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('simulator_state')) {
            db.createObjectStore('simulator_state', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('notebook_entries')) {
            db.createObjectStore('notebook_entries', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('unlocked_features')) {
            db.createObjectStore('unlocked_features', { keyPath: 'id' });
          }
        },
      });
    }
    return this.dbPromise;
  }

  // --- Settings ---
  public async getSettings(): Promise<AppSettingsRecord> {
    const defaultSettings: AppSettingsRecord = {
      id: 'preferences',
      theme: 'military',
      soundEnabled: true,
      reducedMotion: false,
      autoGroupFiveLetters: true,
      showSignalExplanation: true,
      keyboardLayout: 'QWERTZ',
    };

    try {
      const db = await this.getDB();
      if (!db) return defaultSettings;
      const stored = await db.get('settings', 'preferences');
      return stored ? { ...defaultSettings, ...stored } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  }

  public async saveSettings(settings: Partial<AppSettingsRecord>): Promise<void> {
    try {
      const db = await this.getDB();
      if (!db) return;
      const current = await this.getSettings();
      await db.put('settings', { ...current, ...settings, id: 'preferences' });
    } catch (e) {
      console.error('Failed to save settings to IndexedDB:', e);
    }
  }

  // --- Campaign Progress ---
  public async getCampaignProgress(missionId: string): Promise<CampaignProgressRecord | null> {
    try {
      const db = await this.getDB();
      if (!db) return null;
      return (await db.get('campaign_progress', missionId)) || null;
    } catch {
      return null;
    }
  }

  public async saveCampaignProgress(progress: CampaignProgressRecord): Promise<void> {
    try {
      const db = await this.getDB();
      if (!db) return;
      await db.put('campaign_progress', progress);
    } catch (e) {
      console.error('Failed to save campaign progress:', e);
    }
  }

  public async resetCampaignProgress(): Promise<void> {
    try {
      const db = await this.getDB();
      if (!db) return;
      await db.clear('campaign_progress');
    } catch (e) {
      console.error('Failed to reset campaign progress:', e);
    }
  }

  // --- Machine Presets ---
  public async getPresets(): Promise<MachinePresetRecord[]> {
    try {
      const db = await this.getDB();
      if (!db) return this.getDefaultPresets();
      const presets = await db.getAll('machine_presets');
      return presets.length > 0 ? presets : this.getDefaultPresets();
    } catch {
      return this.getDefaultPresets();
    }
  }

  public async savePreset(preset: MachinePresetRecord): Promise<void> {
    try {
      const db = await this.getDB();
      if (!db) return;
      await db.put('machine_presets', preset);
    } catch (e) {
      console.error('Failed to save preset:', e);
    }
  }

  public async deletePreset(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      if (!db) return;
      await db.delete('machine_presets', id);
    } catch (e) {
      console.error('Failed to delete preset:', e);
    }
  }

  public getDefaultPresets(): MachinePresetRecord[] {
    return [
      {
        id: 'default-wehrmacht-1939',
        name: 'Standard Military (1939)',
        description: 'Standard Wehrmacht Enigma I setup with Rotors I-II-III and Reflector B.',
        createdAt: new Date().toISOString(),
        isHistoricalDefault: true,
        config: {
          rotors: [
            { type: 'I', position: 'A', ringSetting: 1 },
            { type: 'II', position: 'A', ringSetting: 1 },
            { type: 'III', position: 'A', ringSetting: 1 },
          ],
          reflector: 'B',
          plugboard: [],
        },
      },
      {
        id: 'operation-barbarossa-1941',
        name: 'Operation Barbarossa Key (1941)',
        description: 'Rotors II-IV-V with 10 stecker pairs and customized ring settings.',
        createdAt: new Date().toISOString(),
        isHistoricalDefault: true,
        config: {
          rotors: [
            { type: 'II', position: 'B', ringSetting: 2 },
            { type: 'IV', position: 'L', ringSetting: 21 },
            { type: 'V', position: 'A', ringSetting: 12 },
          ],
          reflector: 'B',
          plugboard: ['AV', 'BS', 'CG', 'DL', 'FU', 'HZ', 'IN', 'KM', 'OW', 'RX'],
        },
      },
      {
        id: 'turing-bombe-benchmark',
        name: 'Bletchley Park Test Vector',
        description: 'Rotors I-II-III with steckers matching classic cryptanalysis test sets.',
        createdAt: new Date().toISOString(),
        isHistoricalDefault: true,
        config: {
          rotors: [
            { type: 'I', position: 'R', ringSetting: 5 },
            { type: 'II', position: 'G', ringSetting: 14 },
            { type: 'III', position: 'Z', ringSetting: 20 },
          ],
          reflector: 'B',
          plugboard: ['EJ', 'OY', 'IV', 'AQ', 'KW', 'FX', 'MT', 'PS', 'LU', 'BD'],
        },
      },
    ];
  }

  // --- Investigation Notebook ---
  public async getNotebookEntries(): Promise<NotebookEntryRecord[]> {
    try {
      const db = await this.getDB();
      if (!db) return [];
      const entries = await db.getAll('notebook_entries');
      return entries.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch {
      return [];
    }
  }

  public async saveNotebookEntry(entry: NotebookEntryRecord): Promise<void> {
    try {
      const db = await this.getDB();
      if (!db) return;
      await db.put('notebook_entries', entry);
    } catch (e) {
      console.error('Failed to save notebook entry:', e);
    }
  }

  public async deleteNotebookEntry(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      if (!db) return;
      await db.delete('notebook_entries', id);
    } catch (e) {
      console.error('Failed to delete notebook entry:', e);
    }
  }

  // --- Unlocked Features ---
  public async getUnlockedFeatures(): Promise<UnlockedFeaturesRecord> {
    const defaultUnlocks: UnlockedFeaturesRecord = {
      id: 'unlocks',
      advancedWorkstationControls: false,
      cribAnalysisUnlocked: true,
      automatedSearchUnlocked: true,
      statisticalToolsUnlocked: true,
      completedMissions: [],
      completedMasteryChallenges: [],
    };

    try {
      const db = await this.getDB();
      if (!db) return defaultUnlocks;
      const stored = await db.get('unlocked_features', 'unlocks');
      return stored ? { ...defaultUnlocks, ...stored } : defaultUnlocks;
    } catch {
      return defaultUnlocks;
    }
  }

  public async saveUnlockedFeatures(unlocks: Partial<UnlockedFeaturesRecord>): Promise<void> {
    try {
      const db = await this.getDB();
      if (!db) return;
      const current = await this.getUnlockedFeatures();
      await db.put('unlocked_features', { ...current, ...unlocks, id: 'unlocks' });
    } catch (e) {
      console.error('Failed to save unlocked features:', e);
    }
  }

  // --- Reset All Data ---
  public async resetAllData(): Promise<void> {
    try {
      const db = await this.getDB();
      if (!db) return;
      await db.clear('settings');
      await db.clear('campaign_progress');
      await db.clear('machine_presets');
      await db.clear('simulator_state');
      await db.clear('notebook_entries');
      await db.clear('unlocked_features');
    } catch (e) {
      console.error('Failed to reset all data:', e);
    }
  }
}

export const storage = new StorageManager();
