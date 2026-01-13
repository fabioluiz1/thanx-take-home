import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RedeemButton } from "./RedeemButton";
import type { Reward } from "../../types/reward";

const mockReward: Reward = {
  id: 1,
  name: "Free Coffee",
  description: "A complimentary coffee",
  points_cost: 100,
  image_url: "https://example.com/coffee.jpg",
  available: true,
};

describe("RedeemButton", () => {
  it('shows "Redeem" when user has sufficient points', () => {
    render(
      <RedeemButton reward={mockReward} userPoints={500} onClick={vi.fn()} />,
    );
    expect(screen.getByTestId("redeem-button")).toHaveTextContent("Redeem");
    expect(screen.getByTestId("redeem-button")).not.toBeDisabled();
  });

  it('shows "Not Enough Points" when user has insufficient points', () => {
    render(
      <RedeemButton reward={mockReward} userPoints={50} onClick={vi.fn()} />,
    );
    expect(screen.getByTestId("redeem-button")).toHaveTextContent(
      "Not Enough Points",
    );
    expect(screen.getByTestId("redeem-button")).toBeDisabled();
  });

  it('shows "Unavailable" when reward is unavailable', () => {
    render(
      <RedeemButton
        reward={{ ...mockReward, available: false }}
        userPoints={500}
        onClick={vi.fn()}
      />,
    );
    expect(screen.getByTestId("redeem-button")).toHaveTextContent(
      "Unavailable",
    );
    expect(screen.getByTestId("redeem-button")).toBeDisabled();
  });

  it("calls onClick when clicked and enabled", () => {
    const onClick = vi.fn();
    render(
      <RedeemButton reward={mockReward} userPoints={500} onClick={onClick} />,
    );

    fireEvent.click(screen.getByTestId("redeem-button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const onClick = vi.fn();
    render(
      <RedeemButton reward={mockReward} userPoints={50} onClick={onClick} />,
    );

    fireEvent.click(screen.getByTestId("redeem-button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("is disabled when disabled prop is true", () => {
    render(
      <RedeemButton
        reward={mockReward}
        userPoints={500}
        onClick={vi.fn()}
        disabled={true}
      />,
    );
    expect(screen.getByTestId("redeem-button")).toBeDisabled();
  });

  it('shows "Unavailable" over "Not Enough Points" when both conditions apply', () => {
    render(
      <RedeemButton
        reward={{ ...mockReward, available: false }}
        userPoints={50}
        onClick={vi.fn()}
      />,
    );
    expect(screen.getByTestId("redeem-button")).toHaveTextContent(
      "Unavailable",
    );
  });
});
