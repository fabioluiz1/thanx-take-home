import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { RewardsList } from "./RewardsList";
import rewardsReducer from "../../store/rewardsSlice";
import userReducer from "../../store/userSlice";
import redemptionReducer from "../../store/redemptionSlice";

vi.mock("../../services/api", () => ({
  apiClient: {
    get: vi.fn(),
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

import { apiClient } from "../../services/api";

const createTestStore = () =>
  configureStore({
    reducer: {
      rewards: rewardsReducer,
      user: userReducer,
      redemption: redemptionReducer,
    },
    preloadedState: {
      user: {
        user: { id: 1, email: "test@example.com", points_balance: 500 },
        loading: false,
        error: null,
        fetched: false,
      },
      redemption: { redeeming: false, error: null, lastRedemption: null },
    },
  });

const renderWithProvider = () => {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <RewardsList />
    </Provider>,
  );
};

describe("RewardsList", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("shows loading skeletons initially", async () => {
    let resolvePromise: (value: unknown[]) => void;
    vi.mocked(apiClient.get).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        }),
    );
    renderWithProvider();

    expect(screen.getByTestId("rewards-loading")).toBeInTheDocument();
    expect(screen.getAllByTestId("reward-card-skeleton")).toHaveLength(6);

    // Resolve the pending promise to allow cleanup
    resolvePromise!([]);
    await waitFor(() => {
      expect(screen.queryByTestId("rewards-loading")).not.toBeInTheDocument();
    });
  });

  it("displays rewards after loading", async () => {
    const mockRewards = [
      {
        id: 1,
        name: "Free Coffee",
        description: "A free coffee",
        points_cost: 100,
        image_url: null,
        available: true,
      },
      {
        id: 2,
        name: "Free Pastry",
        description: "A free pastry",
        points_cost: 150,
        image_url: null,
        available: true,
      },
    ];
    vi.mocked(apiClient.get).mockResolvedValue(mockRewards);
    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("rewards-list")).toBeInTheDocument();
    });

    expect(screen.getAllByTestId("reward-card")).toHaveLength(2);
    expect(screen.getByText("Free Coffee")).toBeInTheDocument();
    expect(screen.getByText("Free Pastry")).toBeInTheDocument();
  });

  it("shows error state on failure", async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error("Network error"));
    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("rewards-error")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Failed to load rewards. Please try again later."),
    ).toBeInTheDocument();
  });

  it("shows empty state when no rewards", async () => {
    vi.mocked(apiClient.get).mockResolvedValue([]);
    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("rewards-empty")).toBeInTheDocument();
    });

    expect(
      screen.getByText("No rewards available at this time."),
    ).toBeInTheDocument();
  });

  it("renders section in all states", async () => {
    vi.mocked(apiClient.get).mockResolvedValue([]);
    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("rewards-empty")).toBeInTheDocument();
    });
  });
});
