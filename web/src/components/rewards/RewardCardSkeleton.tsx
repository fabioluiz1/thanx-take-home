import styles from "./RewardCardSkeleton.module.css";

export function RewardCardSkeleton() {
  return (
    <div
      className={styles.card}
      data-testid="reward-card-skeleton"
      role="status"
      aria-label="Loading reward"
    >
      <div className={`${styles.shimmer} ${styles.image}`} />
      <div className={styles.content}>
        <div className={`${styles.shimmer} ${styles.title}`} />
        <div className={`${styles.shimmer} ${styles.descriptionLine}`} />
        <div className={`${styles.shimmer} ${styles.descriptionLineShort}`} />
        <div className={`${styles.shimmer} ${styles.badge}`} />
      </div>
    </div>
  );
}
