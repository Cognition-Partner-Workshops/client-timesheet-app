import { test, expect } from '@playwright/test';
import { TEST_EMAIL, generateUniqueEmail } from './helpers';

test.describe('Authentication', () => {
  test('should display login page with correct elements', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.getByRole('heading', { name: 'Time Tracker' })).toBeVisible();
    await expect(page.getByText('Enter your email to log in')).toBeVisible();
    await expect(page.getByText('This app intentionally does not have a password field')).toBeVisible();
    await expect(page.getByLabel('Email Address')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log In' })).toBeVisible();
  });

  test('should disable login button when email is empty', async ({ page }) => {
    await page.goto('/login');
    
    const loginButton = page.getByRole('button', { name: 'Log In' });
    await expect(loginButton).toBeDisabled();
  });

  test('should enable login button when email is entered', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByLabel('Email Address').fill(TEST_EMAIL);
    const loginButton = page.getByRole('button', { name: 'Log In' });
    await expect(loginButton).toBeEnabled();
  });

  test('should successfully login with valid email', async ({ page }) => {
    const email = generateUniqueEmail();
    await page.goto('/login');
    
    await page.getByLabel('Email Address').fill(email);
    await page.getByRole('button', { name: 'Log In' }).click();
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('should redirect unauthenticated users to login page', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });

  test('should redirect to dashboard after login', async ({ page }) => {
    const email = generateUniqueEmail();
    await page.goto('/login');
    
    await page.getByLabel('Email Address').fill(email);
    await page.getByRole('button', { name: 'Log In' }).click();
    
    await expect(page).toHaveURL('/dashboard');
  });

  test('should persist login state after page refresh', async ({ page }) => {
    const email = generateUniqueEmail();
    await page.goto('/login');
    
    await page.getByLabel('Email Address').fill(email);
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page).toHaveURL('/dashboard');
    
    await page.reload();
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByLabel('Email Address').fill('invalid-email');
    await page.getByRole('button', { name: 'Log In' }).click();
    
    await expect(page.getByRole('alert').filter({ hasText: /error|invalid/i })).toBeVisible();
  });
});
