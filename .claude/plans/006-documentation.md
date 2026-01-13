# Issue #6: Documentation

## Overview

Comprehensive documentation to help evaluators and future developers understand the
application. All features (#2-#5, #12) are implemented, and this issue completes the
documentation to match the actual implementation.

**Current State:**

- Root README.md has quick start but missing "How to Test" section
- architecture.md has high-level overview but missing database schema, patterns, and detailed
  architecture
- api/README.md is boilerplate Rails template
- web/README.md has basic commands but missing architecture and testing patterns
- No comprehensive API endpoint documentation
- AWS/Terraform deployment docs are complete (docs/aws-setup.md, docs/deployment.md,
  terraform/README.md) - no changes needed

**Goal:**

- Add "How to Test" section with demo auth explanation, seeding, testing commands, and AWS
  deployment option
- Create docs/api.md with all endpoint documentation
- Expand architecture.md with database schema, backend/frontend patterns, design
  decisions, and production deployment references
- Replace api/README.md with complete backend documentation
- Expand web/README.md with component hierarchy, Redux architecture, and testing
  patterns
- Ensure evaluators know the full AWS infrastructure is available for production
  testing

## Commits Plan

**IMPORTANT: Create commits immediately after completing each step below. Do NOT wait until
all work is done.**

1. Add "How to Test" section to root README
2. Create comprehensive API documentation (docs/api.md)
3. Expand architecture.md with database schema and implementation details
4. Add design decisions and trade-offs to architecture.md
5. Document future improvements and known limitations in architecture.md
6. Replace api/README.md with complete backend documentation
7. Expand web/README.md with frontend architecture and testing patterns

## Implementation Details

### Step 1: Add "How to Test" Section to README.md

**File:** `/Users/fabio/job-applications/thanx/thanx-take-home/docs-6-documentation/README.md`

**Location:** After the "Quick Start" section

**Content to add:**

    ## How to Test

    ### Demo Authentication

    The app uses a demo authentication system for testing without login flows:

    - **X-User-Id Header**: Optional header specifying which user to act as
    - **Default User**: Falls back to User.first when no header provided (demo user:
      demo@example.com)
    - **Demo User Details**:
      - Email: demo@example.com
      - Initial points balance: 500 points
      - User ID: 1 (after seeding)

    **Production Note**: In production, endpoints would require proper authentication (JWT/OAuth)
    and return 401 Unauthorized without valid credentials.

    ### Seeding the Database

    The seed data includes:

    - 1 demo user with 500 points
    - 7 rewards (5 available, 2 unavailable) with costs ranging from 100-2000 points

    Run seeds:

    ```bash
    # In Docker (recommended)
    docker-compose exec api bin/rails db:seed

    # Or locally
    cd api && bin/rails db:seed
    ```

    ### Running Tests

    #### Backend Tests (Minitest)

    ```bash
    # All tests
    cd api && bin/rails test

    # Specific file
    bin/rails test test/controllers/api/v1/users_controller_test.rb

    # Specific test by line number
    bin/rails test test/models/user_test.rb:10
    ```

    #### Frontend Tests (Vitest)

    ```bash
    # All tests (watch mode)
    cd web && bun run test

    # Run once
    bun run test run

    # With UI
    bun run test:ui

    # Type checking
    bun run type-check
    ```

    ### Testing API Endpoints

    Use curl or any HTTP client:

    ```bash
    # Get current user
    curl http://localhost:3001/api/v1/users/me -H "X-User-Id: 1"

    # Get rewards
    curl http://localhost:3001/api/v1/rewards

    # Redeem a reward
    curl -X POST http://localhost:3001/api/v1/redemptions \
      -H "Content-Type: application/json" \
      -H "X-User-Id: 1" \
      -d '{"reward_id": 1}'

    # Get redemption history
    curl http://localhost:3001/api/v1/redemptions -H "X-User-Id: 1"
    ```

    ### Testing on AWS (Optional)

    The application is fully deployable to AWS for evaluation:

    - **Infrastructure**: Terraform provisions VPC, RDS PostgreSQL, ECS Fargate, ALB, ECR
    - **Deployment**: GitHub Actions CI/CD pipeline deploys on push to `deploy` branch
    - **Setup Guide**: See [docs/aws-setup.md](docs/aws-setup.md) for complete AWS
      infrastructure setup
    - **Monitoring**: CloudWatch logs and metrics available for deployed services

    After deploying to AWS, test against the production URLs:

    ```bash
    # Get the ALB URL from Terraform outputs or GitHub Actions logs
    export API_URL="http://rewards-app-alb-xxxxx.us-east-1.elb.amazonaws.com"

    curl $API_URL/api/v1/users/me -H "X-User-Id: 1"
    curl $API_URL/api/v1/rewards
    ```

    See [docs/deployment.md](docs/deployment.md) for monitoring, troubleshooting, and rollback
    procedures.

**Commit:** `docs(#6): Add "How to Test" section to root README`

---

### Step 2: Create Comprehensive API Documentation

**File:** `/Users/fabio/job-applications/thanx/thanx-take-home/docs-6-documentation/docs/api.md`
(new)

**Content:** Complete API documentation including:

- Authentication method (X-User-Id header)
- All 5 endpoints with request/response formats
- Error responses with status codes
- Data models (User, Reward, Redemption)
- RedemptionService business logic
- Serializers (Alba)

**Reference files:**

- `/api/config/routes.rb` - API routes
- `/api/app/controllers/api/v1/*_controller.rb` - Controller actions
- `/api/app/serializers/*_resource.rb` - Response formats
- `/api/app/services/redemption_service.rb` - Business logic

**Commit:** `docs(#6): Create comprehensive API documentation`

---

### Step 3: Expand architecture.md with Implementation Details

**File:** `/Users/fabio/job-applications/thanx/thanx-take-home/docs-6-documentation/architecture.md`

**Add sections:**

1. **Database Schema** (after existing content)
   - Entity Relationship Diagram (text)
   - Tables: users, rewards, redemptions
   - Indexes and their purposes

2. **Backend Patterns**
   - Service objects (why and how)
   - Pessimistic locking (implementation details)
   - Serialization (Alba)

3. **Frontend Architecture**
   - Component hierarchy (tree diagram)
   - State management (4 Redux slices)
   - Custom hooks pattern
   - Theme system (CSS custom properties)
   - Error handling

4. **Testing Strategy**
   - Backend: Minitest structure and patterns
   - Frontend: Vitest + RTL patterns
   - Redux testing pitfalls and solutions

5. **Production Deployment** (brief section with references)
   - Note that full AWS infrastructure is available for evaluation
   - Reference to docs/aws-setup.md, docs/deployment.md, terraform/README.md
   - CI/CD pipeline overview
   - Infrastructure components (VPC, RDS, ECS Fargate, ALB)

**Reference files:**

- `/api/db/schema.rb` - Database schema
- `/api/app/services/redemption_service.rb` - Service pattern
- `/web/src/store/` - Redux slices
- `/web/src/hooks/` - Custom hooks
- `/web/src/styles/theme.css` - Theme system

**Commit:** `docs(#6): Expand architecture.md with database schema and implementation details`

---

### Step 4: Add Design Decisions and Trade-offs

**File:** `/Users/fabio/job-applications/thanx/thanx-take-home/docs-6-documentation/architecture.md`

**Add section:** "Design Decisions & Trade-offs"

**Decisions to document:**

1. **Why Service Objects?**
   - Chosen vs alternatives (fat models, controller logic)
   - Rationale: transactions, testability, reusability
   - Trade-off: more files, but cleaner separation

2. **Why Pessimistic Locking?**
   - Chosen vs alternatives (optimistic locking, constraints only)
   - Rationale: prevents race conditions, better UX
   - Trade-off: slightly slower under high concurrency

3. **Why Redux Toolkit?**
   - Chosen vs alternatives (Context, Zustand, MobX)
   - Rationale: industry standard, DevTools, async patterns
   - Trade-off: more boilerplate, but prevents bugs at scale

4. **Why Demo Auth?**
   - Chosen vs alternatives (JWT, OAuth, sessions)
   - Rationale: take-home scope, focus on features
   - Trade-off: not production-ready, easy to replace

5. **Why CSS Modules + Custom Properties?**
   - Chosen vs alternatives (styled-components, Tailwind, BEM)
   - Rationale: scoped styles, no runtime, theme system
   - Trade-off: separate files, but great performance

**Commit:** `docs(#6): Add design decisions and trade-offs to architecture.md`

---

### Step 5: Document Future Improvements and Known Limitations

**File:** `/Users/fabio/job-applications/thanx/thanx-take-home/docs-6-documentation/architecture.md`

**Add sections:**

1. **Future Improvements**
   - Authentication & Authorization (JWT, OAuth, RBAC)
   - Rewards Management (admin UI, inventory, search)
   - Points System (earning, expiration, transfer)
   - User Experience (notifications, recommendations, favorites)
   - Performance (Redis, CDN, pagination, GraphQL)
   - Observability (APM, metrics, analytics)
   - Testing (E2E, load, visual regression)
   - Infrastructure (multi-region, auto-scaling, canary)

2. **Known Limitations**
   - Demo auth (not production-ready)
   - Image hosting (Unsplash rate limits)
   - No rate limiting (vulnerable to abuse)
   - No pagination on redemption history
   - Single database (no read replicas)
   - No background jobs (all synchronous)

**Commit:** `docs(#6): Document future improvements and known limitations in architecture.md`

---

### Step 6: Replace api/README.md with Complete Documentation

**File:** `/Users/fabio/job-applications/thanx/thanx-take-home/docs-6-documentation/api/README.md`

**Replace entire file with:**

- Architecture overview (API-only, service objects, Alba, pessimistic locking)
- Local development (Docker and direct)
- API endpoints (quick reference, link to docs/api.md)
- Testing guide
- Code quality (RuboCop, pre-commit hooks)
- Database (schema reference, migrations, seeds)
- Service objects (RedemptionService example)
- Error handling (Sentry)
- Environment variables
- Deployment reference
- Common tasks (add endpoint, service object, database field)
- Project structure

**Reference files:**

- `/api/app/services/redemption_service.rb`
- `/api/db/seeds.rb`
- `/api/.rubocop.yml`

**Commit:** `docs(#6): Replace api/README.md with complete backend documentation`

---

### Step 7: Expand web/README.md with Frontend Architecture

**File:** `/Users/fabio/job-applications/thanx/thanx-take-home/docs-6-documentation/web/README.md`

**Expand with:**

- Architecture overview (React, TypeScript, Vite, Redux, Router)
- Component hierarchy (tree diagram)
- State management (4 slices with details)
- Custom hooks (useRewards, useRedemptionHistory)
- Theme system (CSS custom properties usage)
- Testing guide with patterns (basic, Redux with pitfalls)
- Code quality (ESLint, Prettier, type-check)
- Production build
- Error handling (ErrorBoundary, API errors)
- Environment variables
- Common tasks (add component, Redux slice, route)
- Project structure
- Tech stack

**Reference files:**

- `/web/src/App.tsx` - Component hierarchy
- `/web/src/store/` - Redux slices
- `/web/src/hooks/` - Custom hooks
- `/web/src/styles/theme.css` - Theme system
- `/web/vite.config.ts` - Build config

**Commit:** `docs(#6): Expand web/README.md with frontend architecture and testing patterns`

---

## Verification

After completing all documentation:

### 1. Verify Commands Work

Test all commands documented in README.md:

    # Seeding
    docker-compose exec api bin/rails db:seed

    # Backend tests
    cd api && bin/rails test

    # Frontend tests
    cd web && bun run test run

    # API curl examples
    curl http://localhost:3001/api/v1/users/me -H "X-User-Id: 1"
    curl http://localhost:3001/api/v1/rewards

### 2. Verify API Documentation Accuracy

Compare docs/api.md with actual API:

    # Test each endpoint and verify response format matches docs
    curl -s http://localhost:3001/api/v1/users/me -H "X-User-Id: 1" | jq
    curl -s http://localhost:3001/api/v1/rewards | jq
    curl -s http://localhost:3001/api/v1/redemptions -H "X-User-Id: 1" | jq

    # Test error cases
    curl -X POST http://localhost:3001/api/v1/redemptions \
      -H "Content-Type: application/json" \
      -H "X-User-Id: 1" \
      -d '{"reward_id": 999}' | jq

### 3. Cross-reference Architecture Documentation

- Database schema matches `/api/db/schema.rb`
- Service pattern matches `/api/app/services/redemption_service.rb`
- Redux slices match `/web/src/store/`
- Component hierarchy matches `/web/src/App.tsx`
- Theme variables match `/web/src/styles/theme.css`

### 4. Verify Code Quality Commands

    # Backend
    cd api && bundle exec rubocop

    # Frontend
    cd web && bun run lint
    cd web && bun run format:check
    cd web && bun run type-check

### 5. Markdown Linting

    pre-commit run markdownlint --all-files

### 6. Manual Review

- New developer can set up app using only README
- All API endpoints are documented
- Key architectural decisions are explained
- Testing instructions are clear
- "How to Test" section includes auth note and seeding
- Documentation matches implementation

## Critical Files

**To Modify:**

- `/README.md` - Add "How to Test" section
- `/architecture.md` - Expand with schema, patterns, decisions, future work
- `/api/README.md` - Replace with complete backend docs
- `/web/README.md` - Expand with architecture and testing

**To Create:**

- `/docs/api.md` - Comprehensive API documentation

**Reference During Implementation:**

- `/api/config/routes.rb` - API endpoints
- `/api/app/controllers/api/v1/` - Controller actions
- `/api/app/services/redemption_service.rb` - Business logic
- `/api/db/schema.rb` - Database schema
- `/api/db/seeds.rb` - Seed data
- `/web/src/App.tsx` - Component hierarchy
- `/web/src/store/` - Redux slices
- `/web/src/hooks/` - Custom hooks
- `/web/src/styles/theme.css` - Theme system
