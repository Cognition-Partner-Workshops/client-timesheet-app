import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display dashboard page with correct elements', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('Total Clients')).toBeVisible();
    await expect(page.getByText('Total Work Entries')).toBeVisible();
    await expect(page.getByText('Total Hours')).toBeVisible();
  });

  test('should display quick actions and recent entries sections', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByText('Quick Actions')).toBeVisible();
    await expect(page.getByText('Recent Work Entries')).toBeVisible();
    await expect(page.getByRole('button', { name: /Add Client/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Add Work Entry/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /View Reports/i })).toBeVisible();
  });

  test('should navigate to clients page when clicking Add Client', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await page.getByRole('button', { name: /Add Client/i }).click();
    
    await expect(page).toHaveURL('/clients');
  });

  test('should navigate to work entries page when clicking Add Work Entry', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await page.getByRole('button', { name: /Add Work Entry/i }).click();
    
    await expect(page).toHaveURL('/work-entries');
  });

  test('should navigate to reports page when clicking View Reports', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await page.getByRole('button', { name: /View Reports/i }).click();
    
    await expect(page).toHaveURL('/reports');
  });
});
