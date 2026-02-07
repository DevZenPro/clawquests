

# Switch Body Font to DotGothic16

## What changes
Replace **Space Mono** with **DotGothic16** as the body font. DotGothic16 is a clean, readable pixel-style font from Google Fonts that keeps the retro 8-bit feel without sacrificing legibility. Headers stay as **Press Start 2P**.

## Technical details

**Files to update:**

1. **index.html** -- Swap the Google Fonts import from `Space+Mono` to `DotGothic16`
2. **tailwind.config.ts** -- Update the `body` font family from `"Space Mono"` to `"DotGothic16"`
3. **src/index.css** -- Bump body font size to `18px` since DotGothic16 renders slightly smaller, and set `letter-spacing: 0.03em` for extra clarity

No other files need changes since all body text already uses the `font-body` Tailwind class.

