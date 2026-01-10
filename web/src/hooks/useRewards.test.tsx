import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { useRewards } from "./useRewards";
import rewardsReducer from "../store/rewardsSlice";
import type { ReactNode } from "react";

vi.mock("../services/api", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

import { apiClient } from "../services/api";

const createTestStore = () =>
  configureStore({
    reducer: { rewards: rewardsReducer },
  });

const createWrapper = () => {
  const store = createTestStore();
  return ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

describe("useRewards", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns loading state initially", async () => {
    let resolvePromise: (value: unknown[]) => void;
    vi.mocked(apiClient.get).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        }),
    );

    const { result } = renderHook(() => useRewards(), {
      wrapper: createWrapper(),
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.rewards).toEqual([]);
    expect(result.current.error).toBeNull();

    // Resolve the pending promise to allow cleanup
    resolvePromise!([]);
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("returns rewards after loading", async () => {
    const mockRewards = [
      { id: 1, name: "Free Coffee", points_cost: 100, available: true },
      { id: 2, name: "Free Pastry", points_cost: 150, available: true },
    ];
    vi.mocked(apiClient.get).mockResolvedValue(mockRewards);

    const { result } = renderHook(() => useRewards(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.rewards).toEqual(mockRewards);
    expect(result.current.error).toBeNull();
  });

  it("returns error state on failure", async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useRewards(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Network error");
    expect(result.current.rewards).toEqual([]);
  });
});
