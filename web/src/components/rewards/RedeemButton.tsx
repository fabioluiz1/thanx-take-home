import type { Reward } from "../../types/reward";
import styles from "./RedeemButton.module.css";

interface RedeemButtonProps {
  reward: Reward;
  userPoints: number;
  onClick: () => void;
  disabled?: boolean;
}

export function RedeemButton({
  reward,
  userPoints,
  onClick,
  disabled = false,
}: RedeemButtonProps) {
  const canAfford = userPoints >= reward.points_cost;
  const canRedeem = reward.available && canAfford && !disabled;

  let buttonText = "Redeem";
  if (!reward.available) {
    buttonText = "Unavailable";
  } else if (!canAfford) {
    buttonText = "Not Enough Points";
  }

  return (
    <button
      className={styles.button}
      onClick={onClick}
      disabled={!canRedeem}
      data-testid="redeem-button"
    >
      {buttonText}
    </button>
  );
}
