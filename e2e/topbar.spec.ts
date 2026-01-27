import { test, expect, Page } from '@playwright/test';

/**
 * Helper to check if two bounding boxes overlap
 */
function boxesOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
): boolean {
  // No horizontal overlap if one is completely to the left of the other
  if (a.x + a.width <= b.x || b.x + b.width <= a.x) return false;
  // No vertical overlap if one is completely above the other
  if (a.y + a.height <= b.y || b.y + b.height <= a.y) return false;
  return true;
}

/**
 * Helper to get bounding box with error handling
 */
async function getBoundingBox(page: Page, selector: string) {
  const element = page.locator(selector);
  const box = await element.boundingBox();
  if (!box) {
    throw new Error(`Element not found or not visible: ${selector}`);
  }
  return box;
}

test.describe('Topbar Layout - Real Measurements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Element Overlap Detection', () => {
    test('left section and center section should not overlap at wide viewport', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.waitForTimeout(100); // Allow layout to settle

      const leftBox = await getBoundingBox(page, '.topbar__left-section');
      const centerBox = await getBoundingBox(page, '.topbar__center-section');

      expect(boxesOverlap(leftBox, centerBox)).toBe(false);
    });

    test('center section and right section should not overlap at wide viewport', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.waitForTimeout(100);

      const centerBox = await getBoundingBox(page, '.topbar__center-section');
      const rightBox = await getBoundingBox(page, '.topbar__right-section');

      expect(boxesOverlap(centerBox, rightBox)).toBe(false);
    });

    test('left section and right section should not overlap at medium viewport', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 600, height: 800 });
      await page.waitForTimeout(100);

      const leftBox = await getBoundingBox(page, '.topbar__left-section');
      const rightBox = await getBoundingBox(page, '.topbar__right-section');

      expect(boxesOverlap(leftBox, rightBox)).toBe(false);
    });

    test('all three sections should not overlap at any tested viewport', async ({ page }) => {
      const viewportWidths = [1200, 900, 700, 500, 400, 320];

      for (const width of viewportWidths) {
        await page.setViewportSize({ width, height: 800 });
        await page.waitForTimeout(100);

        const leftBox = await getBoundingBox(page, '.topbar__left-section');
        const centerBox = await getBoundingBox(page, '.topbar__center-section');
        const rightBox = await getBoundingBox(page, '.topbar__right-section');

        // In wrapped state, center is on a different row, so we check row-by-row
        const topbar = page.locator('.topbar');
        const isWrapped = await topbar.evaluate((el) =>
          el.classList.contains('topbar--center-wrapped')
        );

        if (!isWrapped) {
          // All on same row - none should overlap
          expect(
            boxesOverlap(leftBox, centerBox),
            `Left and center overlap at ${width}px`
          ).toBe(false);
          expect(
            boxesOverlap(centerBox, rightBox),
            `Center and right overlap at ${width}px`
          ).toBe(false);
        }

        // Left and right should never overlap regardless of wrap state
        expect(boxesOverlap(leftBox, rightBox), `Left and right overlap at ${width}px`).toBe(
          false
        );
      }
    });
  });

  test.describe('Center Section Wrapping', () => {
    test('center section should be on first row at wide viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.waitForTimeout(100);

      const topbar = page.locator('.topbar');
      const isWrapped = await topbar.evaluate((el) =>
        el.classList.contains('topbar--center-wrapped')
      );

      expect(isWrapped).toBe(false);

      // Verify they share similar Y coordinates (same row)
      const leftBox = await getBoundingBox(page, '.topbar__left-section');
      const centerBox = await getBoundingBox(page, '.topbar__center-section');

      // They should be approximately on the same vertical position
      const yDifference = Math.abs(leftBox.y - centerBox.y);
      expect(yDifference).toBeLessThan(leftBox.height);
    });

    test('center section should wrap to second row at narrow viewport', async ({ page }) => {
      await page.setViewportSize({ width: 400, height: 800 });
      await page.waitForTimeout(100);

      const topbar = page.locator('.topbar');
      const isWrapped = await topbar.evaluate((el) =>
        el.classList.contains('topbar--center-wrapped')
      );

      expect(isWrapped).toBe(true);

      // Verify center is below left/right sections
      const leftBox = await getBoundingBox(page, '.topbar__left-section');
      const centerBox = await getBoundingBox(page, '.topbar__center-section');

      expect(centerBox.y).toBeGreaterThan(leftBox.y);
    });

    test('wrap state should toggle correctly when resizing large to small', async ({
      page,
    }) => {
      // Start wide
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.waitForTimeout(100);

      let topbar = page.locator('.topbar');
      let isWrapped = await topbar.evaluate((el) =>
        el.classList.contains('topbar--center-wrapped')
      );
      expect(isWrapped).toBe(false);

      // Shrink to narrow
      await page.setViewportSize({ width: 400, height: 800 });
      await page.waitForTimeout(100);

      isWrapped = await topbar.evaluate((el) =>
        el.classList.contains('topbar--center-wrapped')
      );
      expect(isWrapped).toBe(true);
    });

    test('wrap state should toggle correctly when resizing small to large', async ({
      page,
    }) => {
      // Start narrow
      await page.setViewportSize({ width: 400, height: 800 });
      await page.waitForTimeout(100);

      let topbar = page.locator('.topbar');
      let isWrapped = await topbar.evaluate((el) =>
        el.classList.contains('topbar--center-wrapped')
      );
      expect(isWrapped).toBe(true);

      // Expand to wide
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.waitForTimeout(100);

      isWrapped = await topbar.evaluate((el) =>
        el.classList.contains('topbar--center-wrapped')
      );
      expect(isWrapped).toBe(false);
    });

    test('left and right should remain on first row when center wraps', async ({ page }) => {
      await page.setViewportSize({ width: 400, height: 800 });
      await page.waitForTimeout(100);

      const leftBox = await getBoundingBox(page, '.topbar__left-section');
      const rightBox = await getBoundingBox(page, '.topbar__right-section');

      // Left and right should be on the same row (similar Y coordinates)
      const yDifference = Math.abs(leftBox.y - rightBox.y);
      expect(yDifference).toBeLessThan(Math.max(leftBox.height, rightBox.height));
    });
  });

  test.describe('Center Section Centering', () => {
    test('center section should be horizontally centered relative to viewport', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.waitForTimeout(100);

      const topbarBox = await getBoundingBox(page, '.topbar');
      const centerBox = await getBoundingBox(page, '.topbar__center-section');

      const topbarCenterX = topbarBox.x + topbarBox.width / 2;
      const sectionCenterX = centerBox.x + centerBox.width / 2;

      // Allow small tolerance for rounding
      expect(Math.abs(topbarCenterX - sectionCenterX)).toBeLessThan(5);
    });

    test('wrapped center section should be horizontally centered', async ({ page }) => {
      await page.setViewportSize({ width: 400, height: 800 });
      await page.waitForTimeout(100);

      const topbarBox = await getBoundingBox(page, '.topbar');
      const centerBox = await getBoundingBox(page, '.topbar__center-section');

      const topbarCenterX = topbarBox.x + topbarBox.width / 2;
      const sectionCenterX = centerBox.x + centerBox.width / 2;

      // Allow small tolerance for rounding
      expect(Math.abs(topbarCenterX - sectionCenterX)).toBeLessThan(5);
    });
  });

  test.describe('Chip Constraints', () => {
    test('chip should respect max-width of 280px', async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.waitForTimeout(100);

      const chipBox = await getBoundingBox(page, '.chip');

      expect(chipBox.width).toBeLessThanOrEqual(280);
    });

    test('chip should not shrink below min-width of 40px', async ({ page }) => {
      // Even at very narrow viewport, chip should maintain min-width
      await page.setViewportSize({ width: 320, height: 800 });
      await page.waitForTimeout(100);

      const chip = page.locator('.chip');
      const minWidth = await chip.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return parseFloat(style.minWidth);
      });

      expect(minWidth).toBe(40);
    });

    test('chip should truncate text with ellipsis when exceeding max-width', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.waitForTimeout(100);

      const chip = page.locator('.chip');

      // Check that ellipsis styles are applied
      const styles = await chip.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          textOverflow: computed.textOverflow,
          overflow: computed.overflow,
          whiteSpace: computed.whiteSpace,
        };
      });

      expect(styles.textOverflow).toBe('ellipsis');
      expect(styles.overflow).toBe('hidden');
      expect(styles.whiteSpace).toBe('nowrap');
    });

    test('chip text should be visually truncated when content exceeds max-width', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.waitForTimeout(100);

      const chip = page.locator('.chip');
      const chipBox = await chip.boundingBox();
      const scrollWidth = await chip.evaluate((el) => el.scrollWidth);

      // If content is truncated, scrollWidth should be greater than visible width
      if (chipBox && scrollWidth > chipBox.width) {
        // Text is truncated - this is expected for long text
        expect(chipBox.width).toBeLessThanOrEqual(280);
      }
    });
  });

  test.describe('Title Truncation', () => {
    test('title should have text-overflow: ellipsis style', async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.waitForTimeout(100);

      const title = page.locator('.topbar__title');
      const styles = await title.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          textOverflow: computed.textOverflow,
          overflow: computed.overflow,
          whiteSpace: computed.whiteSpace,
        };
      });

      expect(styles.textOverflow).toBe('ellipsis');
      expect(styles.overflow).toBe('hidden');
      expect(styles.whiteSpace).toBe('nowrap');
    });
  });

  test.describe('Back Button', () => {
    test('back button should be clickable and emit event', async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });

      // Set up console listener before clicking
      const consoleMessages: string[] = [];
      page.on('console', (msg) => {
        consoleMessages.push(msg.text());
      });

      const backButton = page.locator('.topbar__back-button');
      await backButton.click();

      // Wait a moment for console message
      await page.waitForTimeout(100);

      expect(consoleMessages).toContain('Back button clicked');
    });

    test('back button should have accessible aria-label', async ({ page }) => {
      const backButton = page.locator('.topbar__back-button');
      const ariaLabel = await backButton.getAttribute('aria-label');

      expect(ariaLabel).toBe('Go back');
    });
  });

  test.describe('Layout Structure', () => {
    test('topbar should use CSS grid layout', async ({ page }) => {
      const topbar = page.locator('.topbar');
      const display = await topbar.evaluate((el) => window.getComputedStyle(el).display);

      expect(display).toBe('grid');
    });

    test('topbar should have proper min-height', async ({ page }) => {
      const topbar = page.locator('.topbar');
      const minHeight = await topbar.evaluate((el) => {
        return parseFloat(window.getComputedStyle(el).minHeight);
      });

      expect(minHeight).toBe(56);
    });

    test('topbar should have gap between sections', async ({ page }) => {
      const topbar = page.locator('.topbar');
      const gap = await topbar.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return parseFloat(style.columnGap) || parseFloat(style.gap) || 0;
      });

      expect(gap).toBe(8);
    });
  });

  test.describe('Responsive Behavior Stress Test', () => {
    test('layout should handle rapid viewport changes without breaking', async ({ page }) => {
      const viewportSizes = [
        { width: 1200, height: 800 },
        { width: 600, height: 800 },
        { width: 400, height: 800 },
        { width: 800, height: 800 },
        { width: 320, height: 800 },
        { width: 1000, height: 800 },
      ];

      for (const size of viewportSizes) {
        await page.setViewportSize(size);
        await page.waitForTimeout(50);

        // Verify topbar is still visible and structured correctly
        const topbar = page.locator('.topbar');
        await expect(topbar).toBeVisible();

        const leftSection = page.locator('.topbar__left-section');
        const centerSection = page.locator('.topbar__center-section');
        const rightSection = page.locator('.topbar__right-section');

        await expect(leftSection).toBeVisible();
        await expect(centerSection).toBeVisible();
        await expect(rightSection).toBeVisible();

        // Verify no horizontal overflow
        const topbarBox = await topbar.boundingBox();
        const leftBox = await leftSection.boundingBox();
        const rightBox = await rightSection.boundingBox();

        if (topbarBox && leftBox && rightBox) {
          expect(leftBox.x).toBeGreaterThanOrEqual(topbarBox.x);
          expect(rightBox.x + rightBox.width).toBeLessThanOrEqual(
            topbarBox.x + topbarBox.width + 1
          ); // +1 for rounding
        }
      }
    });

    test('wrap threshold should be consistent', async ({ page }) => {
      // Find the wrap threshold by binary search
      let low = 300;
      let high = 1200;
      let wrapThreshold = high;

      while (high - low > 10) {
        const mid = Math.floor((low + high) / 2);
        await page.setViewportSize({ width: mid, height: 800 });
        await page.waitForTimeout(100);

        const isWrapped = await page.locator('.topbar').evaluate((el) =>
          el.classList.contains('topbar--center-wrapped')
        );

        if (isWrapped) {
          low = mid;
        } else {
          high = mid;
          wrapThreshold = mid;
        }
      }

      // Now verify the threshold is stable
      await page.setViewportSize({ width: wrapThreshold + 20, height: 800 });
      await page.waitForTimeout(100);
      let isWrapped = await page.locator('.topbar').evaluate((el) =>
        el.classList.contains('topbar--center-wrapped')
      );
      expect(isWrapped).toBe(false);

      await page.setViewportSize({ width: wrapThreshold - 20, height: 800 });
      await page.waitForTimeout(100);
      isWrapped = await page.locator('.topbar').evaluate((el) =>
        el.classList.contains('topbar--center-wrapped')
      );
      expect(isWrapped).toBe(true);
    });
  });

  test.describe('Visual Regression Prevention', () => {
    test('topbar height should increase when center wraps', async ({ page }) => {
      // Get height when not wrapped
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.waitForTimeout(100);
      const unwrappedBox = await getBoundingBox(page, '.topbar');
      const unwrappedHeight = unwrappedBox.height;

      // Get height when wrapped
      await page.setViewportSize({ width: 400, height: 800 });
      await page.waitForTimeout(100);
      const wrappedBox = await getBoundingBox(page, '.topbar');
      const wrappedHeight = wrappedBox.height;

      // Wrapped height should be greater (two rows)
      expect(wrappedHeight).toBeGreaterThan(unwrappedHeight);
    });

    test('right section should always be aligned to the right edge', async ({ page }) => {
      const viewportWidths = [1200, 800, 600, 400];

      for (const width of viewportWidths) {
        await page.setViewportSize({ width, height: 800 });
        await page.waitForTimeout(100);

        const topbarBox = await getBoundingBox(page, '.topbar');
        const rightBox = await getBoundingBox(page, '.topbar__right-section');

        // Right section's right edge should be near topbar's right edge (accounting for padding)
        const rightEdgeDistance = topbarBox.x + topbarBox.width - (rightBox.x + rightBox.width);
        expect(rightEdgeDistance).toBeLessThanOrEqual(20); // Allow for padding
      }
    });

    test('left section should always be aligned to the left edge', async ({ page }) => {
      const viewportWidths = [1200, 800, 600, 400];

      for (const width of viewportWidths) {
        await page.setViewportSize({ width, height: 800 });
        await page.waitForTimeout(100);

        const topbarBox = await getBoundingBox(page, '.topbar');
        const leftBox = await getBoundingBox(page, '.topbar__left-section');

        // Left section's left edge should be near topbar's left edge (accounting for padding)
        const leftEdgeDistance = leftBox.x - topbarBox.x;
        expect(leftEdgeDistance).toBeLessThanOrEqual(20); // Allow for padding
      }
    });
  });
});
