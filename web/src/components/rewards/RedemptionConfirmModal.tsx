import { Modal } from "../ui/Modal";
import type { Reward } from "../../types/reward";
import styles from "./RedemptionConfirmModal.module.css";

interface RedemptionConfirmModalProps {
  reward: Reward;
  userPoints: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isRedeeming: boolean;
  error: string | null;
}

export function RedemptionConfirmModal({
  reward,
  userPoints,
  isOpen,
  onClose,
  onConfirm,
  isRedeeming,
  error,
}: RedemptionConfirmModalProps) {
  const pointsAfter = userPoints - reward.points_cost;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Redemption">
      <div className={styles.content}>
        <p className={styles.message}>
          Redeem <strong>{reward.name}</strong>?
        </p>
        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span className={styles.label}>Cost:</span>
            <span className={styles.value} data-testid="redemption-cost">
              {reward.points_cost.toLocaleString()} pts
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Balance after:</span>
            <span className={styles.value} data-testid="balance-after">
              {pointsAfter.toLocaleString()} pts
            </span>
          </div>
        </div>
        {error && (
          <p className={styles.error} data-testid="redemption-error">
            {error}
          </p>
        )}
        <div className={styles.actions}>
          <button
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isRedeeming}
            data-testid="cancel-button"
          >
            Cancel
          </button>
          <button
            className={styles.confirmButton}
            onClick={onConfirm}
            disabled={isRedeeming}
            data-testid="confirm-button"
          >
            {isRedeeming ? "Redeeming..." : "Confirm"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
