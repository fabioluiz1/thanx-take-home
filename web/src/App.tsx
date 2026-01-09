import { Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PointsBalance } from "./components/user/PointsBalance";
import { RewardsList } from "./components/rewards/RewardsList";
import { Navigation } from "./components/navigation/Navigation";
import { RedemptionHistory } from "./components/redemptions/RedemptionHistory";
import styles from "./App.module.css";

export default function App() {
  return (
    <ErrorBoundary>
      <header className={styles.header}>
        <h1>Rewards App</h1>
        <PointsBalance />
      </header>
      <Navigation />
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<RewardsList />} />
          <Route path="/history" element={<RedemptionHistory />} />
        </Routes>
      </main>
    </ErrorBoundary>
  );
}
