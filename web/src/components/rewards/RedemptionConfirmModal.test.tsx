import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RedemptionConfirmModal } from "./RedemptionConfirmModal";
import type { Reward } from "../../types/reward";

const mockReward: Reward = {
  id: 1,
  name: "Free Coffee",
  description: "A complimentary coffee",
  points_cost: 100,
  image_url: "https://example.com/coffee.jpg",
  available: true,
};

describe("RedemptionConfirmModal", () => {
  const defaultProps = {
    reward: mockReward,
    userPoints: 500,
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    isRedeeming: false,
    error: null,
  };

  it("renders reward name", () => {
    render(<RedemptionConfirmModal {...defaultProps} />);
    expect(screen.getByText("Free Coffee")).toBeInTheDocument();
  });

  it("displays cost", () => {
    render(<RedemptionConfirmModal {...defaultProps} />);
    expect(screen.getByTestId("redemption-cost")).toHaveTextContent("100 pts");
  });

  it("displays balance after redemption", () => {
    render(<RedemptionConfirmModal {...defaultProps} />);
    expect(screen.getByTestId("balance-after")).toHaveTextContent("400 pts");
  });

  it("formats large numbers with locale", () => {
    render(
      <RedemptionConfirmModal
        {...defaultProps}
        reward={{ ...mockReward, points_cost: 1500 }}
        userPoints={5000}
      />,
    );
    expect(screen.getByTestId("redemption-cost")).toHaveTextContent("1,500 pts");
    expect(screen.getByTestId("balance-after")).toHaveTextContent("3,500 pts");
  });

  it("calls onConfirm when confirm button clicked", () => {
    const onConfirm = vi.fn();
    render(<RedemptionConfirmModal {...defaultProps} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByTestId("confirm-button"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when cancel button clicked", () => {
    const onClose = vi.fn();
    render(<RedemptionConfirmModal {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByTestId("cancel-button"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows "Redeeming..." when isRedeeming is true', () => {
    render(<RedemptionConfirmModal {...defaultProps} isRedeeming={true} />);
    expect(screen.getByTestId("confirm-button")).toHaveTextContent(
      "Redeeming...",
    );
  });

  it("disables buttons when isRedeeming is true", () => {
    render(<RedemptionConfirmModal {...defaultProps} isRedeeming={true} />);
    expect(screen.getByTestId("confirm-button")).toBeDisabled();
    expect(screen.getByTestId("cancel-button")).toBeDisabled();
  });

  it("displays error message when error prop is set", () => {
    render(
      <RedemptionConfirmModal {...defaultProps} error="Insufficient points" />,
    );
    expect(screen.getByTestId("redemption-error")).toHaveTextContent(
      "Insufficient points",
    );
  });

  it("does not display error when error is null", () => {
    render(<RedemptionConfirmModal {...defaultProps} error={null} />);
    expect(screen.queryByTestId("redemption-error")).not.toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(<RedemptionConfirmModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
