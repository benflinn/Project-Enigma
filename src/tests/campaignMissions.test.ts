import { describe, it, expect, beforeEach } from 'vitest';
import { useCampaignStore } from '../state/campaignStore';
import { storage } from '../storage/db';
import { ALL_MISSIONS, MASTERY_CHALLENGES } from '../features/campaign/campaignMissions';

describe('Campaign Operations & Mastery Challenges', () => {
  beforeEach(async () => {
    await storage.resetAllData();
  });

  it('contains 3 complete training operations', () => {
    expect(ALL_MISSIONS.length).toBe(3);
    expect(ALL_MISSIONS[0].id).toBe('mission-1-first-message');
    expect(ALL_MISSIONS[1].id).toBe('mission-2-finding-a-clue');
    expect(ALL_MISSIONS[2].id).toBe('mission-3-automated-breakthrough');
  });

  it('advances through Mission 2 and handles crib clash deductions', () => {
    const store = useCampaignStore.getState();
    store.selectMission('mission-2-finding-a-clue');
    store.startMission('mission-2-finding-a-clue');

    expect(useCampaignStore.getState().isMissionActive).toBe(true);
    expect(useCampaignStore.getState().currentStepIndex).toBe(0);

    // Step 0 -> Step 1
    store.advanceStep();
    expect(useCampaignStore.getState().currentStepIndex).toBe(1);

    // Step 1 -> Step 2 (Question on clash detection)
    store.advanceStep();
    const stateAtQ = useCampaignStore.getState();
    expect(stateAtQ.currentStepIndex).toBe(2);

    // Answer incorrectly first (Choice 0)
    const resIncorrect = store.answerQuestion(0);
    expect(resIncorrect).toBe(false);
    expect(useCampaignStore.getState().questionAnsweredCorrectly).toBe(false);

    // Answer correctly (Choice 1: Enigma can never encrypt to itself)
    const resCorrect = store.answerQuestion(1);
    expect(resCorrect).toBe(true);
    expect(useCampaignStore.getState().questionAnsweredCorrectly).toBe(true);
  });

  it('completes mastery challenge and records unlock reward', async () => {
    const store = useCampaignStore.getState();
    const challenge = MASTERY_CHALLENGES[0];

    await store.completeMasteryChallenge(challenge.id);

    const updated = useCampaignStore.getState();
    expect(updated.completedMasteryChallenges).toContain(challenge.id);

    const storedUnlocks = await storage.getUnlockedFeatures();
    expect(storedUnlocks.completedMasteryChallenges).toContain(challenge.id);
    expect(storedUnlocks.advancedWorkstationControls).toBe(true);
  });
});
