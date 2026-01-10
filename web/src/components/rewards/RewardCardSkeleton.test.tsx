import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RewardCardSkeleton } from "./RewardCardSkeleton";

describe("RewardCardSkeleton", () => {
  it("renders skeleton placeholder", () => {
    render(<RewardCardSkeleton />);
    expect(screen.getByTestId("reward-card-skeleton")).toBeInTheDocument();
  });

  it("has accessible loading structure", () => {
    const { container } = render(<RewardCardSkeleton />);
    const card = container.querySelector('[class*="card"]');
    expect(card).toBeInTheDocument();
  });
});
