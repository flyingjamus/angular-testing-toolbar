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

test.describe('Designer Header Layout - Real Measurements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Element Overlap Detection', () => {
    test('left section and center section should not overlap at wide viewport', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.waitForTimeout(100); // Allow layout to settle

      const leftBox = await getBoundingBox(page, '.lds-designer-header-left-side');
      const centerBox = await getBoundingBox(page, '.lds-designer-header-center-content');

      expect(boxesOverlap(leftBox, centerBox)).toBe(false);
    });

    test('center section and right section should not overlap at wide viewport', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.waitForTimeout(100);

      const centerBox = await getBoundingBox(page, '.lds-designer-header-center-content');
      const rightBox = await getBoundingBox(page, '.lds-designer-header-right-side');

      expect(boxesOverlap(centerBox, rightBox)).toBe(false);
    });

    test('left section and right section should not overlap at medium viewport', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 600, height: 800 });
      await page.waitForTimeout(100);

      const leftBox = await getBoundingBox(page, '.lds-designer-header-left-side');
      const rightBox = await getBoundingBox(page, '.lds-designer-header-right-side');

      expect(boxesOverlap(leftBox, rightBox)).toBe(false);
    });

    test('all three sections should not overlap at any tested viewport', async ({ page }) => {
      const viewportWidths = [1200, 900, 700, 500, 400, 320];

      for (const width of viewportWidths) {
        await page.setViewportSize({ width, height: 800 });
        await page.waitForTimeout(100);

        const leftBox = await getBoundingBox(page, '.lds-designer-header-left-side');
        const centerBox = await getBoundingBox(page, '.lds-designer-header-center-content');
        const rightBox = await getBoundingBox(page, '.lds-designer-header-right-side');

        // In wrapped state, center is on a different row, so we check row-by-row
        const container = page.locator('.lds-designer-header-container');
        const isWrapped = await container.evaluate((el) =>
          el.classList.contains('lds-designer-header-center-wrap')
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

    test('title should not visually overlap chip', async ({ page }) => {
      const viewportWidths = [600, 400, 320];

      for (const width of viewportWidths) {
        await page.setViewportSize({ width, height: 800 });
        await page.waitForTimeout(100);

        const overlapCheck = await page.evaluate(() => {
          const title = document.querySelector<HTMLElement>(
            'lds-designer-header .lds-designer-header-title'
          );
          const chip = document.querySelector<HTMLElement>('lds-designer-header .chip');
          if (!title || !chip) return { ok: true };

          const a = title.getBoundingClientRect();
          const b = chip.getBoundingClientRect();

          const left = Math.max(a.left, b.left);
          const top = Math.max(a.top, b.top);
          const right = Math.min(a.right, b.right);
          const bottom = Math.min(a.bottom, b.bottom);

          const hasIntersection = right > left && bottom > top;
          return { ok: !hasIntersection, hasIntersection };
        });

        expect(overlapCheck.ok, `width=${width} ${JSON.stringify(overlapCheck)}`).toBe(true);
      }
    });
  });

  test.describe('Center Section Wrapping', () => {
    test('center section should be on first row at wide viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.waitForTimeout(100);

      const container = page.locator('.lds-designer-header-container');
      const isWrapped = await container.evaluate((el) =>
        el.classList.contains('lds-designer-header-center-wrap')
      );

      expect(isWrapped).toBe(false);

      // Verify they share similar Y coordinates (same row)
      const leftBox = await getBoundingBox(page, '.lds-designer-header-left-side');
      const centerBox = await getBoundingBox(page, '.lds-designer-header-center-content');

      // They should be approximately on the same vertical position
      const yDifference = Math.abs(leftBox.y - centerBox.y);
      expect(yDifference).toBeLessThan(leftBox.height);
    });

    test('center section should wrap to second row at narrow viewport', async ({ page }) => {
      await page.setViewportSize({ width: 400, height: 800 });
      await page.waitForTimeout(100);

      const container = page.locator('.lds-designer-header-container');
      const isWrapped = await container.evaluate((el) =>
        el.classList.contains('lds-designer-header-center-wrap')
      );

      expect(isWrapped).toBe(true);

      // Verify center is below left/right sections
      const leftBox = await getBoundingBox(page, '.lds-designer-header-left-side');
      const centerBox = await getBoundingBox(page, '.lds-designer-header-center-content');

      expect(centerBox.y).toBeGreaterThan(leftBox.y);
    });

    test('wrap state should toggle correctly when resizing large to small', async ({
      page,
    }) => {
      // Start wide
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.waitForTimeout(100);

      let container = page.locator('.lds-designer-header-container');
      let isWrapped = await container.evaluate((el) =>
        el.classList.contains('lds-designer-header-center-wrap')
      );
      expect(isWrapped).toBe(false);

      // Shrink to narrow
      await page.setViewportSize({ width: 400, height: 800 });
      await page.waitForTimeout(100);

      isWrapped = await container.evaluate((el) =>
        el.classList.contains('lds-designer-header-center-wrap')
      );
      expect(isWrapped).toBe(true);
    });

    test('wrap state should toggle correctly when resizing small to large', async ({
      page,
    }) => {
      // Start narrow
      await page.setViewportSize({ width: 400, height: 800 });
      await page.waitForTimeout(100);

      let container = page.locator('.lds-designer-header-container');
      let isWrapped = await container.evaluate((el) =>
        el.classList.contains('lds-designer-header-center-wrap')
      );
      expect(isWrapped).toBe(true);

      // Expand to wide
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.waitForTimeout(100);

      isWrapped = await container.evaluate((el) =>
        el.classList.contains('lds-designer-header-center-wrap')
      );
      expect(isWrapped).toBe(false);
    });

    test('left and right should remain on first row when center wraps', async ({ page }) => {
      await page.setViewportSize({ width: 400, height: 800 });
      await page.waitForTimeout(100);

      const leftBox = await getBoundingBox(page, '.lds-designer-header-left-side');
      const rightBox = await getBoundingBox(page, '.lds-designer-header-right-side');

      // Left and right should be on the same row (similar Y coordinates)
      const yDifference = Math.abs(leftBox.y - rightBox.y);
      expect(yDifference).toBeLessThan(Math.max(leftBox.height, rightBox.height));
    });

    test('chip should stay on first row when center wraps', async ({ page }) => {
      await page.setViewportSize({ width: 400, height: 800 });
      await page.waitForTimeout(100);

      const container = page.locator('.lds-designer-header-container');
      const isWrapped = await container.evaluate((el) =>
        el.classList.contains('lds-designer-header-center-wrap')
      );
      expect(isWrapped).toBe(true);

      const titleBox = await getBoundingBox(page, 'lds-designer-header .lds-designer-header-title');
      const chipBox = await getBoundingBox(page, 'lds-designer-header .chip');
      const centerBox = await getBoundingBox(page, '.lds-designer-header-center-content');

      // Chip should be on the same row as the title (left area), not below it.
      const chipTitleYDiff = Math.abs(chipBox.y - titleBox.y);
      expect(chipTitleYDiff).toBeLessThan(Math.max(chipBox.height, titleBox.height));

      // Center section should be on a lower row than the chip/title row.
      expect(centerBox.y).toBeGreaterThan(chipBox.y);
    });
  });

  test.describe('Center Section Centering', () => {
    test('center section should be horizontally centered relative to content area', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.waitForTimeout(100);

      const containerBox = await getBoundingBox(page, '.lds-designer-header-container');
      const backBtnBox = await getBoundingBox(page, '.back-btn-container');
      const centerBox = await getBoundingBox(page, '.lds-designer-header-center-content');

      // The content area starts after the back button
      const contentAreaStart = backBtnBox.x + backBtnBox.width;
      const contentAreaWidth = containerBox.x + containerBox.width - contentAreaStart;
      const contentAreaCenterX = contentAreaStart + contentAreaWidth / 2;
      const sectionCenterX = centerBox.x + centerBox.width / 2;

      // Allow small tolerance for rounding
      expect(Math.abs(contentAreaCenterX - sectionCenterX)).toBeLessThan(5);
    });

    test('wrapped center section should be horizontally centered relative to content area', async ({ page }) => {
      await page.setViewportSize({ width: 400, height: 800 });
      await page.waitForTimeout(100);

      const containerBox = await getBoundingBox(page, '.lds-designer-header-container');
      const backBtnBox = await getBoundingBox(page, '.back-btn-container');
      const centerBox = await getBoundingBox(page, '.lds-designer-header-center-content');

      // The content area starts after the back button
      const contentAreaStart = backBtnBox.x + backBtnBox.width;
      const contentAreaWidth = containerBox.x + containerBox.width - contentAreaStart;
      const contentAreaCenterX = contentAreaStart + contentAreaWidth / 2;
      const sectionCenterX = centerBox.x + centerBox.width / 2;

      // Allow small tolerance for rounding
      expect(Math.abs(contentAreaCenterX - sectionCenterX)).toBeLessThan(5);
    });
  });

  test.describe('Chip Constraints', () => {
    test('chip should respect max-width of 280px', async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.waitForTimeout(100);

      const chipBox = await getBoundingBox(page, 'lds-designer-header .chip');

      expect(chipBox.width).toBeLessThanOrEqual(280);
    });

    test('chip should not shrink below min-width of 40px', async ({ page }) => {
      // Even at very narrow viewport, chip should maintain min-width
      await page.setViewportSize({ width: 320, height: 800 });
      await page.waitForTimeout(100);

      const chip = page.locator('lds-designer-header .chip');
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

      const chipText = page.locator('lds-designer-header .chip__text');

      // Check that ellipsis styles are applied
      const styles = await chipText.evaluate((el) => {
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

      const chipText = page.locator('lds-designer-header .chip__text');
      const chipTextBox = await chipText.boundingBox();
      const scrollWidth = await chipText.evaluate((el) => el.scrollWidth);

      // If content is truncated, scrollWidth should be greater than visible width
      if (chipTextBox && scrollWidth > chipTextBox.width) {
        // Text is truncated - this is expected for long text
        const chipBox = await getBoundingBox(page, 'lds-designer-header .chip');
        expect(chipBox.width).toBeLessThanOrEqual(280);
      }
    });

    test('chip should ellipsize long text (scrollWidth > clientWidth)', async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.waitForTimeout(100);

      const chipText = page.locator('lds-designer-header .chip__text');
      const metrics = await chipText.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
          textOverflow: style.textOverflow,
          overflow: style.overflow,
          whiteSpace: style.whiteSpace,
        };
      });

      expect(metrics.textOverflow).toBe('ellipsis');
      expect(metrics.overflow).toBe('hidden');
      expect(metrics.whiteSpace).toBe('nowrap');
      expect(metrics.scrollWidth).toBeGreaterThan(metrics.clientWidth);
    });

    test('chip should be contained within left section at wide viewport', async ({
      page,
    }) => {
      // At wide viewport, the chip should be fully visible within the left section
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.waitForTimeout(150);

      const leftBox = await getBoundingBox(page, '.lds-designer-header-left-side');
      const chipBox = await getBoundingBox(page, 'lds-designer-header .chip');

      // Chip should be geometrically contained inside the left section.
      expect(chipBox.x).toBeGreaterThanOrEqual(leftBox.x - 0.5);
      expect(chipBox.x + chipBox.width).toBeLessThanOrEqual(leftBox.x + leftBox.width + 0.5);
    });
  });

  test.describe('Title Truncation', () => {
    test('title should not be truncated at wide viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.waitForTimeout(100);

      const title = page.locator('lds-designer-header .lds-designer-header-title');
      const titleBox = await title.boundingBox();
      const titleScrollWidth = await title.evaluate((el) => el.scrollWidth);

      expect(titleBox).toBeTruthy();
      if (titleBox) {
        // If not truncated, intrinsic width fits within the rendered box.
        expect(titleScrollWidth).toBeLessThanOrEqual(titleBox.width + 1);
      }
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

      const backButton = page.locator('lds-designer-header .back-btn-container button');
      await backButton.click();

      // Wait a moment for console message
      await page.waitForTimeout(100);

      expect(consoleMessages).toContain('Back button clicked');
    });

    test('back button should have accessible aria-label', async ({ page }) => {
      const backButton = page.locator('lds-designer-header .back-btn-container button');
      const ariaLabel = await backButton.getAttribute('aria-label');

      expect(ariaLabel).toBe('back to previous page');
    });
  });

  test.describe('Layout Structure', () => {
    test('designer header should use CSS grid layout', async ({ page }) => {
      const container = page.locator('.lds-designer-header-container');
      const display = await container.evaluate((el) => window.getComputedStyle(el).display);

      expect(display).toBe('grid');
    });

    test('designer header should have proper min-height', async ({ page }) => {
      const container = page.locator('.lds-designer-header-container');
      const minHeight = await container.evaluate((el) => {
        return parseFloat(window.getComputedStyle(el).minHeight);
      });

      expect(minHeight).toBe(56);
    });

    test('designer header should have gap between sections', async ({ page }) => {
      const container = page.locator('.lds-designer-header-container');
      const gap = await container.evaluate((el) => {
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

        // Verify designer header is still visible and structured correctly
        const container = page.locator('.lds-designer-header-container');
        await expect(container).toBeVisible();

        const leftSection = page.locator('.lds-designer-header-left-side');
        const centerSection = page.locator('.lds-designer-header-center-content');
        const rightSection = page.locator('.lds-designer-header-right-side');

        await expect(leftSection).toBeVisible();
        await expect(centerSection).toBeVisible();
        await expect(rightSection).toBeVisible();

        // Verify no horizontal overflow
        const containerBox = await container.boundingBox();
        const leftBox = await leftSection.boundingBox();
        const rightBox = await rightSection.boundingBox();

        if (containerBox && leftBox && rightBox) {
          expect(leftBox.x).toBeGreaterThanOrEqual(containerBox.x);
          expect(rightBox.x + rightBox.width).toBeLessThanOrEqual(
            containerBox.x + containerBox.width + 1
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

        const isWrapped = await page.locator('.lds-designer-header-container').evaluate((el) =>
          el.classList.contains('lds-designer-header-center-wrap')
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
      let isWrapped = await page.locator('.lds-designer-header-container').evaluate((el) =>
        el.classList.contains('lds-designer-header-center-wrap')
      );
      expect(isWrapped).toBe(false);

      await page.setViewportSize({ width: wrapThreshold - 20, height: 800 });
      await page.waitForTimeout(100);
      isWrapped = await page.locator('.lds-designer-header-container').evaluate((el) =>
        el.classList.contains('lds-designer-header-center-wrap')
      );
      expect(isWrapped).toBe(true);
    });
  });

  test.describe('Visual Regression Prevention', () => {
    test('designer header height should increase when center wraps', async ({ page }) => {
      // Get height when not wrapped
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.waitForTimeout(100);
      const unwrappedBox = await getBoundingBox(page, '.lds-designer-header-container');
      const unwrappedHeight = unwrappedBox.height;

      // Get height when wrapped
      await page.setViewportSize({ width: 400, height: 800 });
      await page.waitForTimeout(100);
      const wrappedBox = await getBoundingBox(page, '.lds-designer-header-container');
      const wrappedHeight = wrappedBox.height;

      // Wrapped height should be greater (two rows)
      expect(wrappedHeight).toBeGreaterThan(unwrappedHeight);
    });

    test('right section should always be aligned to the right edge', async ({ page }) => {
      const viewportWidths = [1200, 800, 600, 400];

      for (const width of viewportWidths) {
        await page.setViewportSize({ width, height: 800 });
        await page.waitForTimeout(100);

        const containerBox = await getBoundingBox(page, '.lds-designer-header-container');
        const rightBox = await getBoundingBox(page, '.lds-designer-header-right-side');

        // Right section's right edge should be near container's right edge (accounting for padding)
        const rightEdgeDistance =
          containerBox.x + containerBox.width - (rightBox.x + rightBox.width);
        expect(rightEdgeDistance).toBeLessThanOrEqual(20); // Allow for padding
      }
    });

    test('left section should always be aligned to the left edge', async ({ page }) => {
      const viewportWidths = [1200, 800, 600, 400];

      for (const width of viewportWidths) {
        await page.setViewportSize({ width, height: 800 });
        await page.waitForTimeout(100);

        const containerBox = await getBoundingBox(page, '.lds-designer-header-container');
        const leftBox = await getBoundingBox(page, '.lds-designer-header-left-side');
        const backBtnBox = await getBoundingBox(page, '.back-btn-container');

        // Left section should be right after back button container
        const leftEdgeDistance = leftBox.x - (backBtnBox.x + backBtnBox.width);
        expect(leftEdgeDistance).toBeLessThanOrEqual(20); // Allow for gap/padding
      }
    });
  });
});
