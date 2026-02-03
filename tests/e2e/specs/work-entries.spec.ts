import { test, expect } from '@playwright/test';

test.describe('@REQ-WORK Work Entry Module', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'e2e-work-test@example.com');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
    
    // Ensure at least one client exists for work entry tests
    await page.click('text=Clients');
    const clientExists = await page.locator('table tbody tr').count() > 0;
    if (!clientExists || await page.locator('text=No clients found').isVisible().catch(() => false)) {
      await page.click('button:has-text("Add Client")');
      await page.fill('input[name="name"]', 'E2E Test Client');
      await page.click('button:has-text("Save"), button:has-text("Create"), button:has-text("Add")');
      await expect(page.locator('text=E2E Test Client')).toBeVisible({ timeout: 10000 });
    }
  });

  test('TC-WORK-001: View all work entries', async ({ page }) => {
    // Navigate to Work Entries page
    await page.click('text=Work Entries');
    await expect(page).toHaveURL('/work-entries');
    
    // Verify page elements are visible
    await expect(page.locator('h4:has-text("Work Entries"), h1:has-text("Work Entries")')).toBeVisible();
    await expect(page.locator('button:has-text("Add Work Entry")')).toBeVisible();
  });

  test('TC-WORK-002: Create work entry with valid data', async ({ page }) => {
    // Navigate to Work Entries page
    await page.click('text=Work Entries');
    
    // Click Add Work Entry button
    await page.click('button:has-text("Add Work Entry")');
    
    // Fill in work entry details
    // Select client from dropdown
    await page.click('[role="combobox"], select, [aria-haspopup="listbox"]');
    await page.click('[role="option"]:first-child, option:first-child');
    
    // Enter hours
    await page.fill('input[name="hours"], input[type="number"]', '8');
    
    // Enter description
    await page.fill('textarea[name="description"], input[name="description"]', 'E2E Test Work Entry');
    
    // Save the work entry
    await page.click('button:has-text("Save"), button:has-text("Create"), button:has-text("Add")');
    
    // Verify work entry appears
    await expect(page.locator('text=E2E Test Work Entry')).toBeVisible({ timeout: 10000 });
  });

  test('TC-WORK-003: Create work entry with hours > 24 shows validation error', async ({ page }) => {
    // Navigate to Work Entries page
    await page.click('text=Work Entries');
    
    // Click Add Work Entry button
    await page.click('button:has-text("Add Work Entry")');
    
    // Select client
    await page.click('[role="combobox"], select, [aria-haspopup="listbox"]');
    await page.click('[role="option"]:first-child, option:first-child');
    
    // Enter invalid hours (> 24)
    await page.fill('input[name="hours"], input[type="number"]', '25');
    
    // Try to save
    await page.click('button:has-text("Save"), button:has-text("Create"), button:has-text("Add")');
    
    // Should show validation error
    await expect(page.locator('text=/24|invalid|error/i')).toBeVisible({ timeout: 5000 });
  });

  test('TC-WORK-004: Create work entry with zero hours shows validation error', async ({ page }) => {
    // Navigate to Work Entries page
    await page.click('text=Work Entries');
    
    // Click Add Work Entry button
    await page.click('button:has-text("Add Work Entry")');
    
    // Select client
    await page.click('[role="combobox"], select, [aria-haspopup="listbox"]');
    await page.click('[role="option"]:first-child, option:first-child');
    
    // Enter zero hours
    await page.fill('input[name="hours"], input[type="number"]', '0');
    
    // Try to save
    await page.click('button:has-text("Save"), button:has-text("Create"), button:has-text("Add")');
    
    // Should show validation error or button should be disabled
    const errorVisible = await page.locator('text=/greater than|minimum|invalid|error/i').isVisible().catch(() => false);
    const stillOnForm = await page.locator('input[name="hours"]').isVisible();
    
    expect(errorVisible || stillOnForm).toBeTruthy();
  });

  test('TC-WORK-005: Edit work entry', async ({ page }) => {
    // First create a work entry
    await page.click('text=Work Entries');
    await page.click('button:has-text("Add Work Entry")');
    
    await page.click('[role="combobox"], select, [aria-haspopup="listbox"]');
    await page.click('[role="option"]:first-child, option:first-child');
    await page.fill('input[name="hours"], input[type="number"]', '4');
    await page.fill('textarea[name="description"], input[name="description"]', 'Entry to Edit');
    await page.click('button:has-text("Save"), button:has-text("Create"), button:has-text("Add")');
    
    await expect(page.locator('text=Entry to Edit')).toBeVisible({ timeout: 10000 });
    
    // Click edit button on the work entry row
    const entryRow = page.locator('tr:has-text("Entry to Edit"), div:has-text("Entry to Edit")').first();
    await entryRow.locator('button[aria-label*="edit"], button:has(svg), [data-testid="edit"]').first().click();
    
    // Update hours
    await page.fill('input[name="hours"], input[type="number"]', '6');
    await page.click('button:has-text("Save"), button:has-text("Update")');
    
    // Verify update
    await expect(page.locator('text=6')).toBeVisible({ timeout: 10000 });
  });

  test('TC-WORK-006: Delete work entry', async ({ page }) => {
    // First create a work entry to delete
    await page.click('text=Work Entries');
    await page.click('button:has-text("Add Work Entry")');
    
    await page.click('[role="combobox"], select, [aria-haspopup="listbox"]');
    await page.click('[role="option"]:first-child, option:first-child');
    await page.fill('input[name="hours"], input[type="number"]', '2');
    await page.fill('textarea[name="description"], input[name="description"]', 'Entry to Delete');
    await page.click('button:has-text("Save"), button:has-text("Create"), button:has-text("Add")');
    
    await expect(page.locator('text=Entry to Delete')).toBeVisible({ timeout: 10000 });
    
    // Click delete button
    const entryRow = page.locator('tr:has-text("Entry to Delete"), div:has-text("Entry to Delete")').first();
    await entryRow.locator('button[aria-label*="delete"], button:has(svg):last-child, [data-testid="delete"]').click();
    
    // Confirm deletion if dialog appears
    const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete"), button:has-text("Yes")');
    if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmButton.click();
    }
    
    // Verify entry is removed
    await expect(page.locator('text=Entry to Delete')).not.toBeVisible({ timeout: 10000 });
  });
});
