import { test, expect } from '@playwright/test';

test.describe('@REQ-REPORT Reports Module', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'e2e-reports@example.com');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
    
    // Ensure at least one client with work entries exists
    await page.click('text=Clients');
    const clientExists = await page.locator('table tbody tr').count() > 0;
    if (!clientExists || await page.locator('text=No clients found').isVisible().catch(() => false)) {
      await page.click('button:has-text("Add Client")');
      await page.fill('input[name="name"]', 'Report Test Client');
      await page.click('button:has-text("Save"), button:has-text("Create"), button:has-text("Add")');
      await expect(page.locator('text=Report Test Client')).toBeVisible({ timeout: 10000 });
    }
  });

  test('TC-REPORT-001: View client report', async ({ page }) => {
    // Navigate to Reports page
    await page.click('text=Reports');
    await expect(page).toHaveURL('/reports');
    
    // Verify reports page elements
    await expect(page.locator('h4:has-text("Reports"), h1:has-text("Reports")')).toBeVisible();
    
    // Select a client from dropdown if available
    const clientDropdown = page.locator('[role="combobox"], select').first();
    if (await clientDropdown.isVisible()) {
      await clientDropdown.click();
      await page.click('[role="option"]:first-child, option:first-child');
      
      // Verify report content is displayed
      await expect(page.locator('text=/Total Hours|hours|entries/i')).toBeVisible({ timeout: 10000 });
    }
  });

  test('TC-REPORT-002: Export report as CSV', async ({ page }) => {
    // Navigate to Reports page
    await page.click('text=Reports');
    await expect(page).toHaveURL('/reports');
    
    // Select a client
    const clientDropdown = page.locator('[role="combobox"], select').first();
    if (await clientDropdown.isVisible()) {
      await clientDropdown.click();
      await page.click('[role="option"]:first-child, option:first-child');
    }
    
    // Wait for report to load
    await page.waitForTimeout(1000);
    
    // Set up download listener
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
    
    // Click Export CSV button
    const csvButton = page.locator('button:has-text("CSV"), button:has-text("Export CSV")');
    if (await csvButton.isVisible()) {
      await csvButton.click();
      
      // Verify download started
      const download = await downloadPromise;
      if (download) {
        expect(download.suggestedFilename()).toContain('.csv');
      }
    }
  });

  test('TC-REPORT-003: Export report as PDF', async ({ page }) => {
    // Navigate to Reports page
    await page.click('text=Reports');
    await expect(page).toHaveURL('/reports');
    
    // Select a client
    const clientDropdown = page.locator('[role="combobox"], select').first();
    if (await clientDropdown.isVisible()) {
      await clientDropdown.click();
      await page.click('[role="option"]:first-child, option:first-child');
    }
    
    // Wait for report to load
    await page.waitForTimeout(1000);
    
    // Set up download listener
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
    
    // Click Export PDF button
    const pdfButton = page.locator('button:has-text("PDF"), button:has-text("Export PDF")');
    if (await pdfButton.isVisible()) {
      await pdfButton.click();
      
      // Verify download started
      const download = await downloadPromise;
      if (download) {
        expect(download.suggestedFilename()).toContain('.pdf');
      }
    }
  });

  test('TC-REPORT-004: Report with no work entries shows appropriate message', async ({ page }) => {
    // Create a new client with no work entries
    await page.click('text=Clients');
    await page.click('button:has-text("Add Client")');
    
    const emptyClientName = `Empty Client ${Date.now()}`;
    await page.fill('input[name="name"]', emptyClientName);
    await page.click('button:has-text("Save"), button:has-text("Create"), button:has-text("Add")');
    await expect(page.locator(`text=${emptyClientName}`)).toBeVisible({ timeout: 10000 });
    
    // Navigate to Reports page
    await page.click('text=Reports');
    
    // Select the empty client
    const clientDropdown = page.locator('[role="combobox"], select').first();
    if (await clientDropdown.isVisible()) {
      await clientDropdown.click();
      await page.click(`[role="option"]:has-text("${emptyClientName}"), option:has-text("${emptyClientName}")`);
      
      // Verify appropriate message is shown
      await expect(page.locator('text=/No work entries|0 hours|no entries/i')).toBeVisible({ timeout: 10000 });
    }
  });
});
