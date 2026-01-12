# Frontend (React + TypeScript + Vite)

React + TypeScript frontend for the Rewards Redemption App, built with Vite for fast
development and production builds.

## Quick Start

### Prerequisites

- Bun 1.1.43 (use `mise install` to install)

### Development

Install dependencies:

```bash
cd web
bun install
```

Start dev server:

```bash
bun run dev
```

The app opens at `http://localhost:5173`

**Note:** Backend API must be running at `http://localhost:3001` (see `/api/README.md`)

### Production Build

Build for production:

```bash
bun run build
```

Preview production build:

```bash
bun run preview
```

## Architecture Overview

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19.2 |
| Language | TypeScript | 5.9 |
| Build Tool | Vite | 7 |
| State Management | Redux Toolkit | 2.5 |
| Routing | React Router | 7.12 |
| Testing | Vitest + React Testing Library | |
| Code Quality | ESLint + Prettier | |
| Error Tracking | Sentry | 10.32 |

### Component Hierarchy

```text
App (main.tsx)
├── ErrorBoundary
│   └── Catches unhandled React errors
│       Displays fallback UI
│       Logs to Sentry
│
├── Navigation
│   ├── Logo & branding
│   └── UserBalance
│       └── Displays points_balance from Redux
│
└── Router
    ├── Route: "/"
    │   └── RewardsList
    │       ├── Fetches rewards from Redux
    │       ├── RewardCard (for each reward)
    │       │   ├── Image
    │       │   ├── Name & description
    │       │   ├── Cost badge
    │       │   └── Redeem button
    │       └── Loading / Error states
    │
    └── Route: "/redemptions"
        └── RedemptionHistory
            ├── Fetches history from Redux
            ├── Table (desktop) or List (mobile)
            │   └── HistoryRow (for each redemption)
            │       ├── Reward name
            │       ├── Points spent
            │       └── Redeemed date
            └── Loading / Error states
```

### Directory Structure

```text
web/src/
├── App.tsx                          # Root component with routes
├── main.tsx                         # Vite entry point
├── setupTests.ts                    # Vitest configuration
├── index.css                        # Global styles
│
├── components/
│   ├── ErrorBoundary.tsx           # Error boundary wrapper
│   ├── App.module.css
│   │
│   ├── navigation/
│   │   ├── Navigation.tsx          # Header component
│   │   ├── Navigation.module.css
│   │   └── UserBalance.tsx         # Current user balance display
│   │
│   ├── rewards/
│   │   ├── RewardsList.tsx         # List of rewards
│   │   ├── RewardsList.test.tsx
│   │   ├── RewardsList.module.css
│   │   ├── RewardCard.tsx          # Individual reward item
│   │   ├── RewardCard.test.tsx
│   │   └── RewardCard.module.css
│   │
│   └── redemptions/
│       ├── RedemptionHistory.tsx    # History page
│       ├── RedemptionHistory.test.tsx
│       ├── RedemptionHistory.module.css
│       └── HistoryRow.tsx           # Table row component
│
├── hooks/
│   ├── useRewards.ts               # Fetch rewards with Redux
│   ├── useRedemptionHistory.ts      # Fetch redemption history
│   ├── useRewardRedeem.ts           # Redeem a reward
│   └── useCurrentUser.ts            # Fetch current user
│
├── services/
│   ├── api.ts                      # HTTP client (axios)
│   └── sentry.ts                   # Sentry initialization
│
├── store/
│   ├── index.ts                    # Store configuration
│   ├── hooks.ts                    # useAppDispatch, useAppSelector
│   ├── userSlice.ts                # User state + fetchUser thunk
│   ├── rewardsSlice.ts             # Rewards list + fetchRewards thunk
│   ├── redemptionSlice.ts          # Redemption request state
│   └── redemptionHistorySlice.ts   # Redemption history + thunk
│
├── styles/
│   ├── theme.css                   # CSS custom properties
│   ├── reset.css                   # Normalize styles
│   └── variables.css               # Typography, spacing, colors
│
├── types/
│   ├── user.ts                     # User interfaces
│   ├── reward.ts                   # Reward interfaces
│   └── redemption.ts               # Redemption interfaces
│
└── utils/
    └── errorFormatter.ts           # Format API errors for display
```

## State Management (Redux Toolkit)

Redux manages global application state with 4 slices for complete data flow.

### Store Architecture

```text
Redux Store
├── userSlice
│   ├── user: User | null           # Current user data
│   ├── loading: boolean            # Fetch in progress
│   └── error: string | null        # Error message
│
├── rewardsSlice
│   ├── rewards: Reward[]           # Available rewards
│   ├── loading: boolean
│   ├── error: string | null
│   └── fetched: boolean            # Has data been loaded?
│
├── redemptionSlice
│   ├── loading: boolean            # Redeem in progress
│   ├── error: string | null        # Redemption error
│   └── success: boolean            # Last redeem succeeded?
│
└── redemptionHistorySlice
    ├── redemptions: Redemption[]   # User's past redemptions
    ├── loading: boolean
    ├── error: string | null
    └── fetched: boolean
```

### Redux Slices

#### userSlice (`src/store/userSlice.ts`)

Manages current authenticated user:

```typescript
export const fetchUser = createAsyncThunk("user/fetchUser", async () => {
  return apiClient.get<User>("/users/me");
});

const userSlice = createSlice({
  name: "user",
  initialState: { user: null, loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch user";
      });
  },
});
```

#### rewardsSlice (`src/store/rewardsSlice.ts`)

Manages available rewards catalog:

```typescript
export const fetchRewards = createAsyncThunk("rewards/fetchRewards", async () => {
  return apiClient.get<Reward[]>("/rewards");
});

const rewardsSlice = createSlice({
  name: "rewards",
  initialState: {
    rewards: [],
    loading: false,
    error: null,
    fetched: false,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRewards.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fetched = true;
      })
      .addCase(fetchRewards.fulfilled, (state, action) => {
        state.loading = false;
        state.rewards = action.payload;
      })
      .addCase(fetchRewards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch rewards";
      });
  },
});
```

**Key concept:** `fetched: true` during loading prevents infinite dispatch loops
in hooks. See testing patterns below.

#### redemptionSlice (`src/store/redemptionSlice.ts`)

Manages redemption request (POST action):

```typescript
export const redeemReward = createAsyncThunk(
  "redemption/redeem",
  async ({ reward_id }: { reward_id: number }) => {
    return apiClient.post("/redemptions", { reward_id });
  },
);
```

Tracks loading and errors for the redeem button.

#### redemptionHistorySlice (`src/store/redemptionHistorySlice.ts`)

Manages user's redemption history:

```typescript
export const fetchRedemptionHistory = createAsyncThunk(
  "redemptionHistory/fetch",
  async () => {
    return apiClient.get<Redemption[]>("/redemptions");
  },
);
```

### Store Hooks (`src/store/hooks.ts`)

Typed Redux hooks for components:

```typescript
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./index";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T,>(selector: (state: RootState) => T) =>
  useSelector(selector);
```

**Always use these instead of raw Redux hooks** to get TypeScript type safety.

## Custom Hooks Pattern

Encapsulate Redux and API logic for reusability across components.

### useRewards Hook

Located: `src/hooks/useRewards.ts`

Fetches and caches rewards:

```typescript
export function useRewards() {
  const dispatch = useAppDispatch();
  const { rewards, loading, error, fetched } = useAppSelector(
    (state) => state.rewards,
  );

  useEffect(() => {
    // Only fetch if not already fetched (prevents duplicate requests)
    if (!fetched && !loading) {
      dispatch(fetchRewards());
    }
  }, [dispatch, fetched, loading]);

  return { rewards, loading, error };
}
```

**Usage in components:**

```tsx
function RewardsList() {
  const { rewards, loading, error } = useRewards();

  if (loading) return <div>Loading rewards...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {rewards.map((reward) => (
        <RewardCard key={reward.id} reward={reward} />
      ))}
    </div>
  );
}
```

### useRedemptionHistory Hook

Located: `src/hooks/useRedemptionHistory.ts`

Fetches user's redemption history:

```typescript
export function useRedemptionHistory() {
  const dispatch = useAppDispatch();
  const { redemptions, loading, error, fetched } = useAppSelector(
    (state) => state.redemptionHistory,
  );

  useEffect(() => {
    if (!fetched && !loading) {
      dispatch(fetchRedemptionHistory());
    }
  }, [dispatch, fetched, loading]);

  return { redemptions, loading, error };
}
```

**Benefits of hooks pattern:**

- Logic reusable across multiple components
- Redux dispatch/select hidden behind simple interface
- Easier to test (test hook behavior, not Redux wiring)
- Can cache/memoize expensive operations

## Theme System (CSS Custom Properties)

Located: `src/styles/theme.css`

Maintains consistent branding and theming via CSS custom properties.

### Design Tokens

```css
:root {
  /* Brand Colors */
  --color-brand-primary: #11c0bf;
  --color-brand-dark: #2c5f5f;
  --color-brand-light: #e0f7f6;

  /* Backgrounds */
  --color-bg-primary: #2c5f5f;
  --color-bg-secondary: #ffffff;
  --color-bg-tertiary: #f9fafb;

  /* Text */
  --color-text-primary: #343538;
  --color-text-secondary: #6b7280;
  --color-text-on-dark: #ffffff;

  /* Status Colors */
  --color-status-success: #10b981;
  --color-status-warning: #f59e0b;
  --color-status-error: #ef4444;

  /* Typography */
  --font-family-primary: -apple-system, BlinkMacSystemFont, "Segoe UI";
  --font-size-base: 16px;
  --font-weight-medium: 500;

  /* Spacing */
  --spacing-md: 16px;
  --spacing-lg: 24px;

  /* Effects */
  --radius-md: 8px;
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --transition-base: 250ms ease-in-out;
}
```

### Usage with CSS Modules

```css
/* RewardCard.module.css */
.card {
  background: var(--color-bg-secondary);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  transition: transform var(--transition-base);
}

.card:hover {
  transform: translateY(-2px);
}

.cost {
  color: var(--color-brand-primary);
  font-weight: var(--font-weight-medium);
}
```

Components use CSS Modules for scoping:

```tsx
import styles from "./RewardCard.module.css";

export function RewardCard({ reward }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.cost}>{reward.points_cost} points</div>
    </div>
  );
}
```

**Benefits:**

- No global class name collisions
- TypeScript-safe: typos caught at build time
- Performance: no CSS-in-JS runtime overhead
- Easy theming: change CSS vars, not component code

## Error Handling

### Error Boundary Component

Located: `src/components/ErrorBoundary.tsx`

Catches unhandled React errors in component tree:

```tsx
export class ErrorBoundary extends React.Component<Props, State> {
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    Sentry.captureException(error, {
      extra: { componentStack: info.componentStack },
    });

    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Something went wrong</h1>
          <p>We've been notified and will look into it.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

Wrap root component:

```tsx
export default function App() {
  return (
    <ErrorBoundary>
      {/* App content */}
    </ErrorBoundary>
  );
}
```

### API Error Handling

Redux thunks catch API errors:

```typescript
const { user, error } = useAppSelector((state) => state.user);

if (error) {
  return (
    <div className={styles.error}>
      Failed to load user: {error}
      <button onClick={() => dispatch(fetchUser())}>Retry</button>
    </div>
  );
}
```

Sentry captures unhandled errors:

```tsx
try {
  riskOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { context: "reward_redemption" },
  });
}
```

## Testing

### Run Tests

```bash
# Watch mode (re-runs on file changes)
bun run test

# Run once
bun run test run

# UI mode (interactive browser)
bun run test:ui

# With coverage
bun run test run --coverage
```

### Testing Setup

Located: `src/setupTests.ts`

Configures React Testing Library and mocks:

```typescript
import "@testing-library/jest-dom";
import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Mock API client
vi.mock("../services/api", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));
```

### Component Testing

Basic component test with React Testing Library:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RewardCard } from "./RewardCard";

describe("RewardCard", () => {
  it("displays reward name and cost", () => {
    const reward = {
      id: 1,
      name: "Coffee",
      points_cost: 100,
      available: true,
    };

    render(<RewardCard reward={reward} onRedeem={() => {}} />);

    expect(screen.getByText("Coffee")).toBeInTheDocument();
    expect(screen.getByText("100 points")).toBeInTheDocument();
  });

  it("disables button when unavailable", () => {
    const reward = {
      id: 1,
      name: "Coffee",
      points_cost: 100,
      available: false,
    };

    render(<RewardCard reward={reward} onRedeem={() => {}} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });
});
```

### Redux Component Testing

**Critical:** Always provide complete `preloadedState` for all reducers.

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { describe, it, expect, vi } from "vitest";
import { RewardsList } from "./RewardsList";
import rewardsReducer from "../../store/rewardsSlice";
import userReducer from "../../store/userSlice";

const createTestStore = (preloadedState = {}) =>
  configureStore({
    reducer: {
      rewards: rewardsReducer,
      user: userReducer,
    },
    preloadedState: {
      rewards: {
        rewards: [],
        loading: false,
        error: null,
        fetched: false,  // ✅ REQUIRED: Hook checks fetched before dispatch
        ...preloadedState.rewards,
      },
      user: {
        user: null,
        loading: false,
        error: null,
        ...preloadedState.user,
      },
    },
  });

describe("RewardsList", () => {
  it("displays loaded rewards", async () => {
    const mockRewards = [
      { id: 1, name: "Coffee", points_cost: 100, available: true },
    ];

    const store = createTestStore({
      rewards: {
        rewards: mockRewards,
        fetched: true,
        loading: false,
      },
    });

    render(
      <Provider store={store}>
        <RewardsList />
      </Provider>,
    );

    expect(screen.getByText("Coffee")).toBeInTheDocument();
  });

  it("fetches rewards on mount", async () => {
    const store = createTestStore({
      rewards: {
        rewards: [],
        fetched: false,  // ✅ Triggers useEffect dispatch
        loading: false,
      },
    });

    vi.mocked(apiClient.get).mockResolvedValue([
      { id: 1, name: "Coffee", points_cost: 100, available: true },
    ]);

    render(
      <Provider store={store}>
        <RewardsList />
      </Provider>,
    );

    await waitFor(
      () => {
        expect(screen.getByText("Coffee")).toBeInTheDocument();
      },
      { timeout: 2000 },  // ✅ REQUIRED: Prevents indefinite hangs
    );
  });
});
```

**Common Redux Testing Pitfalls & Solutions:**

| Problem | Symptom | Solution |
|---------|---------|----------|
| Missing reducer in preloadedState | Component doesn't render | Include all reducers with full state shape |
| `fetched: false` not set | Hook doesn't dispatch thunk | Set `fetched: false` to trigger useEffect |
| No timeout on `waitFor()` | Tests hang indefinitely | Always use `{ timeout: 2000 }` |
| Mock returns undefined | Component fails silently | Ensure mock returns actual data |
| Wrong initial loading state | Tests pass but app fails | Match loading states to actual behavior |

## Code Quality

### Type Checking

```bash
bun run type-check
```

TypeScript compilation without emitting code. Catches type errors before runtime.

### Linting (ESLint)

```bash
# Check for issues
bun run lint

# Fix auto-fixable issues
bun run lint -- --fix
```

Configuration: `.eslintrc.json` (using Recommended config + React plugin)

Enforced on every commit via pre-commit hooks.

### Formatting (Prettier)

```bash
# Format all files
bun run format

# Check if formatted
bun run format:check
```

Configuration: `.prettierrc`

Enforced on every commit.

## Build and Deployment

### Build Process

```bash
bun run build
```

1. Runs `tsc -b` for type checking
2. Bundles code with Vite
3. Generates source maps
4. (Optional) Uploads source maps to Sentry
5. Output in `dist/` directory

### Environment Variables

Create `.env` file in `web/` directory:

```bash
VITE_API_URL=http://localhost:3001/api/v1
VITE_SENTRY_DSN=https://...@sentry.io/...
VITE_SENTRY_ENVIRONMENT=development
VITE_GIT_SHA=$(git rev-parse HEAD)
```

**For production:** Set in GitHub Actions secrets (configured via Terraform)

### Deployment

See [/docs/deployment.md](/docs/deployment.md) for:

- Docker image building
- AWS S3 + CloudFront deployment
- Environment configuration

## Common Development Tasks

### Add a New Component

1. **Create file:** `src/components/thing/Thing.tsx`

   ```tsx
   import styles from "./Thing.module.css";

   interface ThingProps {
     id: number;
     name: string;
   }

   export function Thing({ id, name }: ThingProps) {
     return <div className={styles.container}>{name}</div>;
   }
   ```

2. **Create styles:** `src/components/thing/Thing.module.css`

   ```css
   .container {
     padding: var(--spacing-md);
     border-radius: var(--radius-md);
   }
   ```

3. **Create test:** `src/components/thing/Thing.test.tsx`

   ```tsx
   import { render, screen } from "@testing-library/react";
   import { Thing } from "./Thing";

   describe("Thing", () => {
     it("renders name", () => {
       render(<Thing id={1} name="Test" />);
       expect(screen.getByText("Test")).toBeInTheDocument();
     });
   });
   ```

### Add a Redux Slice

1. **Create slice:** `src/store/thingSlice.ts`

   ```typescript
   import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
   import { apiClient } from "../services/api";

   export const fetchThings = createAsyncThunk("things/fetch", async () => {
     return apiClient.get("/things");
   });

   const thingSlice = createSlice({
     name: "things",
     initialState: { items: [], loading: false, error: null },
     extraReducers: (builder) => {
       builder
         .addCase(fetchThings.pending, (state) => {
           state.loading = true;
         })
         .addCase(fetchThings.fulfilled, (state, action) => {
           state.items = action.payload;
           state.loading = false;
         });
     },
   });

   export default thingSlice.reducer;
   ```

2. **Register in store:** `src/store/index.ts`

   ```typescript
   import thingReducer from "./thingSlice";

   export const store = configureStore({
     reducer: {
       // ...
       things: thingReducer,
     },
   });
   ```

3. **Create hook:** `src/hooks/useThings.ts`

   ```typescript
   export function useThings() {
     const dispatch = useAppDispatch();
     const { items, loading, error } = useAppSelector((s) => s.things);

     useEffect(() => {
       dispatch(fetchThings());
     }, [dispatch]);

     return { items, loading, error };
   }
   ```

### Add a Route

1. **Create page component:** `src/pages/ThingsPage.tsx`

   ```tsx
   export function ThingsPage() {
     const { items } = useThings();
     return <div>{/* Page content */}</div>;
   }
   ```

2. **Register route:** `src/App.tsx`

   ```tsx
   <Routes>
     <Route path="/" element={<RewardsList />} />
     <Route path="/things" element={<ThingsPage />} />
   </Routes>
   ```

3. **Add navigation link:** `src/components/navigation/Navigation.tsx`

   ```tsx
   <Link to="/things">Things</Link>
   ```

## Resources

### Project Documentation

- [Architecture & Design Decisions](/architecture.md)
- [API Backend Documentation](/api/README.md)

### External References

- [React Documentation](https://react.dev)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org)
- [Vite Documentation](https://vite.dev)
- [Vitest Documentation](https://vitest.dev)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
