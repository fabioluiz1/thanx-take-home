# Plan: Redemption History (#5)

## Summary

Add redemption history feature allowing users to view past redemptions with
reward details, points spent, and dates.

## Commits Plan

**IMPORTANT: Create commits immediately after completing each step below.
Do NOT wait until all work is done.**

### 1. Backend: Add index action to RedemptionsController with tests

**Files:**

- `api/app/controllers/api/v1/redemptions_controller.rb` - Add `index` action
- `api/config/routes.rb` - Add `:index` to redemptions resource
- `api/test/controllers/api/v1/redemptions_controller_test.rb` - Add tests

**Implementation:**

```ruby
# RedemptionsController#index
def index
  redemptions = current_user.redemptions
                            .includes(:reward)
                            .order(redeemed_at: :desc)
  render json: RedemptionResource.new(redemptions).serializable_hash
end
```

**Tests:**

- Returns user's redemptions in reverse chronological order
- Scopes to current user (doesn't return other users' redemptions)
- Eager loads rewards (verify with SQL count in tests)
- Returns empty array when no redemptions

---

### 2. Frontend: Add React Router with history route

**Files:**

- `web/package.json` - Add react-router-dom dependency
- `web/src/main.tsx` - Add BrowserRouter provider
- `web/src/App.tsx` - Add Routes with `/` and `/history` paths
- `web/src/components/navigation/Navigation.tsx` - New component
- `web/src/components/navigation/Navigation.module.css` - Styles
- `web/src/App.test.tsx` - Update for router

**Implementation:**

- Install: `bun add react-router-dom`
- Wrap app in `BrowserRouter`
- Create `Navigation` with links to Rewards and History
- Add routes: `/` (RewardsList), `/history` (RedemptionHistory placeholder)

---

### 3. Frontend: Add redemptions history slice and async thunk

**Files:**

- `web/src/types/redemption.ts` - Add `RedemptionHistoryState`
- `web/src/store/redemptionHistorySlice.ts` - New slice with fetchHistory
- `web/src/store/index.ts` - Register new slice
- `web/src/hooks/useRedemptionHistory.ts` - New hook

**Implementation:**

```typescript
// State structure
interface RedemptionHistoryState {
  redemptions: Redemption[];
  loading: boolean;
  error: string | null;
  fetched: boolean;
}

// Async thunk
fetchRedemptionHistory -> GET /api/v1/redemptions
```

---

### 4. Frontend: Add RedemptionHistory page component with tests

**Files:**

- `web/src/components/redemptions/RedemptionHistory.tsx` - Page component
- `web/src/components/redemptions/RedemptionHistory.module.css` - Styles
- `web/src/components/redemptions/RedemptionHistory.test.tsx` - Tests

**Implementation:**

- Page layout similar to RewardsList
- Uses `useRedemptionHistory` hook
- Shows loading skeletons, error state, empty state
- Renders list of RedemptionItem components

**Tests:**

- Loading state shows skeletons
- Error state shows error message
- Empty state shows "no redemptions yet" message
- Renders redemption items when data exists

---

### 5. Frontend: Add RedemptionItem component with tests

**Files:**

- `web/src/components/redemptions/RedemptionItem.tsx` - Individual item
- `web/src/components/redemptions/RedemptionItem.module.css` - Styles
- `web/src/components/redemptions/RedemptionItem.test.tsx` - Tests
- `web/src/components/redemptions/RedemptionItemSkeleton.tsx` - Loading skeleton

**Implementation:**

- Card-style display with reward image
- Shows: reward name, points spent, formatted date
- Date format: human-readable (e.g., "Jan 8, 2026")

**Tests:**

- Renders reward name, points, date
- Handles missing image gracefully
- Formats numbers with locale (1,500 pts)

---

### 6. Integration: Wire up RedemptionHistory to App routing

**Files:**

- `web/src/App.tsx` - Import and add RedemptionHistory route

**Implementation:**

- Replace placeholder with actual RedemptionHistory component
- Test navigation flow manually

---

## Verification

1. **Backend tests:** `cd api && bin/rails test`
2. **Frontend tests:** `cd web && bun test`
3. **Manual testing:**
   - Navigate to `/history` - should show empty state
   - Redeem a reward on home page
   - Navigate to `/history` - should show redemption
   - Verify points spent and date display correctly
4. **Pre-commit hooks:** `pre-commit run --all-files`

## Technical Notes

- RedemptionResource already includes nested `reward` via Alba's `one` helper
- Eager loading with `includes(:reward)` prevents N+1 queries
- Keep redemptionSlice separate from new redemptionHistorySlice (different
  concerns: one handles single redemption action, other handles history list)
