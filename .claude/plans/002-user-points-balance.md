# Implementation Plan: User Points Balance (Issue #2)

## Overview

Add user authentication infrastructure and display current user's points balance. Backend-first approach: User model with database constraints, API endpoint with Alba serialization, then React frontend with Redux state management.

## Files to Create

| Path | Purpose |
|------|---------|
| `api/db/migrate/TIMESTAMP_create_users.rb` | Users table migration |
| `api/app/models/user.rb` | User model with validations |
| `api/test/models/user_test.rb` | Model validation tests |
| `api/test/fixtures/users.yml` | Test fixtures |
| `api/app/serializers/user_resource.rb` | Alba serializer |
| `api/app/controllers/api/v1/users_controller.rb` | Users API controller |
| `api/test/controllers/api/v1/users_controller_test.rb` | Request specs |
| `web/src/services/api.ts` | API client |
| `web/src/types/user.ts` | TypeScript interfaces |
| `web/src/store/index.ts` | Redux store configuration |
| `web/src/store/userSlice.ts` | User slice with thunks |
| `web/src/store/hooks.ts` | Typed Redux hooks |
| `web/src/components/user/PointsBalance.tsx` | Points display component |
| `web/src/components/user/PointsBalance.test.tsx` | Component tests |

## Files to Modify

| Path | Change |
|------|--------|
| `api/Gemfile` | Add `gem "alba"` |
| `api/config/routes.rb` | Add API v1 routes |
| `api/app/controllers/application_controller.rb` | Add `current_user` method |
| `api/app/controllers/concerns/sentry_context.rb` | Enable user context |
| `api/db/seeds.rb` | Add demo user |
| `web/package.json` | Add Redux dependencies |
| `web/src/main.tsx` | Wrap with Redux Provider |
| `web/src/App.tsx` | Add PointsBalance component |
| `web/src/App.test.tsx` | Update for Redux |

## Commits Plan

**IMPORTANT: Create commits immediately after completing each step below. Do NOT wait until all work is done.**

### 1. Add User model with points balance

- Add `gem "alba"` to Gemfile
- Create migration with email (unique, not null) and points_balance (not null, default 0)
- Create User model with validations
- Create test fixtures
- Create model tests

### 2. Add users API endpoint with Alba serializer

- Create `api/app/serializers/user_resource.rb`
- Add `current_user` method to ApplicationController
- Enable Sentry user context
- Create `api/app/controllers/api/v1/users_controller.rb` with `me` action
- Add routes for `/api/v1/users/me`
- Create controller tests

### 3. Add demo user seed data

- Update `api/db/seeds.rb` with demo user (demo@example.com, 500 points)

### 4. Add Redux store with user slice

- Add `@reduxjs/toolkit` and `react-redux` to package.json
- Create `web/src/types/user.ts` with User interface
- Create `web/src/services/api.ts` with fetch wrapper
- Create `web/src/store/userSlice.ts` with async thunk
- Create `web/src/store/index.ts` with configureStore
- Create `web/src/store/hooks.ts` with typed hooks
- Wrap App with Redux Provider in main.tsx

### 5. Add PointsBalance component with tests

- Create `web/src/components/user/PointsBalance.tsx`
- Create `web/src/components/user/PointsBalance.test.tsx`
- Add PointsBalance to App.tsx header
- Update App.test.tsx for Redux

## Verification

### Backend

```bash
cd api
bundle install
rails db:migrate
rails test
```

### Frontend

```bash
cd web
npm install
npm run type-check
npm test
```

### Integration

```bash
# Terminal 1
cd api && rails db:seed && rails server -p 3000

# Terminal 2
cd web && npm run dev

# Browser: http://localhost:5173 - verify "500 points" displays
```

### API Test

```bash
curl -H "X-User-Id: 1" http://localhost:3000/api/v1/users/me
# Expected: {"id":1,"email":"demo@example.com","points_balance":500}
```
