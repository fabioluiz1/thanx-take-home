import styles from "./RedemptionHistory.module.css";

export function RedemptionItemSkeleton() {
  return (
    <div className={styles.item} data-testid="redemption-skeleton">
      <div className={styles.itemContent}>
        <div
          className={styles.itemImage}
          style={{
            background:
              "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
          }}
        />
        <div className={styles.itemDetails}>
          <div
            style={{
              height: "24px",
              width: "60%",
              marginBottom: "8px",
              background:
                "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
              borderRadius: "4px",
            }}
          />
          <div
            style={{
              height: "16px",
              width: "40%",
              background:
                "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
              borderRadius: "4px",
            }}
          />
        </div>
      </div>
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}
