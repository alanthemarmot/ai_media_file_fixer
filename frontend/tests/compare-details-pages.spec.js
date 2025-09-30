const { test, expect } = require('@playwright/test');

test.describe('Movie vs TV Show Details Page Comparison', () => {
  let movieFeatures = {};
  let tvShowFeatures = {};

  test.beforeAll(async () => {
    // Create tests directory if it doesn't exist
    console.log('Starting detailed comparison analysis...');
  });

  test('Analyze Movie Details Page Features', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173');

    // Wait for the app to load
    await page.waitForSelector('input[type="text"]', { timeout: 10000 });

    // Search for a movie
    await page.fill('input[type="text"]', 'Star Trek The Motion Picture');
    await page.waitForTimeout(2000); // Wait for search results

    // Look for movie results and click on the first movie
    const movieResult = page.locator('[data-testid="search-result"], .cursor-pointer').filter({ hasText: 'Star Trek' }).filter({ hasText: '1979' }).first();
    if (await movieResult.count() > 0) {
      await movieResult.click();
    } else {
      // Fallback: click any movie result
      await page.locator('[data-testid="search-result"], .cursor-pointer').first().click();
    }

    // Wait for details to load
    await page.waitForTimeout(3000);

    // Extract all displayed information
    const pageContent = await page.textContent('body');
    console.log('=== MOVIE PAGE ANALYSIS ===');

    // Check for specific elements/features
    movieFeatures = {
      hasTitle: await page.locator('h2:has-text("Star Trek")').count() > 0,
      hasPosterImage: await page.locator('img[alt*="Star Trek"]').count() > 0,
      hasReleaseDate: pageContent.includes('Release Date:'),
      hasRuntime: pageContent.includes('Runtime:') || pageContent.includes('minutes'),
      hasRating: pageContent.includes('Rating:') || pageContent.includes('/10'),
      hasTagline: pageContent.includes('Tagline:'),
      hasGenres: pageContent.includes('Genres:'),
      hasKeywords: pageContent.includes('Keywords:'),
      hasCast: pageContent.includes('Cast:'),
      hasDirectors: pageContent.includes('Director'),
      hasComposers: pageContent.includes('Composer'),
      hasGeneratedFilename: pageContent.includes('Generated filename:'),
      hasCopyButton: await page.locator('button:has-text("Copy")').count() > 0,
      hasFileSelection: await page.locator('button').filter({ hasText: /select|file|choose/i }).count() > 0,

      // Count sections
      sectionCount: await page.locator('div.space-y-2 > p, div.space-y-2 > div').count(),

      // Get all visible text for detailed analysis
      allText: pageContent
    };

    console.log('Movie Features Found:', Object.keys(movieFeatures).filter(key => movieFeatures[key] === true));

    // Take screenshot for reference
    await page.screenshot({ path: '/tmp/claude/movie-details.png', fullPage: true });

    console.log('Movie analysis complete');
  });

  test('Analyze TV Show Details Page Features', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173');

    // Wait for the app to load
    await page.waitForSelector('input[type="text"]', { timeout: 10000 });

    // Search for a TV show
    await page.fill('input[type="text"]', 'Star Trek The Next Generation');
    await page.waitForTimeout(2000);

    // Look for TV show results and click
    const tvResult = page.locator('[data-testid="search-result"], .cursor-pointer').filter({ hasText: 'Star Trek' }).filter({ hasText: 'Generation' }).first();
    if (await tvResult.count() > 0) {
      await tvResult.click();
    } else {
      // Fallback: click any TV result
      await page.locator('[data-testid="search-result"], .cursor-pointer').first().click();
    }

    // Wait for details to load
    await page.waitForTimeout(3000);

    // Extract all displayed information
    const pageContent = await page.textContent('body');
    console.log('=== TV SHOW PAGE ANALYSIS ===');

    // Check for specific elements/features
    tvShowFeatures = {
      hasTitle: await page.locator('h2:has-text("Star Trek")').count() > 0,
      hasPosterImage: await page.locator('img[alt*="Star Trek"]').count() > 0,
      hasFirstAired: pageContent.includes('First Aired:'),
      hasLastAired: pageContent.includes('Last Aired:'),
      hasEpisodeRuntime: pageContent.includes('Episode Runtime:') || pageContent.includes('minutes'),
      hasSeasons: pageContent.includes('Seasons:'),
      hasRating: pageContent.includes('Rating:') || pageContent.includes('/10'),
      hasStatus: pageContent.includes('Status:'),
      hasTagline: pageContent.includes('Tagline:'),
      hasGenres: pageContent.includes('Genres:'),
      hasKeywords: pageContent.includes('Keywords:'),
      hasCast: pageContent.includes('Cast:'),
      hasDirectors: pageContent.includes('Director'),
      hasComposers: pageContent.includes('Composer'),
      hasNetwork: pageContent.includes('Network:'),
      hasEpisodeInfo: pageContent.includes('Episode:') && pageContent.includes('S0'),
      hasGeneratedFilename: pageContent.includes('Generated filename:'),
      hasCopyButton: await page.locator('button:has-text("Copy")').count() > 0,
      hasFileSelection: await page.locator('button').filter({ hasText: /select|file|choose/i }).count() > 0,

      // Count sections
      sectionCount: await page.locator('div.space-y-2 > p, div.space-y-2 > div').count(),

      // Get all visible text for detailed analysis
      allText: pageContent
    };

    console.log('TV Show Features Found:', Object.keys(tvShowFeatures).filter(key => tvShowFeatures[key] === true));

    // Take screenshot for reference
    await page.screenshot({ path: '/tmp/claude/tv-show-details.png', fullPage: true });

    console.log('TV Show analysis complete');
  });

  test('Generate Comparison Report', async ({ page }) => {
    console.log('\n=== DETAILED FEATURE COMPARISON REPORT ===\n');

    // Features that should be equivalent
    const equivalentFeatures = [
      { movie: 'hasTitle', tv: 'hasTitle', name: 'Title Display' },
      { movie: 'hasPosterImage', tv: 'hasPosterImage', name: 'Poster Image' },
      { movie: 'hasRating', tv: 'hasRating', name: 'Rating/Vote Average' },
      { movie: 'hasTagline', tv: 'hasTagline', name: 'Tagline' },
      { movie: 'hasGenres', tv: 'hasGenres', name: 'Genres' },
      { movie: 'hasKeywords', tv: 'hasKeywords', name: 'Keywords/Tags' },
      { movie: 'hasCast', tv: 'hasCast', name: 'Cast Members' },
      { movie: 'hasDirectors', tv: 'hasDirectors', name: 'Directors' },
      { movie: 'hasComposers', tv: 'hasComposers', name: 'Composers' },
      { movie: 'hasGeneratedFilename', tv: 'hasGeneratedFilename', name: 'Generated Filename' },
      { movie: 'hasCopyButton', tv: 'hasCopyButton', name: 'Copy Button' },
      { movie: 'hasFileSelection', tv: 'hasFileSelection', name: 'File Selection' }
    ];

    // Analyze equivalent features
    console.log('🎬 EQUIVALENT FEATURES COMPARISON:');
    equivalentFeatures.forEach(({ movie, tv, name }) => {
      const movieHas = movieFeatures[movie];
      const tvHas = tvShowFeatures[tv];
      if (movieHas && tvHas) {
        console.log(`✅ ${name}: Both have this feature`);
      } else if (movieHas && !tvHas) {
        console.log(`❌ ${name}: MISSING from TV shows (Movie has it)`);
      } else if (!movieHas && tvHas) {
        console.log(`➕ ${name}: TV show has it, Movie doesn't`);
      } else {
        console.log(`⚠️  ${name}: Neither has this feature`);
      }
    });

    // Movie-specific features
    console.log('\n📽️  MOVIE-SPECIFIC FEATURES:');
    const movieSpecific = [
      { key: 'hasReleaseDate', name: 'Release Date' },
      { key: 'hasRuntime', name: 'Runtime (movie length)' }
    ];

    movieSpecific.forEach(({ key, name }) => {
      console.log(`${movieFeatures[key] ? '✅' : '❌'} ${name}: ${movieFeatures[key] ? 'Present' : 'Missing'}`);
    });

    // TV-specific features
    console.log('\n📺 TV SHOW-SPECIFIC FEATURES:');
    const tvSpecific = [
      { key: 'hasFirstAired', name: 'First Aired Date' },
      { key: 'hasLastAired', name: 'Last Aired Date' },
      { key: 'hasEpisodeRuntime', name: 'Episode Runtime' },
      { key: 'hasSeasons', name: 'Number of Seasons/Episodes' },
      { key: 'hasStatus', name: 'Series Status' },
      { key: 'hasNetwork', name: 'Network/Channel' },
      { key: 'hasEpisodeInfo', name: 'Current Episode Info' }
    ];

    tvSpecific.forEach(({ key, name }) => {
      console.log(`${tvShowFeatures[key] ? '✅' : '❌'} ${name}: ${tvShowFeatures[key] ? 'Present' : 'Missing'}`);
    });

    // Overall section count comparison
    console.log('\n📊 SECTION COUNT COMPARISON:');
    console.log(`Movie sections: ${movieFeatures.sectionCount}`);
    console.log(`TV Show sections: ${tvShowFeatures.sectionCount}`);

    if (movieFeatures.sectionCount > tvShowFeatures.sectionCount) {
      console.log(`❌ TV Shows have ${movieFeatures.sectionCount - tvShowFeatures.sectionCount} fewer sections than Movies`);
    } else if (tvShowFeatures.sectionCount > movieFeatures.sectionCount) {
      console.log(`✅ TV Shows have ${tvShowFeatures.sectionCount - movieFeatures.sectionCount} more sections than Movies`);
    } else {
      console.log(`✅ Both have equal number of sections`);
    }

    // Critical missing features identification
    console.log('\n🚨 CRITICAL MISSING FEATURES IN TV SHOWS:');
    const criticalMissing = [];

    equivalentFeatures.forEach(({ movie, tv, name }) => {
      if (movieFeatures[movie] && !tvShowFeatures[tv]) {
        criticalMissing.push(name);
      }
    });

    if (criticalMissing.length > 0) {
      console.log('The following features are missing from TV shows:');
      criticalMissing.forEach(feature => console.log(`  - ${feature}`));
    } else {
      console.log('✅ All equivalent features are present in both pages!');
    }

    console.log('\n=== END OF COMPARISON REPORT ===\n');
  });
});