import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email Address').fill('nav-test@example.com');
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should navigate to all main pages', async ({ page }) => {
    await page.getByRole('button', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL(/.*dashboard/);

    await page.getByRole('button', { name: 'Clients' }).click();
    await expect(page).toHaveURL(/.*clients/);

    await page.getByRole('button', { name: 'Work Entries' }).click();
    await expect(page).toHaveURL(/.*work-entries/);

    await page.getByRole('button', { name: 'Reports' }).click();
    await expect(page).toHaveURL(/.*reports/);
  });

  test('should display dashboard metrics', async ({ page }) => {
    await expect(page.getByText('Total Clients')).toBeVisible();
    await expect(page.getByText('Total Work Entries')).toBeVisible();
    await expect(page.getByText('Total Hours')).toBeVisible();
  });

  test('should show quick actions on dashboard', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Add Client' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Work Entry' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'View Reports' })).toBeVisible();
  });
});
