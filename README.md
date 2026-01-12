# Rewards Redemption App

A full-stack rewards redemption web application demonstrating architecture,
coding quality, testing, and DevOps practices.

**Stack:** React + TypeScript + Ruby on Rails API + PostgreSQL + Docker +
AWS ECS/Fargate

See [architecture.md](architecture.md) for technical decisions, design
rationale, and shipping plan.

## Quick Start

### Prerequisites

- Docker and Docker Compose
- mise (tool version manager)

Install mise:

```bash
curl https://mise.run | sh
```

### Local Development

```bash
# Install project tools
mise install

# Start all services (database, API, web)
docker-compose up

# Setup pre-commit hooks
mise run setup
```

## How to Test

### Demo Authentication

The app uses a demo authentication system for testing without login flows:

- **X-User-Id Header**: The API accepts an optional `X-User-Id` header to specify
  which user to act as
- **Default User**: Falls back to User.first when no header provided (demo user:
  `demo@example.com`)
- **Demo User Details**:
  - Email: `demo@example.com`
  - Initial points balance: 500 points
  - User ID: 1 (after seeding)

**Production Note**: In production, endpoints would require proper authentication
(JWT/OAuth) and return 401 Unauthorized without valid credentials.

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

See [docs/deployment.md](docs/deployment.md) for monitoring, troubleshooting, and
rollback procedures.

## Deployment to AWS

### First-Time Infrastructure Setup

⚠️ Read the [AWS Setup Guide](docs/aws-setup.md) for complete prerequisites
and follow the [Deployment Steps](docs/aws-setup.md#deployment-steps).

### Continuous Deployment

After infrastructure is set up, deployments are automatic on push to `deploy`:

```bash
git push origin deploy
```

GitHub Actions will:

1. Build and push Docker images to ECR
2. Run database migrations
3. Update ECS Fargate services
4. Output service URLs

### Cleanup

Destroy all AWS infrastructure:

```bash
cd terraform
AWS_PROFILE=admin terraform destroy -auto-approve
```

**Note**: Requires AdministratorAccess profile. See
[AWS Setup Guide](docs/aws-setup.md#iam-permissions-for-terraform) for
profile requirements.

## Documentation

### Getting Started

- **README.md** (this file) - Onboarding and quick start
- [architecture.md](architecture.md) - Technical architecture and design
  decisions

### Infrastructure & Deployment

- [docs/aws-setup.md](docs/aws-setup.md) - Complete AWS infrastructure setup
  guide
- [terraform/README.md](terraform/README.md) - Terraform modules and usage
- [docs/deployment.md](docs/deployment.md) - Deployment, monitoring, rollbacks,
  troubleshooting

### Application Components

- [api/README.md](api/README.md) - Rails API documentation
- [web/README.md](web/README.md) - React frontend documentation

## Contributing

Start work on a GitHub issue:

```bash
/start-issue <issue-number> [main|stack]
```

Creates a worktree, fetches issue details, generates a plan, and commits setup.

## Project Structure

```text
rewards-app/
├── README.md                     # This file - onboarding guide
├── architecture.md               # Technical architecture and decisions
├── .mise.toml                    # Tool version management
├── .pre-commit-config.yaml       # Git hooks
├── docker-compose.yml            # Local development services
├── .github/workflows/            # CI/CD pipelines
├── docs/                         # Documentation
│   ├── aws-setup.md             # AWS infrastructure setup
│   └── deployment.md            # Deployment operations
├── terraform/                    # Infrastructure as Code
│   ├── README.md
│   └── modules/
├── api/                          # Rails API backend
│   ├── Dockerfile
│   └── README.md
└── web/                          # React frontend
    ├── Dockerfile
    └── README.md
```

## Support

For issues or questions:

- Check [docs/deployment.md](docs/deployment.md) for troubleshooting
- Review [architecture.md](architecture.md) for design context
- Open a GitHub issue for bugs or feature requests
