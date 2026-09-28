import { test, expect } from '@playwright/test';

test.describe('Enigma Simulator End-to-End', () => {
  test('navigates through tabs and verifies simulator interactivity', async ({ page }) => {
    await page.goto('/');

    // Check Home page
    await expect(page.getByRole('heading', { name: 'PROJECT ENIGMA' })).toBeVisible();

    // Navigate to Simulator
    await page.getByRole('button', { name: 'Enigma Simulator' }).first().click();

    await expect(page.getByText('Glühlampenfeld (Lampboard)')).toBeVisible();

    // Test virtual typing on key A
    const keyA = page.getByTestId('key-A');
    await keyA.click();

    // Verify paper tape receives encrypted letter
    await expect(page.getByText('B', { exact: true })).toBeVisible();

    // Navigate to Campaign
    await page.getByRole('button', { name: 'Campaign' }).first().click();
    await expect(page.getByText('Your First Encrypted Message')).toBeVisible();

    // Navigate to Workstation
    await page.getByRole('button', { name: 'Workstation' }).first().click();
    await expect(page.getByText('Cryptanalysis Workstation')).toBeVisible();
    await expect(page.getByText('In Design (v0.2)')).toBeVisible();

    // Navigate to About
    await page.getByRole('button', { name: 'About & History' }).first().click();
    await expect(page.getByText('The History of Enigma Cryptography')).toBeVisible();
  });
});
