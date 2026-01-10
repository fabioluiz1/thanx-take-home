import { ErrorBoundary } from "./components/ErrorBoundary";
import { PointsBalance } from "./components/user/PointsBalance";
import { RewardsList } from "./components/rewards/RewardsList";

export default function App() {
  return (
    <ErrorBoundary>
      <header>
        <h1>Rewards App</h1>
        <PointsBalance />
      </header>
      <main>
        <RewardsList />
      </main>
    </ErrorBoundary>
  );
}
