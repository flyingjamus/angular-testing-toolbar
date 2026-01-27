# Requirements

## Topbar layout

- The topbar has three logical regions: `left`, `center`, `right`.
- In the default (single-row) layout:
  - `left` is aligned to the start (left edge).
  - `right` is aligned to the end (right edge).
  - `center` is horizontally centered in the topbar (centered relative to the full topbar width, not merely “between” left and right).
- When there is not enough horizontal space to keep all three regions on one row:
  - Only the `center` region moves to a second row.
  - `left` and `right` remain on the first row.
  - The second-row `center` remains horizontally centered.
- The wrap/unwrap behavior must respond in both directions (large→small and small→large) during resizing.

## Left content truncation (chip)

- The left projected “chip” content must:
  - Shrink as horizontal space decreases.
  - Display an ellipsis when its text does not fit.
  - Never shrink below its minimum width.

## Text truncation (title)

- The title must truncate with ellipsis when constrained, without breaking the overall layout.

## Testing requirements

- Unit tests must not rely on real browser layout/flow (e.g., `getBoundingClientRect()` producing meaningful geometry in JSDOM).
- Unit tests must validate wrap/unwrap decisions deterministically using mocked measurements and/or pure decision logic.
