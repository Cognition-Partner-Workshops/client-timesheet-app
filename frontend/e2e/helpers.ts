import { Page, expect } from '@playwright/test';

export const TEST_EMAIL = 'test@example.com';

export async function login(page: Page, email: string = TEST_EMAIL) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.getByLabel('Email Address').fill(email);
  await page.getByRole('button', { name: 'Log In' }).click();
  await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
}

export async function createClient(page: Page, name: string, description?: string) {
  await page.goto('/clients');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Add Client' }).click();
  await page.getByLabel('Client Name').fill(name);
  if (description) {
    await page.getByLabel('Description').fill(description);
  }
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByText(name)).toBeVisible();
}

export async function createWorkEntry(
  page: Page,
  clientName: string,
  hours: string,
  description?: string
) {
  await page.goto('/work-entries');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Add Work Entry' }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('combobox', { name: 'Client' }).click();
  await page.waitForTimeout(500);
  await page.getByRole('option', { name: clientName }).click();
  await page.getByLabel('Hours').fill(hours);
  if (description) {
    await page.getByLabel('Description').fill(description);
  }
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByText(`${hours} hours`)).toBeVisible();
}

export function generateUniqueEmail(): string {
  return `test-${Date.now()}@example.com`;
}

export function generateUniqueClientName(): string {
  return `Test Client ${Date.now()}`;
}
