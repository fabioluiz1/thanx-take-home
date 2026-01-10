import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  redeemReward,
  clearRedemptionError,
} from "../../store/redemptionSlice";
import type { Reward } from "../../types/reward";
import { RedeemButton } from "./RedeemButton";
import { RedemptionConfirmModal } from "./RedemptionConfirmModal";
import styles from "./RewardCard.module.css";

interface RewardCardProps {
  reward: Reward;
}

export function RewardCard({ reward }: RewardCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);
  const { redeeming, error } = useAppSelector((state) => state.redemption);
  const cardClasses = [styles.card, !reward.available && styles.unavailable]
    .filter(Boolean)
    .join(" ");

  const handleOpenModal = () => {
    dispatch(clearRedemptionError());
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    dispatch(clearRedemptionError());
  };

  const handleConfirmRedeem = async () => {
    const result = await dispatch(redeemReward(reward.id));
    if (redeemReward.fulfilled.match(result)) {
      setShowModal(false);
    }
  };

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
        <RedeemButton
          reward={reward}
          userPoints={user?.points_balance ?? 0}
          onClick={handleOpenModal}
          disabled={redeeming}
        />
      </div>
      <RedemptionConfirmModal
        reward={reward}
        userPoints={user?.points_balance ?? 0}
        isOpen={showModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmRedeem}
        isRedeeming={redeeming}
        error={error}
      />
    </article>
  );
}
