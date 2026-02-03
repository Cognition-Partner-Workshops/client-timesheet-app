import { test, expect } from '@playwright/test';

test.describe('Work Entries Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByLabel(/email/i).fill('e2e-test@example.com');
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should navigate to work entries page', async ({ page }) => {
    await page.getByRole('link', { name: /work entries|time entries/i }).click();
    await expect(page).toHaveURL(/work-entries|entries/);
  });

  test('should create a new work entry', async ({ page }) => {
    await page.getByRole('link', { name: /clients/i }).click();
    await page.getByRole('button', { name: /add client/i }).click();
    await page.getByLabel(/name/i).fill('Work Entry Test Client');
    await page.getByRole('button', { name: /save|create|submit/i }).click();
    await expect(page.getByText('Work Entry Test Client')).toBeVisible();

    await page.getByRole('link', { name: /work entries|time entries/i }).click();

    await page.getByRole('button', { name: /add|new/i }).click();

    const clientSelect = page.getByLabel(/client/i);
    await clientSelect.click();
    await page.getByRole('option', { name: /Work Entry Test Client/i }).click();

    await page.getByLabel(/hours/i).fill('4');
    await page.getByLabel(/description/i).fill('E2E test work entry');

    await page.getByRole('button', { name: /save|create|submit/i }).click();

    await expect(page.getByText('E2E test work entry')).toBeVisible();
  });

  test('should edit a work entry', async ({ page }) => {
    await page.getByRole('link', { name: /work entries|time entries/i }).click();

    const entryRow = page.getByRole('row').filter({ hasText: 'E2E test work entry' });
    await entryRow.getByRole('button', { name: /edit/i }).click();

    await page.getByLabel(/hours/i).clear();
    await page.getByLabel(/hours/i).fill('6');
    await page.getByRole('button', { name: /save|update|submit/i }).click();

    await expect(page.getByText('6')).toBeVisible();
  });

  test('should delete a work entry', async ({ page }) => {
    await page.getByRole('link', { name: /work entries|time entries/i }).click();

    const entryRow = page.getByRole('row').filter({ hasText: 'E2E test work entry' });
    await entryRow.getByRole('button', { name: /delete/i }).click();

    await page.getByRole('button', { name: /confirm|yes|delete/i }).click();

    await expect(page.getByText('E2E test work entry')).not.toBeVisible();
  });
});
