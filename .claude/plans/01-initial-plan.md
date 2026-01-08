# Take-Home Assessment Plan: Rewards Redemption App

## Repository

<https://github.com/fabioluiz1/thanx-take-home>

## Implementation Order

| Order | Issue | Feature | Key Deliverables |
|-------|-------|---------|------------------|
| ✅ | #1 | Initial Setup | Rails API, React, Terraform, CI/CD |
| 1 | #2 | User Points Balance | User model, auth, Redux store, API client |
| 2 | #3 | Browse Rewards | Reward model, rewards list/card UI |
| 3 | #4 | Redeem a Reward | Redemption model, service with locking, modal |
| 4 | #5 | Redemption History | History page, routing, empty states |
| 5 | #6 | Documentation | README, API docs, architecture |

Each PR = complete vertical slice (model → migration → controller → frontend → tests).

---

## Directory Structure

### Backend (Rails 8 API)

```text
api/
├── app/
│   ├── controllers/
│   │   └── api/v1/
│   │       ├── users_controller.rb      # GET /me
│   │       ├── rewards_controller.rb    # GET /rewards
│   │       └── redemptions_controller.rb # GET/POST /redemptions
│   ├── models/
│   │   ├── user.rb
│   │   ├── reward.rb
│   │   └── redemption.rb
│   ├── services/
│   │   └── redemption_service.rb        # Transaction + locking logic
│   └── serializers/
│       ├── user_resource.rb
│       ├── reward_resource.rb
│       └── redemption_resource.rb
├── db/
│   └── migrate/
│       ├── create_users.rb              # email, points_balance + indexes
│       ├── create_rewards.rb            # name, points_cost, etc + indexes
│       └── create_redemptions.rb        # user_id, reward_id + compound index
└── test/
    ├── models/                          # Model validations
    ├── requests/                        # Request specs
    └── services/                        # Service edge cases
```

### Frontend (React + TypeScript)

```text
web/src/
├── components/
│   ├── common/                          # Reusable UI components
│   │   ├── LoadingSpinner/
│   │   ├── ErrorMessage/
│   │   └── Modal/
│   ├── rewards/                         # Feature-specific
│   │   ├── RewardsList.tsx
│   │   ├── RewardCard.tsx
│   │   └── RedeemButton.tsx
│   ├── user/
│   │   └── PointsBalance.tsx
│   └── history/
│       └── RedemptionHistory.tsx
├── hooks/
│   ├── useUser.ts
│   ├── useRewards.ts
│   └── useRedemptions.ts
├── store/                               # Redux Toolkit
│   ├── index.ts
│   ├── userSlice.ts
│   ├── rewardsSlice.ts
│   └── redemptionsSlice.ts
├── services/
│   └── api.ts                           # Centralized API client
├── pages/
│   ├── RewardsPage.tsx
│   └── HistoryPage.tsx
└── App.tsx
```

---

## Database Schema

```ruby
# users
t.string :email, null: false
t.integer :points_balance, null: false, default: 0
add_index :users, :email, unique: true

# rewards
t.string :name, null: false
t.text :description
t.integer :points_cost, null: false
t.string :image_url
t.boolean :available, null: false, default: true
add_index :rewards, :points_cost
add_index :rewards, :available

# redemptions
t.references :user, null: false, foreign_key: true
t.references :reward, null: false, foreign_key: true
t.integer :points_spent, null: false
t.datetime :redeemed_at, null: false
add_index :redemptions, [:user_id, :redeemed_at]  # compound index
```

---

## RedemptionService (Critical)

```ruby
# app/services/redemption_service.rb
class RedemptionService
  def initialize(user:, reward:)
    @user = user
    @reward = reward
  end

  def call
    User.transaction do
      # Pessimistic lock to prevent race conditions
      locked_user = User.lock.find(@user.id)

      return failure(:insufficient_points) if locked_user.points_balance < @reward.points_cost
      return failure(:reward_unavailable) unless @reward.available?

      locked_user.decrement!(:points_balance, @reward.points_cost)

      redemption = Redemption.create!(
        user: locked_user,
        reward: @reward,
        points_spent: @reward.points_cost,
        redeemed_at: Time.current
      )

      success(redemption, locked_user.points_balance)
    end
  rescue ActiveRecord::RecordInvalid => e
    failure(:validation_error, e.message)
  end

  private

  def success(redemption, new_balance)
    { success: true, redemption: redemption, new_balance: new_balance }
  end

  def failure(error, message = nil)
    { success: false, error: error, message: message }
  end
end
```

---

## Technical Decisions

| Decision | Choice |
|----------|--------|
| Database | PostgreSQL |
| Auth | Simple demo auth (see below) |
| Serializers | Alba (fast, modern PORO pattern) |
| State Management | Redux Toolkit |
| Styling | CSS Modules (scoped, no framework) |

### Alba Serializers

```ruby
# app/serializers/user_resource.rb
class UserResource
  include Alba::Resource

  attributes :id, :email, :points_balance
end

# app/serializers/reward_resource.rb
class RewardResource
  include Alba::Resource

  attributes :id, :name, :description, :points_cost, :image_url, :available
end

# app/serializers/redemption_resource.rb
class RedemptionResource
  include Alba::Resource

  attributes :id, :points_spent, :redeemed_at
  one :reward, resource: RewardResource
end

# Usage in controller
render json: UserResource.new(@user).serialize
```

### Authentication Approach

**Demo auth** - simplified for quick testing:

1. Seed a demo user in the database
2. API expects `X-User-Id` header
3. Frontend stores user ID in localStorage
4. Document: "In production, this would use Auth0/Clerk for OAuth + magic links"

**Backend:**

```ruby
# app/controllers/application_controller.rb
def current_user
  @current_user ||= User.find_by(id: request.headers["X-User-Id"]) || User.first
end
```

**Frontend:**

```tsx
// services/api.ts
const getUserId = () => localStorage.getItem('userId') || '1';

const apiClient = {
  async get<T>(path: string): Promise<T> {
    const response = await fetch(`/api/v1${path}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': getUserId(),
      },
    });
    if (!response.ok) throw new Error(response.statusText);
    return response.json();
  },
  // post, delete, etc.
};

// On app load, set demo user ID
if (!localStorage.getItem('userId')) {
  localStorage.setItem('userId', '1');  // Demo user from seed
}
```

### README "How to Test" Section (Required)

```text
## How to Test

### Authentication Note

Authentication is simplified for this demo. In production, this would use
Auth0 or Clerk for OAuth (Google) and magic link authentication.

The app uses a seeded demo user for quick testing.

### Quick Start

1. Start the application:
   docker-compose up

2. Seed the database with a demo user:
   docker-compose exec api rails db:seed

   This creates:
   - Demo user: demo@example.com with 1000 points
   - Sample rewards with various point costs

3. Open http://localhost:3000 to use the app

The demo user is automatically loaded - no login required.
```

---

## Verification Checklist

Before submitting:

- [ ] `cd api && rails test` - All passing
- [ ] `cd web && npm test` - All passing
- [ ] `pre-commit run --all-files` - All passing
- [ ] App runs with `docker-compose up`
- [ ] Can view points balance
- [ ] Can browse rewards (loading spinner visible)
- [ ] Can redeem reward (confirmation modal, not alert)
- [ ] Points update immediately after redemption
- [ ] Can view redemption history
- [ ] Insufficient points shows clear error
- [ ] Out-of-stock rewards are disabled
- [ ] README has clear setup instructions
