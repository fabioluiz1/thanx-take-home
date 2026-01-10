import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import rewardsReducer from "./rewardsSlice";
import redemptionReducer from "./redemptionSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    rewards: rewardsReducer,
    redemption: redemptionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
