import { test, expect } from '@playwright/test';

test.describe('@REQ-CLIENT Client Management Module', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'e2e-test@example.com');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('TC-CLIENT-001: View all clients', async ({ page }) => {
    // Navigate to Clients page
    await page.click('text=Clients');
    await expect(page).toHaveURL('/clients');
    
    // Verify clients table is visible
    await expect(page.locator('table')).toBeVisible();
    
    // Verify table headers
    await expect(page.locator('th:has-text("Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Description")')).toBeVisible();
  });

  test('TC-CLIENT-002: Create new client', async ({ page }) => {
    // Navigate to Clients page
    await page.click('text=Clients');
    await expect(page).toHaveURL('/clients');
    
    // Click Add Client button
    await page.click('button:has-text("Add Client")');
    
    // Fill in client details
    const clientName = `Test Client ${Date.now()}`;
    await page.fill('input[name="name"]', clientName);
    await page.fill('textarea[name="description"], input[name="description"]', 'Test description');
    
    // Save the client
    await page.click('button:has-text("Save"), button:has-text("Create"), button:has-text("Add")');
    
    // Verify client appears in the list
    await expect(page.locator(`text=${clientName}`)).toBeVisible({ timeout: 10000 });
  });

  test('TC-CLIENT-003: Create client with empty name shows validation error', async ({ page }) => {
    // Navigate to Clients page
    await page.click('text=Clients');
    
    // Click Add Client button
    await page.click('button:has-text("Add Client")');
    
    // Try to save without entering name
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Create"), button:has-text("Add")');
    
    // Button should be disabled or clicking should show error
    if (await saveButton.isEnabled()) {
      await saveButton.click();
      // Should show validation error
      await expect(page.locator('text=/required|name/i')).toBeVisible();
    }
  });

  test('TC-CLIENT-004: Edit existing client', async ({ page }) => {
    // First create a client
    await page.click('text=Clients');
    await page.click('button:has-text("Add Client")');
    
    const originalName = `Edit Test ${Date.now()}`;
    await page.fill('input[name="name"]', originalName);
    await page.click('button:has-text("Save"), button:has-text("Create"), button:has-text("Add")');
    await expect(page.locator(`text=${originalName}`)).toBeVisible({ timeout: 10000 });
    
    // Click edit button on the client row
    const clientRow = page.locator(`tr:has-text("${originalName}")`);
    await clientRow.locator('button[aria-label*="edit"], button:has(svg), [data-testid="edit"]').first().click();
    
    // Update the name
    const updatedName = `Updated ${Date.now()}`;
    await page.fill('input[name="name"]', updatedName);
    await page.click('button:has-text("Save"), button:has-text("Update")');
    
    // Verify updated name appears
    await expect(page.locator(`text=${updatedName}`)).toBeVisible({ timeout: 10000 });
  });

  test('TC-CLIENT-005: Delete client', async ({ page }) => {
    // First create a client to delete
    await page.click('text=Clients');
    await page.click('button:has-text("Add Client")');
    
    const clientName = `Delete Test ${Date.now()}`;
    await page.fill('input[name="name"]', clientName);
    await page.click('button:has-text("Save"), button:has-text("Create"), button:has-text("Add")');
    await expect(page.locator(`text=${clientName}`)).toBeVisible({ timeout: 10000 });
    
    // Click delete button on the client row
    const clientRow = page.locator(`tr:has-text("${clientName}")`);
    await clientRow.locator('button[aria-label*="delete"], button:has(svg):last-child, [data-testid="delete"]').click();
    
    // Confirm deletion if dialog appears
    const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete"), button:has-text("Yes")');
    if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmButton.click();
    }
    
    // Verify client is removed
    await expect(page.locator(`text=${clientName}`)).not.toBeVisible({ timeout: 10000 });
  });

  test('TC-CLIENT-006: Client data isolation between users', async ({ page, context }) => {
    // Create a client as user A
    await page.click('text=Clients');
    await page.click('button:has-text("Add Client")');
    
    const userAClient = `UserA Client ${Date.now()}`;
    await page.fill('input[name="name"]', userAClient);
    await page.click('button:has-text("Save"), button:has-text("Create"), button:has-text("Add")');
    await expect(page.locator(`text=${userAClient}`)).toBeVisible({ timeout: 10000 });
    
    // Logout
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL('/login');
    
    // Login as different user
    await page.fill('input[name="email"]', 'different-user@example.com');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
    
    // Navigate to Clients page
    await page.click('text=Clients');
    
    // Verify User A's client is NOT visible to User B
    await expect(page.locator(`text=${userAClient}`)).not.toBeVisible();
  });
});
