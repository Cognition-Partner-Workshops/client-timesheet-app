import { test, expect } from '@playwright/test';

test.describe('@REQ-AUTH Authentication Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('TC-AUTH-001: Login with valid email', async ({ page }) => {
    // Enter valid email
    await page.fill('input[name="email"]', 'test@example.com');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Verify email is displayed in header
    await expect(page.locator('header')).toContainText('test@example.com');
  });

  test('TC-AUTH-002: Login with invalid email format', async ({ page }) => {
    // Enter invalid email
    await page.fill('input[name="email"]', 'notanemail');
    
    // Login button should be disabled or show error
    const loginButton = page.locator('button[type="submit"]');
    
    // Try to submit and verify we stay on login page
    await loginButton.click();
    await expect(page).toHaveURL('/login');
  });

  test('TC-AUTH-003: Login button disabled with empty email', async ({ page }) => {
    // Verify login button is disabled when email is empty
    const loginButton = page.locator('button[type="submit"]');
    await expect(loginButton).toBeDisabled();
  });

  test('TC-AUTH-004: Logout functionality', async ({ page }) => {
    // First login
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
    
    // Click logout button
    await page.click('button:has-text("Logout")');
    
    // Verify redirect to login page
    await expect(page).toHaveURL('/login');
  });

  test('TC-AUTH-005: Session persistence on page refresh', async ({ page }) => {
    // Login
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
    
    // Refresh the page
    await page.reload();
    
    // Verify still on dashboard (session persisted)
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('header')).toContainText('test@example.com');
  });

  test('TC-NAV-002: Protected routes redirect to login', async ({ page }) => {
    // Clear any existing session
    await page.evaluate(() => localStorage.clear());
    
    // Try to access protected route directly
    await page.goto('/dashboard');
    
    // Should be redirected to login
    await expect(page).toHaveURL('/login');
  });
});
