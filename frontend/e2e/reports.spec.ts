import { test, expect } from '@playwright/test';

test.describe('Reports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByLabel(/email/i).fill('e2e-test@example.com');
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should navigate to reports page', async ({ page }) => {
    await page.getByRole('link', { name: /reports/i }).click();
    await expect(page).toHaveURL(/reports/);
    await expect(page.getByRole('heading', { name: /reports/i })).toBeVisible();
  });

  test('should display client report', async ({ page }) => {
    await page.getByRole('link', { name: /clients/i }).click();
    await page.getByRole('button', { name: /add client/i }).click();
    await page.getByLabel(/name/i).fill('Report Test Client');
    await page.getByRole('button', { name: /save|create|submit/i }).click();

    await page.getByRole('link', { name: /reports/i }).click();

    const clientSelect = page.getByLabel(/client/i);
    await clientSelect.click();
    await page.getByRole('option', { name: /Report Test Client/i }).click();

    await expect(page.getByText(/total hours/i)).toBeVisible();
  });

  test('should export report as CSV', async ({ page }) => {
    await page.getByRole('link', { name: /reports/i }).click();

    const clientSelect = page.getByLabel(/client/i);
    await clientSelect.click();
    await page.getByRole('option').first().click();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /csv|export csv/i }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('should export report as PDF', async ({ page }) => {
    await page.getByRole('link', { name: /reports/i }).click();

    const clientSelect = page.getByLabel(/client/i);
    await clientSelect.click();
    await page.getByRole('option').first().click();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /pdf|export pdf/i }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('.pdf');
  });
});
