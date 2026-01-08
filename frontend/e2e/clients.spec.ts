import { test, expect } from '@playwright/test';
import { login, generateUniqueClientName } from './helpers';

test.describe('Client Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display clients page with correct elements', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Client' })).toBeVisible();
  });

  test('should show empty state when no clients exist', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByText('No clients found')).toBeVisible();
  });

  test('should open add client dialog when clicking Add Client button', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');
    
    await page.getByRole('button', { name: 'Add Client' }).click();
    
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Add New Client' })).toBeVisible();
    await expect(page.getByLabel('Client Name')).toBeVisible();
    await expect(page.getByLabel('Description')).toBeVisible();
  });

  test('should create a new client with name only', async ({ page }) => {
    const clientName = generateUniqueClientName();
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');
    
    await page.getByRole('button', { name: 'Add Client' }).click();
    await page.getByLabel('Client Name').fill(clientName);
    await page.getByRole('button', { name: 'Create' }).click();
    
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText(clientName)).toBeVisible();
  });

  test('should create a new client with name and description', async ({ page }) => {
    const clientName = generateUniqueClientName();
    const description = 'Test client description';
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');
    
    await page.getByRole('button', { name: 'Add Client' }).click();
    await page.getByLabel('Client Name').fill(clientName);
    await page.getByLabel('Description').fill(description);
    await page.getByRole('button', { name: 'Create' }).click();
    
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText(clientName)).toBeVisible();
    await expect(page.getByText(description)).toBeVisible();
  });

  test('should show validation error when creating client without name', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');
    
    await page.getByRole('button', { name: 'Add Client' }).click();
    await page.getByRole('button', { name: 'Create' }).click();
    
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should close dialog when clicking Cancel', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');
    
    await page.getByRole('button', { name: 'Add Client' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should edit an existing client', async ({ page }) => {
    const clientName = generateUniqueClientName();
    const updatedName = `${clientName} Updated`;
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');
    
    await page.getByRole('button', { name: 'Add Client' }).click();
    await page.getByLabel('Client Name').fill(clientName);
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByText(clientName)).toBeVisible();
    
    await page.getByRole('row', { name: new RegExp(clientName) }).getByRole('button').first().click();
    await expect(page.getByRole('heading', { name: 'Edit Client' })).toBeVisible();
    
    await page.getByLabel('Client Name').clear();
    await page.getByLabel('Client Name').fill(updatedName);
    await page.getByRole('button', { name: 'Update' }).click();
    
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText(updatedName)).toBeVisible();
  });

  test('should delete a client', async ({ page }) => {
    const clientName = generateUniqueClientName();
    await page.goto('/clients');
    
    await page.getByRole('button', { name: 'Add Client' }).click();
    await page.getByLabel('Client Name').fill(clientName);
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByText(clientName)).toBeVisible();
    
    page.on('dialog', dialog => dialog.accept());
    
    await page.getByRole('row', { name: new RegExp(clientName) }).getByRole('button').last().click();
    
    await expect(page.getByText(clientName)).not.toBeVisible();
  });

  test('should display client creation date', async ({ page }) => {
    const clientName = generateUniqueClientName();
    await page.goto('/clients');
    
    await page.getByRole('button', { name: 'Add Client' }).click();
    await page.getByLabel('Client Name').fill(clientName);
    await page.getByRole('button', { name: 'Create' }).click();
    
    const today = new Date().toLocaleDateString();
    await expect(page.getByRole('row', { name: new RegExp(clientName) })).toContainText(today);
  });

  test('should show No description chip for clients without description', async ({ page }) => {
    const clientName = generateUniqueClientName();
    await page.goto('/clients');
    
    await page.getByRole('button', { name: 'Add Client' }).click();
    await page.getByLabel('Client Name').fill(clientName);
    await page.getByRole('button', { name: 'Create' }).click();
    
    await expect(page.getByRole('row', { name: new RegExp(clientName) }).getByText('No description')).toBeVisible();
  });
});
