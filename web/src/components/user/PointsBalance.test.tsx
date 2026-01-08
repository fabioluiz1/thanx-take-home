import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { PointsBalance } from "./PointsBalance";
import userReducer from "../../store/userSlice";

vi.mock("../../services/api", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

import { apiClient } from "../../services/api";

const createTestStore = () =>
  configureStore({
    reducer: { user: userReducer },
  });

describe("PointsBalance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state initially", () => {
    vi.mocked(apiClient.get).mockImplementation(() => new Promise(() => {}));

    render(
      <Provider store={createTestStore()}>
        <PointsBalance />
      </Provider>,
    );

    expect(screen.getByTestId("points-loading")).toHaveTextContent("Loading...");
  });

  it("displays points balance after loading", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      id: 1,
      email: "test@example.com",
      points_balance: 500,
    });

    render(
      <Provider store={createTestStore()}>
        <PointsBalance />
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("points-balance")).toHaveTextContent(
        "500 points",
      );
    });
  });

  it("formats large numbers with locale", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      id: 1,
      email: "test@example.com",
      points_balance: 1500,
    });

    render(
      <Provider store={createTestStore()}>
        <PointsBalance />
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("points-balance")).toHaveTextContent(
        "1,500 points",
      );
    });
  });

  it("shows error state on failure", async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error("Network error"));

    render(
      <Provider store={createTestStore()}>
        <PointsBalance />
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("points-error")).toHaveTextContent(
        "Error: Network error",
      );
    });
  });
});
