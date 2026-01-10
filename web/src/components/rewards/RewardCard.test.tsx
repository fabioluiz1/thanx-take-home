import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RewardCard } from "./RewardCard";
import type { Reward } from "../../types/reward";

const mockReward: Reward = {
  id: 1,
  name: "Free Coffee",
  description: "Enjoy a complimentary coffee of your choice.",
  points_cost: 100,
  image_url: "https://example.com/coffee.jpg",
  available: true,
};

describe("RewardCard", () => {
  it("renders reward name", () => {
    render(<RewardCard reward={mockReward} />);
    expect(screen.getByText("Free Coffee")).toBeInTheDocument();
  });

  it("renders reward description", () => {
    render(<RewardCard reward={mockReward} />);
    expect(
      screen.getByText("Enjoy a complimentary coffee of your choice."),
    ).toBeInTheDocument();
  });

  it("renders points cost with formatting", () => {
    render(<RewardCard reward={{ ...mockReward, points_cost: 1500 }} />);
    expect(screen.getByTestId("points-badge")).toHaveTextContent("1,500 pts");
  });

  it("renders image with alt text", () => {
    render(<RewardCard reward={mockReward} />);
    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("src", mockReward.image_url);
    expect(image).toHaveAttribute("alt", mockReward.name);
  });

  it("shows out of stock badge when unavailable", () => {
    render(<RewardCard reward={{ ...mockReward, available: false }} />);
    expect(screen.getByTestId("out-of-stock-badge")).toHaveTextContent(
      "Out of Stock",
    );
  });

  it("does not show out of stock badge when available", () => {
    render(<RewardCard reward={mockReward} />);
    expect(screen.queryByTestId("out-of-stock-badge")).not.toBeInTheDocument();
  });

  it("handles missing description", () => {
    render(<RewardCard reward={{ ...mockReward, description: null }} />);
    expect(screen.getByText("Free Coffee")).toBeInTheDocument();
    expect(
      screen.queryByText("Enjoy a complimentary coffee of your choice."),
    ).not.toBeInTheDocument();
  });

  it("handles missing image", () => {
    render(<RewardCard reward={{ ...mockReward, image_url: null }} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
