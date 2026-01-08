import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { RewardCard } from "./RewardCard";
import userReducer from "../../store/userSlice";
import rewardsReducer from "../../store/rewardsSlice";
import redemptionReducer from "../../store/redemptionSlice";
import type { Reward } from "../../types/reward";
import type { ReactNode } from "react";

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

const mockReward: Reward = {
  id: 1,
  name: "Free Coffee",
  description: "Enjoy a complimentary coffee of your choice.",
  points_cost: 100,
  image_url: "https://example.com/coffee.jpg",
  available: true,
};

const createTestStore = (userPoints: number = 500) =>
  configureStore({
    reducer: {
      user: userReducer,
      rewards: rewardsReducer,
      redemption: redemptionReducer,
    },
    preloadedState: {
      user: {
        user: { id: 1, email: "test@example.com", points_balance: userPoints },
        loading: false,
        error: null,
      },
      rewards: { rewards: [], loading: false, error: null },
      redemption: { redeeming: false, error: null, lastRedemption: null },
    },
  });

const renderWithProvider = (
  component: ReactNode,
  { userPoints = 500 }: { userPoints?: number } = {},
) => {
  const store = createTestStore(userPoints);
  return render(<Provider store={store}>{component}</Provider>);
};

describe("RewardCard", () => {
  it("renders reward name", () => {
    renderWithProvider(<RewardCard reward={mockReward} />);
    expect(screen.getByText("Free Coffee")).toBeInTheDocument();
  });

  it("renders reward description", () => {
    renderWithProvider(<RewardCard reward={mockReward} />);
    expect(
      screen.getByText("Enjoy a complimentary coffee of your choice."),
    ).toBeInTheDocument();
  });

  it("renders points cost with formatting", () => {
    renderWithProvider(
      <RewardCard reward={{ ...mockReward, points_cost: 1500 }} />,
    );
    expect(screen.getByTestId("points-badge")).toHaveTextContent("1,500 pts");
  });

  it("renders image with alt text", () => {
    renderWithProvider(<RewardCard reward={mockReward} />);
    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("src", mockReward.image_url);
    expect(image).toHaveAttribute("alt", mockReward.name);
  });

  it("shows out of stock badge when unavailable", () => {
    renderWithProvider(
      <RewardCard reward={{ ...mockReward, available: false }} />,
    );
    expect(screen.getByTestId("out-of-stock-badge")).toHaveTextContent(
      "Out of Stock",
    );
  });

  it("does not show out of stock badge when available", () => {
    renderWithProvider(<RewardCard reward={mockReward} />);
    expect(screen.queryByTestId("out-of-stock-badge")).not.toBeInTheDocument();
  });

  it("handles missing description", () => {
    renderWithProvider(
      <RewardCard reward={{ ...mockReward, description: null }} />,
    );
    expect(screen.getByText("Free Coffee")).toBeInTheDocument();
    expect(
      screen.queryByText("Enjoy a complimentary coffee of your choice."),
    ).not.toBeInTheDocument();
  });

  it("handles missing image", () => {
    renderWithProvider(
      <RewardCard reward={{ ...mockReward, image_url: null }} />,
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders RedeemButton", () => {
    renderWithProvider(<RewardCard reward={mockReward} />);
    expect(screen.getByTestId("redeem-button")).toBeInTheDocument();
  });

  it('shows "Redeem" button when user has sufficient points', () => {
    renderWithProvider(<RewardCard reward={mockReward} />, { userPoints: 500 });
    expect(screen.getByTestId("redeem-button")).toHaveTextContent("Redeem");
    expect(screen.getByTestId("redeem-button")).not.toBeDisabled();
  });

  it('shows "Not Enough Points" when user has insufficient points', () => {
    renderWithProvider(<RewardCard reward={mockReward} />, { userPoints: 50 });
    expect(screen.getByTestId("redeem-button")).toHaveTextContent(
      "Not Enough Points",
    );
    expect(screen.getByTestId("redeem-button")).toBeDisabled();
  });

  it("opens modal when redeem button clicked", () => {
    renderWithProvider(<RewardCard reward={mockReward} />);

    fireEvent.click(screen.getByTestId("redeem-button"));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Confirm Redemption")).toBeInTheDocument();
  });

  it("closes modal when cancel button clicked", () => {
    renderWithProvider(<RewardCard reward={mockReward} />);

    fireEvent.click(screen.getByTestId("redeem-button"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("cancel-button"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
