import { test, expect } from '@playwright/test';

test.describe('@REQ-DASH Dashboard Module', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'e2e-dashboard@example.com');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('TC-DASH-001: View dashboard statistics', async ({ page }) => {
    // Verify dashboard title
    await expect(page.locator('h4:has-text("Dashboard"), h1:has-text("Dashboard")')).toBeVisible();
    
    // Verify statistics cards are visible
    await expect(page.locator('text=Total Clients')).toBeVisible();
    await expect(page.locator('text=Total Work Entries')).toBeVisible();
    await expect(page.locator('text=Total Hours')).toBeVisible();
  });

  test('TC-DASH-002: Dashboard loading state', async ({ page }) => {
    // Reload page and check for loading state
    await page.reload();
    
    // Either loading spinner appears briefly or content loads directly
    // We just verify the dashboard eventually loads
    await expect(page.locator('text=Total Clients')).toBeVisible({ timeout: 10000 });
  });

  test('TC-DASH-004: Recent work entries display', async ({ page }) => {
    // Verify Recent Work Entries section exists
    await expect(page.locator('text=Recent Work Entries')).toBeVisible();
    
    // Either shows work entries or "No work entries yet" message
    const hasEntries = await page.locator('text=/hours|No work entries/i').isVisible();
    expect(hasEntries).toBeTruthy();
  });

  test('TC-DASH-005: Quick actions navigation', async ({ page }) => {
    // Test Add Client quick action
    await page.click('button:has-text("Add Client")');
    await expect(page).toHaveURL('/clients');
    
    // Go back to dashboard
    await page.click('text=Dashboard');
    await expect(page).toHaveURL('/dashboard');
    
    // Test Add Work Entry quick action
    await page.click('button:has-text("Add Work Entry")');
    await expect(page).toHaveURL('/work-entries');
    
    // Go back to dashboard
    await page.click('text=Dashboard');
    await expect(page).toHaveURL('/dashboard');
    
    // Test View Reports quick action
    await page.click('button:has-text("View Reports")');
    await expect(page).toHaveURL('/reports');
  });

  test('TC-NAV-001: Sidebar navigation works correctly', async ({ page }) => {
    // Test Dashboard navigation
    await page.click('nav >> text=Dashboard');
    await expect(page).toHaveURL('/dashboard');
    
    // Test Clients navigation
    await page.click('nav >> text=Clients');
    await expect(page).toHaveURL('/clients');
    
    // Test Work Entries navigation
    await page.click('nav >> text=Work Entries');
    await expect(page).toHaveURL('/work-entries');
    
    // Test Reports navigation
    await page.click('nav >> text=Reports');
    await expect(page).toHaveURL('/reports');
  });
});
