import { useRewards } from "../../hooks/useRewards";
import type { Reward } from "../../types/reward";
import { RewardCard } from "./RewardCard";
import { RewardCardSkeleton } from "./RewardCardSkeleton";
import styles from "./RewardsList.module.css";

const SKELETON_COUNT = 6;

function RewardsContent({
  loading,
  error,
  rewards,
}: {
  loading: boolean;
  error: string | null;
  rewards: Reward[];
}) {
  if (loading) {
    return (
      <div className={styles.grid} data-testid="rewards-loading">
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <RewardCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.message} data-testid="rewards-error">
        <p>Failed to load rewards. Please try again later.</p>
      </div>
    );
  }

  if (rewards.length === 0) {
    return (
      <div className={styles.message} data-testid="rewards-empty">
        <p>No rewards available at this time.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid} data-testid="rewards-list">
      {rewards.map((reward) => (
        <RewardCard key={reward.id} reward={reward} />
      ))}
    </div>
  );
}

export function RewardsList() {
  const { rewards, loading, error } = useRewards();

  return (
    <section className={styles.container}>
      <RewardsContent loading={loading} error={error} rewards={rewards} />
    </section>
  );
}
