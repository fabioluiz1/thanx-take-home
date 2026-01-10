export interface Reward {
  id: number;
  name: string;
  description: string | null;
  points_cost: number;
  image_url: string | null;
  available: boolean;
}

export interface RewardsState {
  rewards: Reward[];
  loading: boolean;
  error: string | null;
  fetched: boolean;
}
