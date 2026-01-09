# Plan 012: Implement Thanx Brand Theme

## Overview

Transform the rewards app to match Thanx brand identity by creating a centralized
theme system using CSS custom properties and updating all components to use Thanx
colors, typography, and design patterns.

## Brand Identity (from screenshot)

- **Primary Brand**: Teal `#11C0BF` (logo, accents)
- **Background**: Dark Teal `#2C5F5F` (app background)
- **Cards**: White `#FFFFFF` with shadows
- **Primary Action**: Blue `#3B82F6` (buttons)
- **Text on White**: Charcoal `#343538`
- **Secondary Text**: Gray `#6B7280`

## Current State

- CSS Modules with component-scoped styles
- Colors hardcoded across 10+ CSS files
- No centralized theme or CSS variables
- Blue (#2563eb) and gray palette needs replacement

## Commits Plan

**IMPORTANT: Create commits immediately after completing each step below. Do NOT
wait until all work is done.**

### 1. Create centralized theme system

Create `web/src/styles/theme.css` with CSS custom properties for:

- Colors (brand, backgrounds, text, actions, status, borders)
- Spacing (xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px)
- Typography (font family, sizes, weights)
- Effects (border radius, shadows, transitions)

Commit: `feat(#12): Create CSS theme with color and spacing variables`

### 2. Create global styles

Create `web/src/styles/global.css` with:

- Body styling (dark teal background, white text)
- Font family and base styles
- Root element styling

Import both theme files in `web/src/main.tsx`

Commit: `feat(#12): Add global styles and import theme`

### 3. Create Thanx logo component

Create `web/src/components/branding/ThanxLogo.tsx` as an SVG-based component
displaying "Thanx" wordmark in teal (#11C0BF).

Create `web/src/components/branding/ThanxLogo.module.css` with logo styling.

Commit: `feat(#12): Create Thanx logo component`

### 4. Update navigation styling

Update `web/src/components/navigation/Navigation.tsx` to include Thanx logo.

Update `web/src/components/navigation/Navigation.module.css`:

- Background: dark teal background color variable
- Active link: teal brand color
- Text: white
- Proper spacing with logo

Commit: `feat(#12): Update navigation with Thanx branding`

### 5. Update reward cards and containers

Update the following CSS modules to use theme variables:

- `web/src/components/rewards/RewardCard.module.css`
- `web/src/components/rewards/RewardsList.module.css`
- `web/src/components/rewards/RewardCardSkeleton.module.css`
- `web/src/components/rewards/RedeemButton.module.css`

Changes:

- Card backgrounds: white
- Text colors: use text color variables
- Buttons: blue action color
- Borders: use border color variable
- Shadows: use shadow variable

Commit: `feat(#12): Update reward cards to use theme colors`

### 6. Update redemption components

Update the following CSS modules:

- `web/src/components/redemptions/RedemptionHistory.module.css`
- `web/src/components/redemptions/RedemptionItemSkeleton.module.css`
- `web/src/components/rewards/RedemptionConfirmModal.module.css`

Changes:

- Background colors
- Text colors
- Button colors
- Shadows

Commit: `feat(#12): Update redemption components with theme`

### 7. Update UI components

Update:

- `web/src/components/ui/Modal.module.css` (white background, dark overlay)

Commit: `feat(#12): Update modal component with theme`

### 8. Update app container styling

Update `web/src/App.tsx` or create `web/src/App.module.css` with:

- Dark teal background applied to app root
- Proper layout and spacing

Commit: `feat(#12): Add app container styling with dark background`

### 9. Build and test

Run:

- `docker-compose build --no-cache web`
- `docker-compose up -d web`
- Visual verification at [http://localhost:3000](http://localhost:3000)
- Component tests: `cd web && bun test`

Commit if tests pass: `test(#12): Verify theme implementation with visual and unit tests`

## Critical Files

### New Files

1. `web/src/styles/theme.css` - CSS variables (colors, spacing, typography)
2. `web/src/styles/global.css` - Global body and base styles
3. `web/src/components/branding/ThanxLogo.tsx` - Logo component
4. `web/src/components/branding/ThanxLogo.module.css` - Logo styles

### Files to Update

1. `web/src/main.tsx` - Import theme and global CSS
2. `web/src/components/navigation/Navigation.tsx` - Include logo
3. `web/src/components/navigation/Navigation.module.css` - Dark theme
4. `web/src/components/rewards/RewardCard.module.css`
5. `web/src/components/rewards/RewardCardSkeleton.module.css`
6. `web/src/components/rewards/RewardsList.module.css`
7. `web/src/components/rewards/RedeemButton.module.css`
8. `web/src/components/rewards/RedemptionConfirmModal.module.css`
9. `web/src/components/redemptions/RedemptionHistory.module.css`
10. `web/src/components/redemptions/RedemptionItemSkeleton.module.css`
11. `web/src/components/ui/Modal.module.css`
12. `web/src/App.tsx` or create `web/src/App.module.css`

## Verification

### Visual Testing

1. Start dev server: `docker-compose up -d`
2. Navigate to [http://localhost:3000](http://localhost:3000)
3. Verify:
   - ✅ Dark teal background throughout
   - ✅ Thanx logo in navigation
   - ✅ White cards with proper shadows
   - ✅ Blue action buttons
   - ✅ Teal accents
   - ✅ Proper spacing and typography

### Automated Testing

```bash
cd web && bun test
```

All tests should pass without changes to test files.

### Browser Compatibility

Test in modern browsers to ensure CSS variables work.
