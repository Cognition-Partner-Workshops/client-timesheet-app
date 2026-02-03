import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
  });

  test('should login with valid email', async ({ page }) => {
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByRole('button', { name: /login/i }).click();

    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByRole('button', { name: /login/i }).click();

    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByRole('button', { name: /login/i }).click();

    await expect(page).toHaveURL(/dashboard/);

    await page.getByRole('button', { name: /logout/i }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
  });
});
