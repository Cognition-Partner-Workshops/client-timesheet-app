import { test, expect } from '@playwright/test';
import { login, createClient, generateUniqueClientName } from './helpers';

test.describe('Work Entries Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display work entries page with correct elements', async ({ page }) => {
    await page.goto('/work-entries');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByRole('heading', { name: 'Work Entries' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Work Entry' })).toBeVisible();
  });

  test('should show message when no clients exist', async ({ page }) => {
    await page.goto('/work-entries');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByText('You need to create at least one client before adding work entries')).toBeVisible();
  });

  test('should open add work entry dialog when clicking Add Work Entry button', async ({ page }) => {
    const clientName = generateUniqueClientName();
    await createClient(page, clientName);
    
    await page.goto('/work-entries');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Add Work Entry' }).click();
    
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Add New Work Entry' })).toBeVisible();
  });

  test('should close dialog when clicking Cancel', async ({ page }) => {
    const clientName = generateUniqueClientName();
    await createClient(page, clientName);
    
    await page.goto('/work-entries');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Add Work Entry' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
