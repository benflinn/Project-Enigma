import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { App } from '../app/App';
import { EnigmaMachineView } from '../features/simulator/EnigmaMachineView';
import { TutorialMissionView } from '../features/campaign/TutorialMissionView';
import { CampaignView } from '../features/campaign/CampaignView';
import { WorkstationView } from '../features/workstation/WorkstationView';
import { useSimulatorStore } from '../state/simulatorStore';
import { useCampaignStore } from '../state/campaignStore';
import { DEFAULT_ENIGMA_CONFIG } from '../engine/enigma';

describe('Enigma Machine Simulator Components', () => {
  beforeEach(() => {
    act(() => {
      useSimulatorStore.getState().loadConfig(DEFAULT_ENIGMA_CONFIG);
      useSimulatorStore.getState().clearText();
    });
  });

  it('renders simulator with rotors, keyboard, lampboard, and plugboard', () => {
    render(<EnigmaMachineView />);

    expect(screen.getByText(/Enigma I Simulator/i)).toBeInTheDocument();
    expect(screen.getByText(/Rotor Vault/i)).toBeInTheDocument();
    expect(screen.getByText(/Glühlampenfeld/i)).toBeInTheDocument();
    expect(screen.getByText(/Tastatur/i)).toBeInTheDocument();
    expect(screen.getByText(/Steckerbrett/i)).toBeInTheDocument();
  });

  it('advances rotors, illuminates lamp, and appends to output when virtual key is pressed', () => {
    render(<EnigmaMachineView />);

    const keyA = screen.getByTestId('key-A');
    expect(keyA).toBeInTheDocument();

    // Rotors start at AAA
    expect(useSimulatorStore.getState().currentPositions).toEqual(['A', 'A', 'A']);

    // Click 'A' -> Stepping occurs (Right rotor A -> B), 'A' encrypts to 'B' under default vector
    act(() => {
      fireEvent.mouseDown(keyA);
    });

    expect(useSimulatorStore.getState().currentPositions).toEqual(['A', 'A', 'B']);
    expect(useSimulatorStore.getState().outputText).toBe('B');

    // Lamp B should be illuminated
    const lampB = screen.getByTestId('lamp-B');
    expect(lampB).toHaveAttribute('data-active', 'true');

    act(() => {
      fireEvent.mouseUp(keyA);
    });
    expect(lampB).toHaveAttribute('data-active', 'false');
  });

  it('allows connecting and disconnecting plugboard cables', () => {
    render(<EnigmaMachineView />);

    const plugA = screen.getByTestId('plug-A');
    const plugB = screen.getByTestId('plug-B');

    // Click Socket A then Socket B to create connection
    act(() => {
      fireEvent.click(plugA);
    });
    expect(useSimulatorStore.getState().selectedCableSocket).toBe('A');

    act(() => {
      fireEvent.click(plugB);
    });

    expect(useSimulatorStore.getState().config.plugboard).toContain('AB');

    // Clicking plugged socket A again disconnects it
    act(() => {
      fireEvent.click(plugA);
    });
    expect(useSimulatorStore.getState().config.plugboard).not.toContain('AB');
  });

  it('resets machine to starting positions when Reset button is clicked', () => {
    render(<EnigmaMachineView />);

    // Type 3 letters: starting from AAA -> AAB -> AAC -> AAD
    act(() => {
      useSimulatorStore.getState().pressKey('A');
      useSimulatorStore.getState().pressKey('B');
      useSimulatorStore.getState().pressKey('C');
    });

    expect(useSimulatorStore.getState().currentPositions).toEqual(['A', 'A', 'D']);

    const resetBtn = screen.getByRole('button', { name: /Reset to Start/i });
    act(() => {
      fireEvent.click(resetBtn);
    });

    expect(useSimulatorStore.getState().currentPositions).toEqual(['A', 'A', 'A']);
  });
});

describe('Cryptanalysis Campaign Operations & Workstation', () => {
  beforeEach(() => {
    act(() => {
      useCampaignStore.getState().exitMission();
      useSimulatorStore.getState().loadConfig(DEFAULT_ENIGMA_CONFIG);
      useSimulatorStore.getState().clearText();
    });
  });

  it('renders tutorial mission step 1 briefing', () => {
    act(() => {
      useCampaignStore.getState().startTutorial();
    });
    render(<TutorialMissionView />);

    const titles = screen.getAllByText(/Your First Encrypted Message/i);
    expect(titles.length).toBeGreaterThanOrEqual(1);
    const briefings = screen.getAllByText(/Mission Briefing/i);
    expect(briefings.length).toBeGreaterThanOrEqual(1);
  });

  it('renders Campaign Hub with all 6 missions', () => {
    act(() => {
      useCampaignStore.getState().exitMission();
    });
    render(<CampaignView />);

    expect(screen.getByText(/Cryptanalysis Operations Hub/i)).toBeInTheDocument();
    expect(screen.getByText(/The Plugboard Problem/i)).toBeInTheDocument();
    expect(screen.getByText(/Multiple Possibilities/i)).toBeInTheDocument();
    expect(screen.getByText(/The Analyst’s Desk/i)).toBeInTheDocument();
  });

  it('renders Cryptanalysis Workstation with strategy controls and profile trigger', () => {
    render(<WorkstationView />);

    expect(screen.getByText(/Cryptanalysis Workstation/i)).toBeInTheDocument();
    expect(screen.getByText(/Profile:/i)).toBeInTheDocument();
    const archives = screen.getAllByText(/Intercept Archive/i);
    expect(archives.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Statistical Analysis/i)).toBeInTheDocument();
    expect(screen.getByText(/Crib-Testing Tool/i)).toBeInTheDocument();
    expect(screen.getByText(/Automated Search/i)).toBeInTheDocument();
  });
});

describe('Application Shell & Navigation', () => {
  it('switches between tabs', () => {
    render(<App />);

    const brand = screen.getAllByText(/PROJECT ENIGMA/i);
    expect(brand.length).toBeGreaterThanOrEqual(1);

    // Click Enigma Simulator nav button
    const simNavButtons = screen.getAllByRole('button', { name: /Enigma Simulator/i });
    act(() => {
      fireEvent.click(simNavButtons[0]);
    });
    expect(screen.getByText(/Glühlampenfeld/i)).toBeInTheDocument();

    // Click About nav button
    const aboutNavButtons = screen.getAllByRole('button', { name: /About & History/i });
    act(() => {
      fireEvent.click(aboutNavButtons[0]);
    });
    expect(screen.getByText(/The History of Enigma Cryptography/i)).toBeInTheDocument();
  });
});
