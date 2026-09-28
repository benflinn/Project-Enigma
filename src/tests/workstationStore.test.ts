import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkstationStore } from '../state/workstationStore';
import { useSimulatorStore } from '../state/simulatorStore';
import { storage } from '../storage/db';
import { TRAINING_MESSAGES } from '../engine/cryptanalysis/interceptArchive';
import { EnigmaMachineConfig } from '../engine/enigma';

describe('Workstation Store & Investigation Notebook', () => {
  beforeEach(async () => {
    await storage.resetAllData();
  });

  it('initializes with default training message and search bounds', () => {
    const state = useWorkstationStore.getState();
    expect(state.selectedMessageId).toBe(TRAINING_MESSAGES[0].id);
    expect(state.controlMode).toBe('basic');
    expect(state.activeTab).toBe('archive');
    expect(state.searchBounds).toBeDefined();
    expect(state.searchBounds.rotorOrders.length).toBeGreaterThan(0);
  });

  it('selects message and dynamically updates suggested crib and search bounds', () => {
    const store = useWorkstationStore.getState();
    store.selectMessage('intercept-202-delta');

    const updated = useWorkstationStore.getState();
    expect(updated.selectedMessageId).toBe('intercept-202-delta');
    expect(updated.cribInput).toBe('WETTERBERICHT');
    expect(updated.searchBounds.rotorOrders[0]).toEqual(['III', 'II', 'I']);
  });

  it('saves, retrieves, and deletes investigation notebook entries in IndexedDB', async () => {
    const store = useWorkstationStore.getState();

    await store.saveToNotebook(
      'Test Hypothesis Alpha',
      'Rotors I-II-III at AAG produces valid weather report.',
      {
        rotors: [
          { type: 'I', position: 'A', ringSetting: 1 },
          { type: 'II', position: 'A', ringSetting: 1 },
          { type: 'III', position: 'G', ringSetting: 1 },
        ],
        reflector: 'B',
        plugboard: [],
      },
      0.0667,
      'WEATHERREPORTTEMPTWELVE'
    );

    const updated = useWorkstationStore.getState();
    expect(updated.notebookEntries.length).toBe(1);
    expect(updated.notebookEntries[0].title).toBe('Test Hypothesis Alpha');
    expect(updated.notebookEntries[0].decryptedPlaintext).toBe('WEATHERREPORTTEMPTWELVE');

    // Delete entry
    const entryId = updated.notebookEntries[0].id;
    await store.deleteNotebookEntry(entryId);

    const afterDelete = useWorkstationStore.getState();
    expect(afterDelete.notebookEntries.length).toBe(0);
  });

  it('transfers candidate configuration to physical simulator store', () => {
    const store = useWorkstationStore.getState();

    const testConfig: EnigmaMachineConfig = {
      rotors: [
        { type: 'IV', position: 'X', ringSetting: 5 },
        { type: 'II', position: 'Y', ringSetting: 10 },
        { type: 'V', position: 'Z', ringSetting: 15 },
      ],
      reflector: 'C',
      plugboard: ['AB', 'CD'],
    };

    store.transferConfigToSimulator(testConfig, 'SECRETTESTCIPHER');

    const currentSim = useSimulatorStore.getState();
    expect(currentSim.config.rotors.map((r) => r.type)).toEqual(['IV', 'II', 'V']);
    expect(currentSim.initialPositions).toEqual(['X', 'Y', 'Z']);
    expect(currentSim.config.rotors.map((r) => r.ringSetting)).toEqual([5, 10, 15]);
    expect(currentSim.config.reflector).toBe('C');
    expect(currentSim.config.plugboard).toEqual(['AB', 'CD']);
    expect(currentSim.outputText.length).toBe('SECRETTESTCIPHER'.length);
  });
});
