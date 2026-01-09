import { useRedemptionHistory } from "../../hooks/useRedemptionHistory";
import type { Redemption } from "../../types/redemption";
import { RedemptionItem } from "./RedemptionItem";
import { RedemptionItemSkeleton } from "./RedemptionItemSkeleton";
import styles from "./RedemptionHistory.module.css";

const SKELETON_COUNT = 6;

function RedemptionContent({
  loading,
  error,
  redemptions,
}: {
  loading: boolean;
  error: string | null;
  redemptions: Redemption[];
}) {
  if (loading) {
    return (
      <div className={styles.list} data-testid="redemptions-loading">
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <RedemptionItemSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.message} data-testid="redemptions-error">
        <p>Failed to load redemption history. Please try again later.</p>
      </div>
    );
  }

  if (redemptions.length === 0) {
    return (
      <div className={styles.message} data-testid="redemptions-empty">
        <p>No redemptions yet. Redeem your first reward to see your history!</p>
      </div>
    );
  }

  return (
    <div className={styles.list} data-testid="redemptions-list">
      {redemptions.map((redemption) => (
        <RedemptionItem key={redemption.id} redemption={redemption} />
      ))}
    </div>
  );
}

export function RedemptionHistory() {
  const { redemptions, loading, error } = useRedemptionHistory();

  return (
    <section className={styles.container}>
      <h2 className={styles.heading}>Redemption History</h2>
      <RedemptionContent
        loading={loading}
        error={error}
        redemptions={redemptions}
      />
    </section>
  );
}
