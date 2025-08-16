import { test, expect } from '@playwright/test';

test.describe('Projects App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the desktop to load
    await page.waitForSelector('.desktop');
  });

  test('opens projects app from start menu', async ({ page }) => {
    // Click start button
    await page.click('.start-button');

    // Wait for start menu to open
    await page.waitForSelector('.start-menu');

    // Click Projects app
    await page.click('text=Projects');

    // Wait for projects window to open
    await page.waitForSelector('.projects-app', { timeout: 10000 });

    // Check that projects window is visible
    await expect(page.locator('.projects-app')).toBeVisible();
    await expect(page.locator('h1.projects-title')).toContainText('Projects');
  });

  test('displays loading state initially', async ({ page }) => {
    // Open projects app
    await page.click('.start-button');
    await page.waitForSelector('.start-menu');
    await page.click('text=Projects');

    // Check loading state appears first
    await expect(page.locator('.projects-loading')).toBeVisible();
    await expect(page.locator('text=Loading GitHub repositories...')).toBeVisible();
    await expect(page.locator('.projects-loading-spinner')).toBeVisible();
  });

  test('displays GitHub profile and repositories after loading', async ({ page }) => {
    // Open projects app
    await page.click('.start-button');
    await page.waitForSelector('.start-menu');
    await page.click('text=Projects');

    // Wait for loading to complete
    await page.waitForSelector('.projects-profile', { timeout: 15000 });

    // Check profile information is displayed
    await expect(page.locator('.projects-profile-name')).toBeVisible();
    await expect(page.locator('.projects-avatar')).toBeVisible();
    await expect(page.locator('.projects-profile-stats')).toBeVisible();

    // Check repository grid is displayed
    await expect(page.locator('.projects-grid')).toBeVisible();

    // Check that at least one repository card is displayed
    await expect(page.locator('.projects-repo-card').first()).toBeVisible();
  });

  test('searches repositories by name', async ({ page }) => {
    // Open projects app and wait for load
    await page.click('.start-button');
    await page.waitForSelector('.start-menu');
    await page.click('text=Projects');
    await page.waitForSelector('.projects-grid', { timeout: 15000 });

    // Get initial number of repositories
    const initialRepos = await page.locator('.projects-repo-card').count();
    expect(initialRepos).toBeGreaterThan(0);

    // Search for specific repository
    const searchInput = page.locator('.projects-search-input');
    await searchInput.fill('portfolio');

    // Wait for search results
    await page.waitForTimeout(500);

    // Check that results are filtered
    const filteredRepos = await page.locator('.projects-repo-card').count();
    expect(filteredRepos).toBeLessThanOrEqual(initialRepos);

    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(500);

    // Check that all repositories are shown again
    const finalRepos = await page.locator('.projects-repo-card').count();
    expect(finalRepos).toBe(initialRepos);
  });

  test('filters repositories by language', async ({ page }) => {
    // Open projects app and wait for load
    await page.click('.start-button');
    await page.waitForSelector('.start-menu');
    await page.click('text=Projects');
    await page.waitForSelector('.projects-grid', { timeout: 15000 });

    // Get initial number of repositories
    const initialRepos = await page.locator('.projects-repo-card').count();
    expect(initialRepos).toBeGreaterThan(0);

    // Filter by a specific language (check if TypeScript option exists)
    const languageSelect = page.locator('.projects-filter-select');
    const hasTypeScript = (await languageSelect.locator('option[value="TypeScript"]').count()) > 0;

    if (hasTypeScript) {
      await languageSelect.selectOption('TypeScript');
      await page.waitForTimeout(500);

      // Check that results are filtered
      const filteredRepos = await page.locator('.projects-repo-card').count();
      expect(filteredRepos).toBeLessThanOrEqual(initialRepos);

      // Verify that visible repositories show TypeScript language
      const visibleLanguages = await page.locator('.projects-repo-language').allTextContents();
      visibleLanguages.forEach((lang) => {
        expect(lang).toContain('TypeScript');
      });
    }

    // Reset filter
    await languageSelect.selectOption('all');
    await page.waitForTimeout(500);

    // Check that all repositories are shown again
    const finalRepos = await page.locator('.projects-repo-card').count();
    expect(finalRepos).toBe(initialRepos);
  });

  test('sorts repositories by different criteria', async ({ page }) => {
    // Open projects app and wait for load
    await page.click('.start-button');
    await page.waitForSelector('.start-menu');
    await page.click('text=Projects');
    await page.waitForSelector('.projects-grid', { timeout: 15000 });

    // Wait for repositories to load
    await expect(page.locator('.projects-repo-card').first()).toBeVisible();

    const sortSelect = page.locator('.projects-sort-select');

    // Sort by name
    await sortSelect.selectOption('name');
    await page.waitForTimeout(500);

    // Sort by stars
    await sortSelect.selectOption('stars');
    await page.waitForTimeout(500);

    // Names should potentially be different (unless the alphabetically first has the most stars)
    // Just check that sorting doesn't break the interface
    await expect(page.locator('.projects-repo-card').first()).toBeVisible();

    // Sort by updated date
    await sortSelect.selectOption('updated');
    await page.waitForTimeout(500);

    // Check that interface still works
    await expect(page.locator('.projects-repo-card').first()).toBeVisible();
  });

  test('opens repository in new tab when clicked', async ({ page }) => {
    // Open projects app and wait for load
    await page.click('.start-button');
    await page.waitForSelector('.start-menu');
    await page.click('text=Projects');
    await page.waitForSelector('.projects-grid', { timeout: 15000 });

    // Wait for repositories to load
    await expect(page.locator('.projects-repo-card').first()).toBeVisible();

    // Listen for popup/new tab
    const [popup] = await Promise.all([page.waitForEvent('popup'), page.click('.projects-repo-card:first-child')]);

    // Check that popup opened with GitHub URL
    expect(popup.url()).toContain('github.com');
    expect(popup.url()).toContain('ThalisonCosta');

    await popup.close();
  });

  test('refreshes repository data', async ({ page }) => {
    // Open projects app and wait for load
    await page.click('.start-button');
    await page.waitForSelector('.start-menu');
    await page.click('text=Projects');
    await page.waitForSelector('.projects-grid', { timeout: 15000 });

    // Wait for initial load
    await expect(page.locator('.projects-repo-card').first()).toBeVisible();

    // Click refresh button
    const refreshButton = page.locator('.projects-refresh-btn');
    await refreshButton.click();

    // Check that refresh animation appears
    await expect(refreshButton).toHaveClass(/refreshing/);

    // Wait for refresh to complete
    await page.waitForFunction(
      () => {
        const btn = document.querySelector('.projects-refresh-btn');
        return btn && !btn.classList.contains('refreshing');
      },
      { timeout: 10000 }
    );

    // Check that repositories are still displayed
    await expect(page.locator('.projects-repo-card').first()).toBeVisible();
  });

  test('displays repository topics and metadata', async ({ page }) => {
    // Open projects app and wait for load
    await page.click('.start-button');
    await page.waitForSelector('.start-menu');
    await page.click('text=Projects');
    await page.waitForSelector('.projects-grid', { timeout: 15000 });

    // Wait for repositories to load
    await expect(page.locator('.projects-repo-card').first()).toBeVisible();

    // Check that repository cards contain required elements
    const firstCard = page.locator('.projects-repo-card').first();

    // Check repository name
    await expect(firstCard.locator('.projects-repo-name')).toBeVisible();

    // Check repository description
    await expect(firstCard.locator('.projects-repo-description')).toBeVisible();

    // Check repository stats (stars and forks)
    await expect(firstCard.locator('.projects-repo-stats')).toBeVisible();

    // Check updated date
    await expect(firstCard.locator('.projects-repo-updated')).toBeVisible();

    // Check if topics are displayed (some repos might not have topics)
    const topicsCount = await firstCard.locator('.projects-topic-tag').count();
    if (topicsCount > 0) {
      await expect(firstCard.locator('.projects-topic-tag').first()).toBeVisible();
    }
  });

  test('displays pinned repositories with badge', async ({ page }) => {
    // Open projects app and wait for load
    await page.click('.start-button');
    await page.waitForSelector('.start-menu');
    await page.click('text=Projects');
    await page.waitForSelector('.projects-grid', { timeout: 15000 });

    // Wait for repositories to load
    await expect(page.locator('.projects-repo-card').first()).toBeVisible();

    // Check if any pinned repositories exist
    const pinnedCount = await page.locator('.projects-pinned-badge').count();

    if (pinnedCount > 0) {
      // Check that pinned badge is visible
      await expect(page.locator('.projects-pinned-badge').first()).toBeVisible();
      await expect(page.locator('.projects-pinned-badge').first()).toContainText('Pinned');

      // Check that pinned cards have special styling
      await expect(page.locator('.projects-repo-card.pinned').first()).toBeVisible();
    }

    // Check that statistics include pinned count
    const subtitle = page.locator('.projects-subtitle');
    await expect(subtitle).toContainText('pinned');
  });

  test('handles no search results gracefully', async ({ page }) => {
    // Open projects app and wait for load
    await page.click('.start-button');
    await page.waitForSelector('.start-menu');
    await page.click('text=Projects');
    await page.waitForSelector('.projects-grid', { timeout: 15000 });

    // Wait for repositories to load
    await expect(page.locator('.projects-repo-card').first()).toBeVisible();

    // Search for something that won't match any repositories
    const searchInput = page.locator('.projects-search-input');
    await searchInput.fill('xyznonexistentrepo123');
    await page.waitForTimeout(500);

    // Check that no results message is displayed
    await expect(page.locator('.projects-no-results')).toBeVisible();
    await expect(page.locator('text=No repositories found')).toBeVisible();
    await expect(page.locator('text=Try adjusting your search or filter criteria')).toBeVisible();

    // Clear search to restore repositories
    await searchInput.clear();
    await page.waitForTimeout(500);

    // Check that repositories are visible again
    await expect(page.locator('.projects-repo-card').first()).toBeVisible();
  });

  test('displays profile statistics correctly', async ({ page }) => {
    // Open projects app and wait for load
    await page.click('.start-button');
    await page.waitForSelector('.start-menu');
    await page.click('text=Projects');
    await page.waitForSelector('.projects-profile', { timeout: 15000 });

    // Check profile section elements
    await expect(page.locator('.projects-avatar')).toBeVisible();
    await expect(page.locator('.projects-profile-name')).toBeVisible();

    // Check profile stats
    const stats = page.locator('.projects-profile-stats');
    await expect(stats).toBeVisible();

    // Check that stats contain numbers
    const statsText = await stats.textContent();
    expect(statsText).toMatch(/\d+/); // Should contain at least one number

    // Check header statistics
    const subtitle = page.locator('.projects-subtitle');
    await expect(subtitle).toBeVisible();

    const subtitleText = await subtitle.textContent();
    expect(subtitleText).toMatch(/\d+ repositories/);
    expect(subtitleText).toMatch(/\d+ stars/);
    expect(subtitleText).toMatch(/\d+ pinned/);
  });

  test('responds to window resize properly', async ({ page }) => {
    // Open projects app and wait for load
    await page.click('.start-button');
    await page.waitForSelector('.start-menu');
    await page.click('text=Projects');
    await page.waitForSelector('.projects-grid', { timeout: 15000 });

    // Wait for repositories to load
    await expect(page.locator('.projects-repo-card').first()).toBeVisible();

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // Check that layout adapts to mobile
    await expect(page.locator('.projects-app')).toBeVisible();
    await expect(page.locator('.projects-repo-card').first()).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);

    // Check that layout works on tablet
    await expect(page.locator('.projects-app')).toBeVisible();
    await expect(page.locator('.projects-repo-card').first()).toBeVisible();

    // Return to desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);

    // Check that layout returns to desktop
    await expect(page.locator('.projects-app')).toBeVisible();
    await expect(page.locator('.projects-repo-card').first()).toBeVisible();
  });
});
