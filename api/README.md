# API Backend (Rails 8)

The rewards API is built with Ruby on Rails 8 in API-only mode. It provides a JSON
REST API for managing users, rewards, and redemptions.

## Quick Start

### Using Docker (Recommended)

```bash
# Start the API with dependencies
docker-compose up api

# In another terminal, seed the database
docker-compose exec api bin/rails db:seed
```

API runs at `http://localhost:3001`

### Local Development

```bash
# Install Ruby (use mise)
mise install

# Install dependencies
cd api
bundle install

# Setup database
bin/rails db:create db:migrate db:seed

# Start server
bin/rails server -p 3001
```

## Architecture Overview

### Design Pattern: Service Objects

Business logic lives in service objects, not controllers. This enables:

- **Testability:** Service logic tested independently from HTTP
- **Reusability:** Services callable from controllers, jobs, or console
- **Clarity:** Clear separation of concerns

**Example:** `app/services/redemption_service.rb`

- Wraps redemption logic with validation
- Uses pessimistic locking for concurrency safety
- Raises custom errors (`InsufficientPointsError`, `RewardUnavailableError`)

Controllers are thin, delegating business logic to services:

```ruby
class Api::V1::RedemptionsController < ApplicationController

  def create
    redemption = RedemptionService.redeem(
      user_id: current_user.id,
      reward_id: params[:reward_id]
    )
    render json: RedemptionResource.new(redemption).serialize
  rescue RedemptionService::InsufficientPointsError
    render json: { error: "Insufficient points" }, status: :unprocessable_entity
  end
end
```

### Pessimistic Locking

Prevents race conditions where two concurrent redemptions could both succeed with
insufficient balance:

```ruby
ActiveRecord::Base.transaction do
  user = User.lock.find(@user_id)  # Acquire exclusive lock
  # ... validate, update
end
```

**Why:** Guarantees accuracy for money-like operations. Two redeems will never both
succeed if insufficient balance. Database enforces this at the row level.

### Serialization with Alba

Alba converts models to JSON without rendering views (Rails template layer):

```ruby
# Serializer: app/serializers/reward_resource.rb
class RewardResource
  include Alba::Resource

  root_key :reward, :rewards
  attributes :id, :name, :description, :image_url, :points_cost, :available
  attribute :created_at, &:iso8601
end

# Controller: one-liner renders JSON
render json: RewardResource.new(reward).serialize
```

## API Endpoints

### Quick Reference

```text
GET    /api/v1/users/me                 # Current user details + balance
GET    /api/v1/rewards                  # List available rewards
POST   /api/v1/redemptions              # Redeem a reward
GET    /api/v1/redemptions              # Redemption history
```

### Full Endpoint Documentation

See [`/docs/api.md`](/docs/api.md) for complete request/response examples,
error codes, and data models.

## Database and Migrations

### Create / Reset

```bash
bin/rails db:create              # Create database
bin/rails db:migrate             # Run migrations
bin/rails db:seed                # Load seed data
bin/rails db:reset               # Drop + create + migrate + seed
```

### Examine Schema

```bash
# View current schema
cat db/schema.rb

# View all tables
bin/rails db:schema:dump

# Rollback last migration
bin/rails db:rollback
```

### Create New Migration

```bash
# Generate migration
bin/rails generate migration AddPhoneToUsers phone:string

# Edit and run
bin/rails db:migrate
```

### Seed Data

Edit `db/seeds.rb` to customize demo data:

```ruby
# Demo user
User.find_or_create_by!(email: "demo@example.com") do |user|
  user.points_balance = 500
end

# Demo rewards
Reward.find_or_create_by!(name: "Coffee") do |reward|
  reward.points_cost = 100
  reward.available = true
end
```

Run seeds:

```bash
bin/rails db:seed         # Load seeds
bin/rails db:seed:replant # Drop all data, then load seeds
```

## Testing

### Run All Tests

```bash
cd api && bin/rails test
```

### Run Specific Tests

```bash
# Single file
bin/rails test test/models/user_test.rb

# Single test by line
bin/rails test test/models/user_test.rb:15

# By pattern (file or test name)
bin/rails test --name test_redeem
```

### Test Structure

**Model tests:** `test/models/`

```ruby
class UserTest < ActiveSupport::TestCase
  test "has positive balance" do
    user = User.create!(points_balance: 100)
    assert user.points_balance.positive?
  end
end
```

**Service tests:** `test/services/`

```ruby
class RedemptionServiceTest < ActiveSupport::TestCase
  test "raises on insufficient points" do
    user = User.create!(points_balance: 50)
    reward = Reward.create!(points_cost: 100)

    assert_raises(RedemptionService::InsufficientPointsError) do
      RedemptionService.redeem(user_id: user.id, reward_id: reward.id)
    end
  end
end
```

**Controller tests:** `test/controllers/api/v1/`

```ruby
class Api::V1::RewardsControllerTest < ActionDispatch::IntegrationTest
  test "lists available rewards" do
    Reward.create!(name: "Coffee", points_cost: 100, available: true)

    get api_v1_rewards_url
    assert_response :success
    body = JSON.parse(response.body)
    assert_equal 1, body.length
  end
end
```

## Code Quality

### RuboCop (Style Enforcement)

```bash
# Check style
bundle exec rubocop

# Auto-fix issues
bundle exec rubocop -A

# Specific file
bundle exec rubocop app/models/user.rb
```

Uses **Rails Omakase** (Shopify's Rails style guide):

- Configured in `.rubocop.yml`
- Enforced on every commit via pre-commit hooks

### Pre-commit Hooks

Installed automatically. Run before commit:

```bash
# Run all hooks manually
pre-commit run --all-files

# Run specific hook
pre-commit run rubocop --all-files
pre-commit run hadolint-docker --all-files
```

## Services

### RedemptionService

Located: `app/services/redemption_service.rb`

Encapsulates redemption business logic with validation and concurrency safety:

```ruby
class RedemptionService
  class InsufficientPointsError < StandardError; end
  class RewardUnavailableError < StandardError; end

  def self.redeem(user_id:, reward_id:)
    new(user_id:, reward_id:).redeem
  end

  def redeem
    ActiveRecord::Base.transaction do
      user = User.lock.find(@user_id)           # Pessimistic lock
      reward = Reward.find(@reward_id)

      raise RewardUnavailableError unless reward.available
      raise InsufficientPointsError if user.points_balance < reward.points_cost

      user.update!(points_balance: user.points_balance - reward.points_cost)
      Redemption.create!(
        user: user,
        reward: reward,
        points_spent: reward.points_cost,
        redeemed_at: Time.current
      )
    end
  end
end
```

**Usage:**

```ruby
redemption = RedemptionService.redeem(user_id: 1, reward_id: 5)
# => <Redemption id=42, user_id=1, reward_id=5, points_spent=100>
```

**Error Handling:**

```ruby
begin
  RedemptionService.redeem(user_id: 1, reward_id: 99)
rescue RedemptionService::RewardUnavailableError
  # Reward not available
rescue RedemptionService::InsufficientPointsError
  # User doesn't have enough points
end
```

## Error Handling

### Sentry Integration

Uncaught exceptions automatically logged to Sentry:

```ruby
# Sentry captures this automatically
def some_action
  risky_operation  # Raises error → Sentry captures it
end

# Manual capture with context
begin
  operation
rescue => e
  Sentry.capture_exception(e, extra: { redemption_id: 123 })
end
```

**Context tags** added automatically via `SentryContext` concern:

```ruby
module SentryContext
  extend ActiveSupport::Concern
  included do
    before_action :set_sentry_context
  end

  private
  def set_sentry_context
    Sentry.set_tags(request_id: request.request_id)
    Sentry.set_user(id: current_user.id) if current_user
  end
end
```

### API Error Responses

Controllers return JSON errors:

```ruby
render json: { error: "Message" }, status: :unprocessable_entity
```

Status codes:

- `400` - Invalid request (validation error)
- `401` - Unauthorized (missing/invalid auth)
- `404` - Not found
- `422` - Unprocessable (e.g., insufficient points)
- `500` - Server error (see Sentry)

## Configuration

### Environment Variables

Create `.env` file in `api/` directory:

```bash
# Sentry (optional for local development)
SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=
```

**Production:** Set in AWS Parameter Store (via Terraform)

### Database Configuration

```yaml
# config/database.yml
development:
  database: rewards_development
  host: localhost
  username: postgres
  password: # Empty for local

test:
  database: rewards_test
```

Via `docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: rewards_development
      POSTGRES_PASSWORD: password
```

## Authentication

### Demo Authentication (Header-based)

For testing without login flows:

```ruby
# Extract user from X-User-Id header
def current_user
  @current_user ||= User.find_by(id: request.headers["X-User-Id"]) || User.first
end
```

**Test it:**

```bash
curl http://localhost:3001/api/v1/users/me \
  -H "X-User-Id: 1"
```

**Production:** Replace with JWT or OAuth (see `/docs/api.md` for implementation notes)

## Deployment

See [/docs/deployment.md](/docs/deployment.md) for:

- Docker image building
- AWS ECS Fargate deployment
- Database migrations in production
- Monitoring and logs

Terraform infrastructure: [/terraform/README.md](/terraform/README.md)

## Common Development Tasks

### Add a New API Endpoint

1. **Create controller:** `app/controllers/api/v1/things_controller.rb`

   ```ruby
   class Api::V1::ThingsController < ApplicationController
     def index
       things = Thing.all
       render json: ThingResource.new(things).serialize
     end
   end
   ```

2. **Create serializer:** `app/serializers/thing_resource.rb`

   ```ruby
   class ThingResource
     include Alba::Resource
     root_key :thing, :things
     attributes :id, :name, :created_at
   end
   ```

3. **Add route:** `config/routes.rb`

   ```ruby
   resources :things, only: [:index]
   ```

4. **Write tests:** `test/controllers/api/v1/things_controller_test.rb`

### Add a Service Object

1. **Create file:** `app/services/thing_service.rb`

   ```ruby
   class ThingService
     def self.process(thing_id:)
       new(thing_id:).process
     end

     def initialize(thing_id:)
       @thing_id = thing_id
     end

     def process
       # Business logic
     end
   end
   ```

2. **Test it:** `test/services/thing_service_test.rb`

3. **Call from controller:**

   ```ruby
   result = ThingService.process(thing_id: params[:id])
   render json: { data: result }
   ```

### Add a Database Field

1. **Generate migration:**

   ```bash
   bin/rails generate migration AddEmailToUsers email:string:unique
   ```

2. **Run migration:**

   ```bash
   bin/rails db:migrate
   ```

3. **Update model validation (if needed):**

   ```ruby
   class User < ApplicationRecord
     validates :email, presence: true, uniqueness: true
   end
   ```

4. **Update serializer:**

   ```ruby
   class UserResource
     include Alba::Resource
     attributes :id, :email, :points_balance  # Add email
   end
   ```

5. **Write tests** for new field behavior

## Project Structure

```text
api/
├── app/
│   ├── controllers/
│   │   └── api/v1/
│   │       ├── users_controller.rb
│   │       ├── rewards_controller.rb
│   │       └── redemptions_controller.rb
│   ├── models/
│   │   ├── user.rb
│   │   ├── reward.rb
│   │   └── redemption.rb
│   ├── services/
│   │   └── redemption_service.rb
│   └── serializers/
│       ├── user_resource.rb
│       ├── reward_resource.rb
│       └── redemption_resource.rb
├── config/
│   ├── routes.rb
│   └── database.yml
├── db/
│   ├── migrate/
│   ├── schema.rb
│   └── seeds.rb
├── test/
│   ├── controllers/
│   ├── models/
│   └── services/
├── .rubocop.yml
├── Dockerfile
└── Gemfile
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Rails 8 (API-only) |
| Database | PostgreSQL 16 |
| Testing | Minitest (Rails default) |
| Serialization | Alba |
| Code Quality | RuboCop (Rails Omakase) |
| Error Tracking | Sentry |
| Deployment | Docker + AWS ECS Fargate |

## Resources

- [Rails API Documentation](https://guides.rubyonrails.org/api_app.html)
- [Alba Serializer Guide](https://github.com/okuramasafumi/alba)
- [RuboCop Rails Guide](https://docs.rubocop.org/rubocop-rails/)
- [Minitest Documentation](https://github.com/minitest/minitest)
- [PostgreSQL Locks](https://www.postgresql.org/docs/current/explicit-locking.html)
- [API Endpoints Documentation](/docs/api.md)
- [Architecture & Design Decisions](/architecture.md)
