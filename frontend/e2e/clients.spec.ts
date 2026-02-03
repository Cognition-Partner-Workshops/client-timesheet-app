import { test, expect } from '@playwright/test';

test.describe('Client Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByLabel(/email/i).fill('e2e-test@example.com');
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should navigate to clients page', async ({ page }) => {
    await page.getByRole('link', { name: /clients/i }).click();
    await expect(page).toHaveURL(/clients/);
    await expect(page.getByRole('heading', { name: /clients/i })).toBeVisible();
  });

  test('should create a new client', async ({ page }) => {
    await page.getByRole('link', { name: /clients/i }).click();
    await expect(page).toHaveURL(/clients/);

    await page.getByRole('button', { name: /add client/i }).click();

    await page.getByLabel(/name/i).fill('E2E Test Client');
    await page.getByLabel(/description/i).fill('Client created during E2E testing');
    await page.getByRole('button', { name: /save|create|submit/i }).click();

    await expect(page.getByText('E2E Test Client')).toBeVisible();
  });

  test('should edit an existing client', async ({ page }) => {
    await page.getByRole('link', { name: /clients/i }).click();
    await expect(page).toHaveURL(/clients/);

    const clientRow = page.getByRole('row').filter({ hasText: 'E2E Test Client' });
    await clientRow.getByRole('button', { name: /edit/i }).click();

    await page.getByLabel(/name/i).clear();
    await page.getByLabel(/name/i).fill('E2E Test Client Updated');
    await page.getByRole('button', { name: /save|update|submit/i }).click();

    await expect(page.getByText('E2E Test Client Updated')).toBeVisible();
  });

  test('should delete a client', async ({ page }) => {
    await page.getByRole('link', { name: /clients/i }).click();
    await expect(page).toHaveURL(/clients/);

    const clientRow = page.getByRole('row').filter({ hasText: 'E2E Test Client' });
    await clientRow.getByRole('button', { name: /delete/i }).click();

    await page.getByRole('button', { name: /confirm|yes|delete/i }).click();

    await expect(page.getByText('E2E Test Client')).not.toBeVisible();
  });
});
