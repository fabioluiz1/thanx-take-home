import { ErrorBoundary } from "./components/ErrorBoundary";
import { PointsBalance } from "./components/user/PointsBalance";

export default function App() {
  return (
    <ErrorBoundary>
      <header>
        <h1>Rewards App</h1>
        <PointsBalance />
      </header>
    </ErrorBoundary>
  );
}
