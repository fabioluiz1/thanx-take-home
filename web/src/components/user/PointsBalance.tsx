import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchCurrentUser } from "../../store/userSlice";

export function PointsBalance() {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  if (loading) {
    return <span data-testid="points-loading">Loading...</span>;
  }

  if (error) {
    return <span data-testid="points-error">Error: {error}</span>;
  }

  if (!user) {
    return null;
  }

  return (
    <span data-testid="points-balance">
      {user.points_balance.toLocaleString()} points
    </span>
  );
}
