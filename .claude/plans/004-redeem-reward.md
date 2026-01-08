# Issue #4: Redeem a Reward

## Overview

Allow users to redeem rewards using their points with pessimistic locking to
prevent race conditions.

## Commits Plan

**IMPORTANT: Create commits immediately after completing each step below.
Do NOT wait until all work is done.**

### 1. Add Redemption model with migration

**Files:**

- `api/db/migrate/[timestamp]_create_redemptions.rb`
- `api/app/models/redemption.rb`
- `api/app/models/user.rb` (add `has_many :redemptions`)
- `api/app/models/reward.rb` (add `has_many :redemptions`)
- `api/test/models/redemption_test.rb`
- `api/test/fixtures/redemptions.yml`

**Migration:**

```ruby
create_table :redemptions do |t|
  t.references :user, null: false, foreign_key: true
  t.references :reward, null: false, foreign_key: true
  t.integer :points_spent, null: false
  t.datetime :redeemed_at, null: false
  t.timestamps
end
add_index :redemptions, [:user_id, :redeemed_at]
```

---

### 2. Add RedemptionService with pessimistic locking

**Files:**

- `api/app/services/redemption_service.rb`
- `api/test/services/redemption_service_test.rb`

**Key implementation:**

```ruby
class RedemptionService
  class InsufficientPointsError < StandardError; end
  class RewardUnavailableError < StandardError; end

  def self.redeem(user_id:, reward_id:)
    new(user_id:, reward_id:).redeem
  end

  def redeem
    ActiveRecord::Base.transaction do
      user = User.lock.find(@user_id)  # Pessimistic lock
      reward = Reward.find(@reward_id)

      raise RewardUnavailableError unless reward.available
      raise InsufficientPointsError if user.points_balance < reward.points_cost

      user.update!(points_balance: user.points_balance - reward.points_cost)
      Redemption.create!(
        user:, reward:, points_spent: reward.points_cost, redeemed_at: Time.current
      )
    end
  end
end
```

**Tests:** Success case, insufficient points, unavailable reward, concurrent
requests.

---

### 3. Add POST /api/v1/redemptions endpoint

**Files:**

- `api/app/controllers/api/v1/redemptions_controller.rb`
- `api/app/serializers/redemption_resource.rb`
- `api/config/routes.rb`
- `api/test/controllers/api/v1/redemptions_controller_test.rb`

**Request:** `POST /api/v1/redemptions` with `{ "reward_id": 1 }`

**Response:** Redemption JSON with reward nested, or error with appropriate
status.

---

### 4. Add post method to API client

**Files:**

- `web/src/services/api.ts`

Add `post<T, D>(path, data)` method following the existing `get` pattern.

---

### 5. Add Redemption types and Redux slice

**Files:**

- `web/src/types/redemption.ts`
- `web/src/store/redemptionSlice.ts`
- `web/src/store/index.ts`

**Thunk:** `redeemReward(rewardId)` - calls API, then dispatches
`fetchCurrentUser()` to refresh balance.

---

### 6. Add Modal component

**Files:**

- `web/src/components/ui/Modal.tsx`
- `web/src/components/ui/Modal.module.css`
- `web/src/components/ui/Modal.test.tsx`

Reusable modal with: overlay, centered content, ESC to close, click-outside
to close.

---

### 7. Add RedeemButton component

**Files:**

- `web/src/components/rewards/RedeemButton.tsx`
- `web/src/components/rewards/RedeemButton.module.css`
- `web/src/components/rewards/RedeemButton.test.tsx`

Shows: "Redeem" (enabled), "Unavailable" (disabled), "Not Enough Points"
(disabled).

---

### 8. Add RedemptionConfirmModal component

**Files:**

- `web/src/components/rewards/RedemptionConfirmModal.tsx`
- `web/src/components/rewards/RedemptionConfirmModal.module.css`
- `web/src/components/rewards/RedemptionConfirmModal.test.tsx`

Shows: reward name, cost, balance after, error message, Confirm/Cancel
buttons, loading state.

---

### 9. Integrate RedeemButton and Modal into RewardCard

**Files:**

- `web/src/components/rewards/RewardCard.tsx`
- `web/src/components/rewards/RewardCard.module.css`
- `web/src/components/rewards/RewardCard.test.tsx`

Add state for modal visibility, connect to Redux for user points and
redemption state.

---

## Verification

1. **Backend tests:** `cd api && bin/rails test`
2. **Frontend tests:** `cd web && bun test`
3. **Pre-commit hooks:** `pre-commit run --all-files`
4. **Manual testing:**
   - Load rewards list, verify RedeemButton appears on each card
   - Click Redeem on affordable reward, confirm modal opens
   - Confirm redemption, verify points balance updates
   - Try redeeming with insufficient points, verify button disabled
   - Try redeeming unavailable reward, verify button shows "Unavailable"
