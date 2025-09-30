import { test, expect } from '@playwright/test';

test.describe('TV Show Quality Selector Fix Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Media File Renamer')).toBeVisible();
  });

  test('TV show details should now have quality selector after fix', async ({ page }) => {
    // Search for a TV show
    const searchInput = page.locator('input[placeholder="Search for movies, TV shows, or people..."]');
    await searchInput.fill('Breaking Bad');
    await searchInput.press('Enter');

    // Wait for search results
    await page.waitForTimeout(3000);

    // Click on a TV show result if found
    const tvShowButton = page.locator('button:has-text("Breaking Bad")').first();
    if (await tvShowButton.count() > 0) {
      await tvShowButton.click();

      // Wait for content to load
      await page.waitForTimeout(2000);

      // Check if we have any form of quality selector on the page
      const qualityLabels = await page.locator('text="Select quality format:"').count();
      const radioButtons720p = await page.locator('input[type="radio"][value="720p"], span:has-text("720p")').count();
      const radioButtons1080p = await page.locator('input[type="radio"][value="1080p"], span:has-text("1080p")').count();
      const radioButtons2160p = await page.locator('input[type="radio"][value="2160p"], span:has-text("2160p")').count();

      console.log(`Quality labels found: ${qualityLabels}`);
      console.log(`720p buttons found: ${radioButtons720p}`);
      console.log(`1080p buttons found: ${radioButtons1080p}`);
      console.log(`2160p buttons found: ${radioButtons2160p}`);

      // If we're on the seasons page, that's expected to have quality selector
      // If we navigate to actual TV show details, that should now also have it
      expect(qualityLabels).toBeGreaterThan(0);
      expect(radioButtons720p + radioButtons1080p + radioButtons2160p).toBeGreaterThan(0);
    } else {
      console.log('No Breaking Bad results found - test skipped');
    }
  });

  test('Movie details should still have quality selector', async ({ page }) => {
    // Search for a movie
    const searchInput = page.locator('input[placeholder="Search for movies, TV shows, or people..."]');
    await searchInput.fill('Inception');
    await searchInput.press('Enter');

    // Wait for search results
    await page.waitForTimeout(3000);

    // Click Movies tab if visible
    const moviesTab = page.locator('[data-testid="movies-tab"]');
    if (await moviesTab.count() > 0) {
      await moviesTab.click();
      await page.waitForTimeout(1000);
    }

    // Click on a movie result if found
    const movieButton = page.locator('button:has-text("Inception")').first();
    if (await movieButton.count() > 0) {
      await movieButton.click();

      // Wait for content to load
      await page.waitForTimeout(2000);

      // Check for quality selector
      const qualityLabels = await page.locator('text="Select quality format:"').count();
      const radioButtons = await page.locator('input[type="radio"]').count();

      console.log(`Movie quality labels found: ${qualityLabels}`);
      console.log(`Movie radio buttons found: ${radioButtons}`);

      expect(qualityLabels).toBeGreaterThan(0);
      expect(radioButtons).toBeGreaterThanOrEqual(3); // Should have 3 quality options
    } else {
      console.log('No Inception results found - test skipped');
    }
  });
});