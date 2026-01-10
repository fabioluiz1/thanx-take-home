import type { Reward } from "./reward";

export interface Redemption {
  id: number;
  points_spent: number;
  redeemed_at: string;
  reward: Reward;
}

export interface RedemptionState {
  redeeming: boolean;
  error: string | null;
  lastRedemption: Redemption | null;
}
