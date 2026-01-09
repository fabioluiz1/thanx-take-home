import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { RedemptionHistory } from "./RedemptionHistory";
import redemptionHistoryReducer from "../../store/redemptionHistorySlice";
import userReducer from "../../store/userSlice";

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
      redemptionHistory: redemptionHistoryReducer,
      user: userReducer,
    },
    preloadedState: {
      user: {
        user: { id: 1, email: "test@example.com", points_balance: 500 },
        loading: false,
        error: null,
      },
    },
  });

const renderWithProvider = () => {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <RedemptionHistory />
    </Provider>,
  );
};

describe("RedemptionHistory", () => {
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

    expect(screen.getByTestId("redemptions-loading")).toBeInTheDocument();
    expect(screen.getAllByTestId("redemption-skeleton")).toHaveLength(6);

    // Resolve the pending promise to allow cleanup
    resolvePromise!([]);
    await waitFor(() => {
      expect(
        screen.queryByTestId("redemptions-loading"),
      ).not.toBeInTheDocument();
    });
  });

  it("displays redemptions after loading", async () => {
    const mockRedemptions = [
      {
        id: 1,
        points_spent: 100,
        redeemed_at: "2026-01-08T12:00:00.000Z",
        reward: {
          id: 1,
          name: "Free Coffee",
          description: "A free coffee",
          points_cost: 100,
          image_url: "https://example.com/coffee.jpg",
          available: true,
        },
      },
      {
        id: 2,
        points_spent: 150,
        redeemed_at: "2026-01-07T12:00:00.000Z",
        reward: {
          id: 2,
          name: "Free Pastry",
          description: "A free pastry",
          points_cost: 150,
          image_url: null,
          available: true,
        },
      },
    ];
    vi.mocked(apiClient.get).mockResolvedValue(mockRedemptions);
    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("redemptions-list")).toBeInTheDocument();
    });

    expect(screen.getByText("Free Coffee")).toBeInTheDocument();
    expect(screen.getByText("Free Pastry")).toBeInTheDocument();
    expect(screen.getByText("100 pts")).toBeInTheDocument();
    expect(screen.getByText("150 pts")).toBeInTheDocument();
  });

  it("shows error state on failure", async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error("Network error"));
    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("redemptions-error")).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        "Failed to load redemption history. Please try again later.",
      ),
    ).toBeInTheDocument();
  });

  it("shows empty state when no redemptions", async () => {
    vi.mocked(apiClient.get).mockResolvedValue([]);
    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("redemptions-empty")).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        "No redemptions yet. Redeem your first reward to see your history!",
      ),
    ).toBeInTheDocument();
  });

  it("renders heading in all states", async () => {
    vi.mocked(apiClient.get).mockResolvedValue([]);
    renderWithProvider();

    expect(screen.getByText("Redemption History")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("redemptions-empty")).toBeInTheDocument();
    });
  });
});
