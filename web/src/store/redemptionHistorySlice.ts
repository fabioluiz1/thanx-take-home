import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient, ApiError } from "../services/api";
import type {
  Redemption,
  RedemptionHistoryState,
} from "../types/redemption";

const initialState: RedemptionHistoryState = {
  redemptions: [],
  loading: false,
  error: null,
  fetched: false,
};

export const fetchRedemptionHistory = createAsyncThunk<
  Redemption[],
  void,
  { rejectValue: string }
>("redemptionHistory/fetch", async (_, { rejectWithValue }) => {
  try {
    const redemptions = await apiClient.get<Redemption[]>("/redemptions");
    return redemptions;
  } catch (error) {
    if (error instanceof ApiError) {
      return rejectWithValue(error.message);
    }
    throw error;
  }
});

const redemptionHistorySlice = createSlice({
  name: "redemptionHistory",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRedemptionHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRedemptionHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.redemptions = action.payload;
        state.fetched = true;
      })
      .addCase(fetchRedemptionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch redemption history";
      });
  },
});

export default redemptionHistorySlice.reducer;
