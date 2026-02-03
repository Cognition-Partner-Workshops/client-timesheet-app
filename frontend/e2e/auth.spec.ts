import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Time Tracker' })).toBeVisible();
    await expect(page.getByLabel('Email Address')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log In' })).toBeVisible();
  });

  test('should login with valid email and redirect to dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email Address').fill('test@example.com');
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('should show user email after login', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email Address').fill('test@example.com');
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page.getByText('test@example.com')).toBeVisible();
  });

  test('should logout and redirect to login page', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email Address').fill('test@example.com');
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page).toHaveURL(/.*dashboard/);
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/.*login/);
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login/);
  });
});
