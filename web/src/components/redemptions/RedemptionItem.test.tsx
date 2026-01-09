import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RedemptionItem } from "./RedemptionItem";
import type { Redemption } from "../../types/redemption";

const mockRedemption: Redemption = {
  id: 1,
  points_spent: 1500,
  redeemed_at: "2026-01-08T12:00:00.000Z",
  reward: {
    id: 1,
    name: "Free Coffee",
    description: "A free coffee",
    points_cost: 100,
    image_url: "https://example.com/coffee.jpg",
    available: true,
  },
};

describe("RedemptionItem", () => {
  it("renders reward name", () => {
    render(<RedemptionItem redemption={mockRedemption} />);
    expect(screen.getByText("Free Coffee")).toBeInTheDocument();
  });

  it("renders points spent with locale formatting", () => {
    render(<RedemptionItem redemption={mockRedemption} />);
    expect(screen.getByText("1,500 pts")).toBeInTheDocument();
  });

  it("renders formatted date", () => {
    render(<RedemptionItem redemption={mockRedemption} />);
    expect(screen.getByText("Jan 8, 2026")).toBeInTheDocument();
  });

  it("renders reward image when available", () => {
    render(<RedemptionItem redemption={mockRedemption} />);
    const image = screen.getByAltText("Free Coffee");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "https://example.com/coffee.jpg");
  });

  it("handles missing image gracefully", () => {
    const redemptionWithoutImage: Redemption = {
      ...mockRedemption,
      reward: {
        ...mockRedemption.reward,
        image_url: null,
      },
    };
    render(<RedemptionItem redemption={redemptionWithoutImage} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
