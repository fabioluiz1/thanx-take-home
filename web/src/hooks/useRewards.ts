import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchRewards } from "../store/rewardsSlice";

export function useRewards() {
  const dispatch = useAppDispatch();
  const { rewards, loading, error, fetched } = useAppSelector(
    (state) => state.rewards,
  );

  useEffect(() => {
    if (!fetched && !loading) {
      dispatch(fetchRewards());
    }
  }, [dispatch, fetched, loading]);

  return { rewards, loading, error };
}
