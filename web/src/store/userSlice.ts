import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../services/api";
import type { User, UserState } from "../types/user";

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
  fetched: false,
};

export const fetchCurrentUser = createAsyncThunk(
  "user/fetchCurrentUser",
  async () => {
    return apiClient.get<User>("/users/me");
  },
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.fetched = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch user";
        state.fetched = true;
      });
  },
});

export default userSlice.reducer;
