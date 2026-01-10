import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import App from "./App";
import userReducer from "./store/userSlice";

vi.mock("./services/api", () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({
      id: 1,
      email: "test@example.com",
      points_balance: 500,
    }),
  },
}));

const createTestStore = () =>
  configureStore({
    reducer: { user: userReducer },
  });

describe("App", () => {
  it("renders Rewards App heading", async () => {
    render(
      <Provider store={createTestStore()}>
        <App />
      </Provider>,
    );
    expect(screen.getByText(/Rewards App/i)).toBeInTheDocument();

    // Wait for async operations to complete to avoid act() warnings
    await waitFor(() => {
      expect(screen.getByTestId("points-balance")).toBeInTheDocument();
    });
  });
});
