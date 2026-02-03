import { test, expect } from '@playwright/test';

test.describe('Client Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email Address').fill('e2e-test@example.com');
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should navigate to clients page', async ({ page }) => {
    await page.getByRole('button', { name: 'Clients' }).click();
    await expect(page).toHaveURL(/.*clients/);
    await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible();
  });

  test('should display empty state when no clients exist', async ({ page }) => {
    await page.getByRole('button', { name: 'Clients' }).click();
    await expect(page.getByText('No clients found')).toBeVisible();
  });

  test('should create a new client', async ({ page }) => {
    await page.getByRole('button', { name: 'Clients' }).click();
    await page.getByRole('button', { name: 'Add Client' }).click();
    await page.getByLabel('Client Name').fill('Test Client E2E');
    await page.getByLabel('Description').fill('Test description');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByText('Test Client E2E')).toBeVisible();
  });
});
