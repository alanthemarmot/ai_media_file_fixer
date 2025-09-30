import { test, expect } from '@playwright/test';

test.describe('Quality Selector Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for the app to load
    await expect(page.getByText('Media File Renamer')).toBeVisible();
  });

  test('Movie details page should have quality selector', async ({ page }) => {
    // Search for a movie
    await page.fill('input[placeholder="Search for movies, TV shows, or people..."]', 'Inception');
    await page.press('input[placeholder="Search for movies, TV shows, or people..."]', 'Enter');

    // Wait for search results and click on Movies tab
    await page.waitForSelector('[data-testid="movies-tab"]', { timeout: 10000 });
    await page.click('[data-testid="movies-tab"]');

    // Click on the first movie result
    await page.click('button:has-text("Inception")');

    // Wait for movie details to load
    await expect(page.getByText('Media Details')).toBeVisible({ timeout: 10000 });

    // Check that quality selector exists for movies
    await expect(page.getByText('Select quality format:')).toBeVisible();
    await expect(page.getByRole('radio', { name: '720p' })).toBeVisible();
    await expect(page.getByRole('radio', { name: '1080p' })).toBeVisible();
    await expect(page.getByRole('radio', { name: '2160p' })).toBeVisible();

    // Verify 1080p is selected by default
    await expect(page.getByRole('radio', { name: '1080p' })).toBeChecked();
  });

  test('TV show details page should NOT have quality selector (documenting current bug)', async ({ page }) => {
    // Search for a TV show
    await page.fill('input[placeholder="Search for movies, TV shows, or people..."]', 'Breaking Bad');
    await page.press('input[placeholder="Search for movies, TV shows, or people..."]', 'Enter');

    // Wait for search results and ensure we're on TV Shows tab
    await page.waitForSelector('[data-testid="tv-tab"]', { timeout: 10000 });
    await page.click('[data-testid="tv-tab"]');

    // Click on the first TV show result
    await page.click('button:has-text("Breaking Bad")');

    // Wait for TV show details to load (seasons page)
    await expect(page.getByText('Media Details')).toBeVisible({ timeout: 10000 });

    // Go to episodes view by clicking on Season 1
    await page.click('button:has-text("Season 1")');

    // Wait for episodes to load
    await expect(page.getByText('Episodes')).toBeVisible({ timeout: 10000 });

    // Go back to show details by clicking breadcrumb
    await page.click('[data-testid="breadcrumb"] >> text="Breaking Bad"');

    // Now we should be on the TV show details page
    // This is where the bug is - TV show details should have quality selector but doesn't
    const qualitySelectorExists = await page.getByText('Select quality format:').isVisible().catch(() => false);

    // Document the current state - quality selector should NOT exist (this is the bug)
    expect(qualitySelectorExists).toBe(false);
  });

  test('TV show seasons page should have quality selector', async ({ page }) => {
    // Search for a TV show
    await page.fill('input[placeholder="Search for movies, TV shows, or people..."]', 'Breaking Bad');
    await page.press('input[placeholder="Search for movies, TV shows, or people..."]', 'Enter');

    // Wait for search results and ensure we're on TV Shows tab
    await page.waitForSelector('[data-testid="tv-tab"]', { timeout: 10000 });
    await page.click('[data-testid="tv-tab"]');

    // Click on the first TV show result
    await page.click('button:has-text("Breaking Bad")');

    // Wait for seasons page to load
    await expect(page.getByText('Media Details')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Select quality format:')).toBeVisible();
    await expect(page.getByRole('radio', { name: '720p' })).toBeVisible();
    await expect(page.getByRole('radio', { name: '1080p' })).toBeVisible();
    await expect(page.getByRole('radio', { name: '2160p' })).toBeVisible();
  });

  test('TV show episodes page should have quality selector', async ({ page }) => {
    // Search for a TV show
    await page.fill('input[placeholder="Search for movies, TV shows, or people..."]', 'Breaking Bad');
    await page.press('input[placeholder="Search for movies, TV shows, or people..."]', 'Enter');

    // Wait for search results and ensure we're on TV Shows tab
    await page.waitForSelector('[data-testid="tv-tab"]', { timeout: 10000 });
    await page.click('[data-testid="tv-tab"]');

    // Click on the first TV show result
    await page.click('button:has-text("Breaking Bad")');

    // Click on Season 1
    await page.click('button:has-text("Season 1")');

    // Wait for episodes page to load
    await expect(page.getByText('Episodes')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Select quality format:')).toBeVisible();
    await expect(page.getByRole('radio', { name: '720p' })).toBeVisible();
    await expect(page.getByRole('radio', { name: '1080p' })).toBeVisible();
    await expect(page.getByRole('radio', { name: '2160p' })).toBeVisible();
  });
});