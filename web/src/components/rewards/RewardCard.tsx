import { useState } from "react";
import type { Reward } from "../../types/reward";
import styles from "./RewardCard.module.css";

interface RewardCardProps {
  reward: Reward;
}

export function RewardCard({ reward }: RewardCardProps) {
  const [imageError, setImageError] = useState(false);
  const cardClasses = [styles.card, !reward.available && styles.unavailable]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={cardClasses} data-testid="reward-card">
      <div className={styles.imageContainer}>
        {reward.image_url && !imageError ? (
          <img
            src={reward.image_url}
            alt={reward.name}
            className={styles.image}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={styles.imagePlaceholder} />
        )}
        {!reward.available && (
          <span className={styles.outOfStock} data-testid="out-of-stock-badge">
            Out of Stock
          </span>
        )}
      </div>
      <div className={styles.content}>
        <h3 className={styles.name}>{reward.name}</h3>
        {reward.description && (
          <p className={styles.description}>{reward.description}</p>
        )}
        <span className={styles.pointsBadge} data-testid="points-badge">
          {reward.points_cost.toLocaleString()} pts
        </span>
      </div>
    </article>
  );
}
