# Plan: Browse Available Rewards

Issue: #3

## Summary

Allow users to browse available rewards with name, description, points cost, and
availability status. Includes backend model/API and frontend components with
skeleton loading states. UI is responsive (mobile to desktop with breakpoints).

## Commits Plan

**IMPORTANT: Create commits immediately after completing each step below.
Do NOT wait until all work is done.**

### 1. `feat(#3): Add Reward model with points cost`

Backend model and migration:

- `api/db/migrate/TIMESTAMP_create_rewards.rb`
  - name (string, null: false)
  - description (text)
  - points_cost (integer, null: false)
  - image_url (string)
  - available (boolean, null: false, default: true)
  - Index on available and points_cost
- `api/app/models/reward.rb`
  - Validations: name presence, points_cost > 0, available inclusion
  - Scope: `available` for filtering
- `api/test/models/reward_test.rb`
- `api/test/fixtures/rewards.yml`

### 2. `feat(#3): Add rewards API endpoint with Alba serializer`

API endpoint returning available rewards:

- `api/app/serializers/reward_resource.rb` - Alba serializer
- `api/app/controllers/api/v1/rewards_controller.rb` - index action
- `api/config/routes.rb` - add resources :rewards
- `api/test/controllers/api/v1/rewards_controller_test.rb`

### 3. `feat(#3): Add demo rewards seed data`

Seed data with variety of rewards:

- `api/db/seeds.rb` - Add 7 demo rewards with varied costs and availability

### 4. `feat(#3): Add Redux rewards slice with async thunk`

Frontend state management:

- `web/src/types/reward.ts` - Reward and RewardsState interfaces
- `web/src/store/rewardsSlice.ts` - fetchRewards thunk, state handling
- `web/src/store/index.ts` - Add rewards reducer

### 5. `feat(#3): Add useRewards custom hook`

Hook for component consumption:

- `web/src/hooks/useRewards.ts`
- `web/src/hooks/useRewards.test.ts`

### 6. `feat(#3): Add RewardCardSkeleton component`

Skeleton loading state matching RewardCard layout:

- `web/src/components/rewards/RewardCardSkeleton.tsx`
  - Image placeholder
  - Title bar placeholder
  - 2 description line placeholders
  - Points badge placeholder
  - CSS animation for shimmer effect
- `web/src/components/rewards/RewardCardSkeleton.test.tsx`

### 7. `feat(#3): Add RewardCard component with out-of-stock indicator`

Individual reward display:

- `web/src/components/rewards/RewardCard.tsx`
- `web/src/components/rewards/RewardCard.test.tsx`

### 8. `feat(#3): Add RewardsList component with states`

Responsive grid layout with skeleton/error/empty states:

- `web/src/components/rewards/RewardsList.tsx`
  - Responsive CSS Grid (1 col mobile, 2 col tablet, 3 col desktop)
  - Shows grid of RewardCardSkeleton during loading
  - Error state with message
  - Empty state when no rewards
  - Grid of RewardCard when loaded
- `web/src/components/rewards/RewardsList.test.tsx`
- `web/src/App.tsx` - Integrate RewardsList

## Verification

1. Backend:
   - `cd api && bin/rails db:migrate && bin/rails db:seed`
   - `bin/rails test`
   - `curl http://localhost:3000/api/v1/rewards`

2. Frontend:
   - `cd web && bun run test`
   - `bun run dev` - verify UI shows skeleton then rewards grid

3. Pre-commit: `pre-commit run --all-files`
