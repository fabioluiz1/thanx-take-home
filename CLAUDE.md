# Agent Instructions

Project patterns, standards, and requirements for AI agents generating code.

## Hard Requirements

**Always use the following tools - they are project standards.**

| Tool | Use For | Never Suggest |
|------|---------|---------------|
| bun | Package management, running scripts | npm, yarn, pnpm |
| mise | Tool version management | nvm, rbenv, asdf, brew |
| Vitest | Frontend testing | Jest |
| Minitest | Backend testing | RSpec |
| Graphite (gt) | Branch/PR management | git push, gh pr |

### Package Management

- **Always use `bun`** for the web/ directory
- Run scripts: `bun run <script>` or `bun x <package>`
- Install: `bun install` or `bun add <package>`
- The project uses `bun.lockb` - never generate package-lock.json or yarn.lock

### Tool Versions (via mise)

```bash
mise install    # Install all tools
mise exec -- <command>  # Run with correct versions
```

Current versions (from .mise.toml):

- bun: 1.1.43
- ruby: 4.0.0
- terraform: 1.10.4

## Daily Workflow

### Available Commands

| Command | Purpose |
|---------|---------|
| `/start-issue <number>` | Start work on a GitHub issue |
| `/code-review <PR>` | Review a pull request |
| `/review-commit-history <PR>` | Analyze commits, extract lessons |

### Typical Development Cycle

#### 1. Start Work on an Issue

```bash
/start-issue 42
```

This command:

- Fetches issue details from GitHub
- Creates a worktree with proper branch name (`feat-42-description`)
- Generates implementation plan in `.claude/plans/042-title.md`
- Creates initial commit with the plan
- Submits PR via Graphite

The plan includes a **Commits Plan** section with MECE commits (Mutually
Exclusive, Collectively Exhaustive). Create commits immediately after each step.

#### 2. Implement the Feature

Follow the commits plan. Each commit should be:

- Atomic and reviewable independently
- Following the `type(#issue): message` format
- Submitted incrementally via `gt submit`

#### 3. Request Code Review

```bash
/code-review 42
```

This command:

- Fetches PR diff and details
- Analyzes for bugs, security, performance, style issues
- Presents findings with severity levels
- Lets you filter which comments to include
- Posts review to GitHub
- Offers to address review items

#### 4. Analyze Commit History

```bash
/review-commit-history 42
```

Run after code review to:

- Detect squashable commits (multiple fixes, debugging commits)
- Compare actual commits against the plan
- Extract technical challenges and process improvements
- Update plan file with lessons learned
- Suggest rebase strategy using fixup workflow

### Stacking Workflow

When starting an issue that depends on another:

```bash
/start-issue 43 stack
```

This stacks the new branch on the current branch instead of main.

## Git Workflow

### Branch Names

Format: `{type}-{issue}-{slug}`

- type: lowercase letters/numbers/hyphens (start with letter)
- issue: GitHub issue number
- slug: lowercase letters/numbers/hyphens

Examples: `feat-123-add-user-auth`, `fix-42-resolve-crash`, `chore-1-setup-tooling`

### Commit Messages

Format: `type(#issue): message`

- type: word characters (letters, numbers, `_`, `-`)
- issue: GitHub issue number
- message: any text

Examples: `feat(#1): Add new feature`, `fix(#42): Resolve crash on startup`

Fixup commits: `fixup! type(#issue): original message`

### Branch Management (Graphite)

Commands:

- Use: `gt sync`, `gt restack`, `gt submit`
- Avoid: `gt repo sync` (deprecated), `git push` (use `gt submit`)

Editing commits:

- **Latest commit**: `git commit --amend --no-edit` (or with `-m` for new message)
- **Older commits**: Fixup workflow:
  1. Make changes
  2. `git commit -m "fixup! type(#123): Original message"`
  3. `git rebase -i --autosquash`

## Project Structure

```text
rewards-app/
├── api/                    # Rails 8 API (JSON-only)
│   ├── app/
│   │   ├── controllers/   # API controllers
│   │   ├── models/        # ActiveRecord models
│   │   ├── services/      # Business logic
│   │   └── serializers/   # JSON serializers
│   ├── test/              # Minitest tests
│   └── Dockerfile
├── web/                    # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── store/         # Redux store
│   │   └── services/      # API clients
│   └── Dockerfile
├── terraform/              # AWS infrastructure
│   └── modules/           # VPC, ECR, RDS, ECS
├── docs/                   # Documentation
├── scripts/                # Git hooks, CI helpers
└── .github/workflows/      # CI/CD pipelines
```

## Code Standards

### Rails API (api/)

**Style**: RuboCop Rails Omakase (standard Rails style)

**Patterns**:

- API-only mode (JSON responses, no views)
- Controllers inherit from `ApplicationController`
- Business logic in service objects (`app/services/`)
- Include concerns for cross-cutting behavior

```ruby
# Controller pattern
class Api::V1::RewardsController < ApplicationController
  def index
    rewards = RewardService.list_available
    render json: rewards
  end
end

# Service object pattern
class RewardService
  def self.list_available
    Reward.where(active: true).order(:name)
  end
end

# Concern pattern
module SentryContext
  extend ActiveSupport::Concern

  included do
    before_action :set_sentry_context
  end

  private

  def set_sentry_context
    Sentry.set_tags(request_id: request.request_id)
  end
end
```

**Testing**: Minitest (Rails default)

```ruby
class Api::V1::RewardsControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get api_v1_rewards_url
    assert_response :success
  end
end
```

### React Frontend (web/)

**Style**: ESLint + Prettier (auto-formatted on commit)

**Patterns**:

- Functional components with hooks
- TypeScript for all `.ts`/`.tsx` files
- Explicit interface definitions for props
- Error boundaries wrap components

```tsx
// Component pattern
import { useState } from "react";

interface RewardListProps {
  userId: string;
}

export function RewardList({ userId }: RewardListProps) {
  const [rewards, setRewards] = useState<Reward[]>([]);

  return (
    <ul>
      {rewards.map((reward) => (
        <li key={reward.id}>{reward.name}</li>
      ))}
    </ul>
  );
}
```

**Testing**: Vitest + React Testing Library

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RewardList } from "./RewardList";

describe("RewardList", () => {
  it("renders rewards", () => {
    render(<RewardList userId="123" />);
    expect(screen.getByRole("list")).toBeInTheDocument();
  });
});
```

### Terraform (terraform/)

**Style**: Terraform fmt (auto-formatted)

**Patterns**:

- Modular structure (`modules/vpc`, `modules/ecs`, etc.)
- Variables with descriptions and defaults
- Outputs for values needed by other modules/CI
- Tags on all resources: `Project`, `ManagedBy`, `Environment`

```hcl
variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "rewards-app"
}

resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"

  tags = {
    Project     = var.project_name
    ManagedBy   = "terraform"
    Environment = var.environment
  }
}

output "cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}
```

## Pre-commit Checks

All hooks must pass before commit:

| Hook | Files | What it checks |
|------|-------|----------------|
| validate-commit-msg | commit message | `type(#issue): message` format |
| check-branch-name | branch | `type-issue-slug` format |
| validate-commit-author | commit | Author name/email format |
| markdownlint | `*.md` | Markdown style |
| hadolint-docker | `Dockerfile` | Dockerfile best practices |
| rubocop | `api/**/*.rb` | Ruby style |
| prettier | `web/**/*.{ts,tsx,json,css}` | Code formatting |
| web-eslint | `web/**/*.{ts,tsx}` | TypeScript/React style |
| terraform-validate | `terraform/**/*.tf` | Terraform syntax |
| trailing-whitespace | all | No trailing spaces |
| end-of-file-fixer | all | Newline at EOF |
| check-yaml | `*.yml`, `*.yaml` | YAML syntax |
| check-added-large-files | all | Max 1000KB |
| check-merge-conflict | all | No merge markers |

Run manually: `pre-commit run --all-files`

## CI/CD Pipeline

### CI (Pull Requests)

GitHub Actions validates:

1. Branch name format
2. Commit author format
3. Pre-commit hooks (markdownlint, hadolint, prettier)
4. ESLint (web/)
5. TypeScript type check (web/)
6. Vitest tests (web/)
7. Terraform validate

### CD (Deploy)

Triggered on push to `deploy` branch:

1. Build Docker images
2. Push to ECR
3. Run database migrations (one-off Fargate task)
4. Update ECS services
5. Wait for stabilization
6. Output service URLs

## Error Handling

### Backend (Sentry)

Sentry auto-captures exceptions. Add context:

```ruby
# In controllers (via SentryContext concern)
Sentry.set_tags(request_id: request.request_id)
Sentry.set_user(id: current_user.id) if current_user

# Manual capture with extra context
Sentry.capture_exception(error, extra: { order_id: order.id })
```

### Frontend (Sentry)

Wrap components in ErrorBoundary:

```tsx
import { ErrorBoundary } from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <MainContent />
    </ErrorBoundary>
  );
}
```

Manual capture:

```tsx
import * as Sentry from "@sentry/react";

try {
  riskyOperation();
} catch (error) {
  Sentry.captureException(error, { extra: { context: "value" } });
}
```

## Common Tasks

### Add a New API Endpoint

1. Create controller in `api/app/controllers/api/v1/`
2. Add route in `api/config/routes.rb`
3. Create service object for business logic (if complex)
4. Write tests in `api/test/controllers/`

### Add a New React Component

1. Create component in `web/src/components/`
2. Define TypeScript interface for props
3. Write tests in same directory (`ComponentName.test.tsx`)
4. Export from index if creating a directory

### Add Terraform Resource

1. Add resource to appropriate module in `terraform/modules/`
2. Define variables with descriptions
3. Add outputs for values needed elsewhere
4. Include standard tags
5. Run `terraform fmt` and `terraform validate`

### Run Local Development

```bash
# Install tools
mise install

# Start services
docker-compose up

# Setup hooks
mise run setup
```

- Web: <http://localhost:3000>
- API: <http://localhost:3001>
- Database: `localhost:5432`

### Deploy to AWS

```bash
# First time
cd terraform
./bootstrap.sh
terraform plan -out=tfplan
AWS_PROFILE=admin terraform apply tfplan
./setup-github-secrets.sh

# Subsequent deploys
git push origin deploy
```

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Rails controller | snake_case | `rewards_controller.rb` |
| Rails model | snake_case singular | `reward.rb` |
| Rails service | snake_case | `reward_service.rb` |
| React component | PascalCase | `RewardList.tsx` |
| React test | ComponentName.test.tsx | `RewardList.test.tsx` |
| React hook | camelCase with use prefix | `useRewards.ts` |
| Terraform | snake_case | `main.tf`, `variables.tf` |

## Environment Variables

### Local (.env)

```bash
# Sentry (optional for local dev)
SENTRY_DSN_API=
SENTRY_DSN_WEB=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT_WEB=
```

### Production (via Terraform/Parameter Store)

- Database credentials: auto-generated, stored in Parameter Store
- Sentry DSN: set via `TF_VAR_sentry_dsn`
- GitHub Actions secrets: configured via `setup-github-secrets.sh`
