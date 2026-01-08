export interface User {
  id: number;
  email: string;
  points_balance: number;
}

export interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
