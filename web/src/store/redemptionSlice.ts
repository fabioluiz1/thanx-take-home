import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient, ApiError } from "../services/api";
import { fetchCurrentUser } from "./userSlice";
import type { Redemption, RedemptionState } from "../types/redemption";
import type { AppDispatch } from "./index";

const initialState: RedemptionState = {
  redeeming: false,
  error: null,
  lastRedemption: null,
};

export const redeemReward = createAsyncThunk<
  Redemption,
  number,
  { dispatch: AppDispatch; rejectValue: string }
>("redemption/redeem", async (rewardId, { dispatch, rejectWithValue }) => {
  try {
    const redemption = await apiClient.post<Redemption>("/redemptions", {
      reward_id: rewardId,
    });
    try {
      await dispatch(fetchCurrentUser());
    } catch {
      // Continue even if user fetch fails - redemption succeeded
    }
    return redemption;
  } catch (error) {
    if (error instanceof ApiError) {
      return rejectWithValue(error.message);
    }
    throw error;
  }
});

const redemptionSlice = createSlice({
  name: "redemption",
  initialState,
  reducers: {
    clearRedemptionError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(redeemReward.pending, (state) => {
        state.redeeming = true;
        state.error = null;
      })
      .addCase(redeemReward.fulfilled, (state, action) => {
        state.redeeming = false;
        state.lastRedemption = action.payload;
      })
      .addCase(redeemReward.rejected, (state, action) => {
        state.redeeming = false;
        state.error = action.payload || "Failed to redeem reward";
      });
  },
});

export const { clearRedemptionError } = redemptionSlice.actions;
export default redemptionSlice.reducer;
