import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import rewardsReducer from "./rewardsSlice";
import redemptionReducer from "./redemptionSlice";
import redemptionHistoryReducer from "./redemptionHistorySlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    rewards: rewardsReducer,
    redemption: redemptionReducer,
    redemptionHistory: redemptionHistoryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
