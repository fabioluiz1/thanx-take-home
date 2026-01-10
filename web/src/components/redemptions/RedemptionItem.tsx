import type { Redemption } from "../../types/redemption";
import styles from "./RedemptionHistory.module.css";

interface RedemptionItemProps {
  redemption: Redemption;
}

export function RedemptionItem({ redemption }: RedemptionItemProps) {
  return (
    <div className={styles.item} data-testid="redemption-item">
      <div className={styles.itemContent}>
        {redemption.reward.image_url && (
          <img
            src={redemption.reward.image_url}
            alt={redemption.reward.name}
            className={styles.itemImage}
          />
        )}
        <div className={styles.itemDetails}>
          <h3 className={styles.itemName}>{redemption.reward.name}</h3>
          <div className={styles.itemInfo}>
            <span className={styles.itemPoints}>
              {redemption.points_spent.toLocaleString()} pts
            </span>
            <span className={styles.itemDate}>
              {new Date(redemption.redeemed_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
