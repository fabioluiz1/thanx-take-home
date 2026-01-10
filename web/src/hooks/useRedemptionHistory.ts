import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchRedemptionHistory } from "../store/redemptionHistorySlice";

export function useRedemptionHistory() {
  const dispatch = useAppDispatch();
  const { redemptions, loading, error, fetched } = useAppSelector(
    (state) => state.redemptionHistory,
  );

  useEffect(() => {
    if (!fetched && !loading) {
      dispatch(fetchRedemptionHistory());
    }
  }, [dispatch, fetched, loading]);

  return { redemptions, loading, error };
}
