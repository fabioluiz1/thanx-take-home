import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import App from "./App";
import userReducer from "./store/userSlice";
import rewardsReducer from "./store/rewardsSlice";
import redemptionReducer from "./store/redemptionSlice";
import redemptionHistoryReducer from "./store/redemptionHistorySlice";

vi.mock("./services/api", () => ({
  apiClient: {
    get: vi.fn().mockImplementation((path: string) => {
      if (path === "/users/me") {
        return Promise.resolve({
          id: 1,
          email: "test@example.com",
          points_balance: 500,
        });
      }
      if (path === "/rewards") {
        return Promise.resolve([
          { id: 1, name: "Free Coffee", points_cost: 100, available: true },
        ]);
      }
      return Promise.reject(new Error("Unknown path"));
    }),
    post: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
}));

const createTestStore = () =>
  configureStore({
    reducer: {
      user: userReducer,
      rewards: rewardsReducer,
      redemption: redemptionReducer,
      redemptionHistory: redemptionHistoryReducer,
    },
  });

describe("App", () => {
  it("renders Rewards App heading", async () => {
    render(
      <Provider store={createTestStore()}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>,
    );
    expect(screen.getByText(/Rewards App/i)).toBeInTheDocument();

    // Wait for async operations to complete to avoid act() warnings
    await waitFor(() => {
      expect(screen.getByTestId("points-balance")).toBeInTheDocument();
    });
  });
});
