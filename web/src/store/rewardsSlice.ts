import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../services/api";
import type { Reward, RewardsState } from "../types/reward";

const initialState: RewardsState = {
  rewards: [],
  loading: false,
  error: null,
  fetched: false,
};

export const fetchRewards = createAsyncThunk(
  "rewards/fetchRewards",
  async () => {
    return apiClient.get<Reward[]>("/rewards");
  },
);

const rewardsSlice = createSlice({
  name: "rewards",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRewards.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fetched = true;
      })
      .addCase(fetchRewards.fulfilled, (state, action) => {
        state.loading = false;
        state.rewards = action.payload;
        state.fetched = true;
      })
      .addCase(fetchRewards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch rewards";
      });
  },
});

export default rewardsSlice.reducer;
