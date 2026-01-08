import { test, expect } from '@playwright/test';
import { login, createClient, generateUniqueClientName } from './helpers';

test.describe('Reports', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display reports page with correct elements', async ({ page }) => {
    await page.goto('/reports');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByRole('heading', { name: 'Reports' })).toBeVisible();
  });

  test('should show message when no clients exist', async ({ page }) => {
    await page.goto('/reports');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByText('You need to create at least one client before generating reports')).toBeVisible();
  });

  test('should display client dropdown when clients exist', async ({ page }) => {
    const clientName = generateUniqueClientName();
    await createClient(page, clientName);
    
    await page.goto('/reports');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByLabel('Select Client')).toBeVisible();
  });

  test('should show message to select a client initially', async ({ page }) => {
    const clientName = generateUniqueClientName();
    await createClient(page, clientName);
    
    await page.goto('/reports');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByText('Select a client to view their time report')).toBeVisible();
  });
});
