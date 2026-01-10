import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchCurrentUser } from "../../store/userSlice";

export function PointsBalance() {
  const dispatch = useAppDispatch();
  const { user, loading, error, fetched } = useAppSelector(
    (state) => state.user,
  );

  useEffect(() => {
    if (!fetched && !loading) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, fetched, loading]);

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
