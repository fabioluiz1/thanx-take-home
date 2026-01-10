require "test_helper"

class RedemptionTest < ActiveSupport::TestCase
  test "valid redemption" do
    redemption = Redemption.new(
      user: users(:demo),
      reward: rewards(:free_coffee),
      points_spent: 100,
      redeemed_at: Time.current
    )
    assert redemption.valid?
  end

  test "requires user" do
    redemption = Redemption.new(
      reward: rewards(:free_coffee),
      points_spent: 100,
      redeemed_at: Time.current
    )
    assert_not redemption.valid?
    assert_includes redemption.errors[:user], "must exist"
  end

  test "requires reward" do
    redemption = Redemption.new(
      user: users(:demo),
      points_spent: 100,
      redeemed_at: Time.current
    )
    assert_not redemption.valid?
    assert_includes redemption.errors[:reward], "must exist"
  end

  test "requires points_spent" do
    redemption = Redemption.new(
      user: users(:demo),
      reward: rewards(:free_coffee),
      redeemed_at: Time.current
    )
    assert_not redemption.valid?
    assert_includes redemption.errors[:points_spent], "can't be blank"
  end

  test "points_spent must be positive" do
    redemption = Redemption.new(
      user: users(:demo),
      reward: rewards(:free_coffee),
      points_spent: 0,
      redeemed_at: Time.current
    )
    assert_not redemption.valid?
    assert_includes redemption.errors[:points_spent], "must be greater than 0"
  end

  test "requires redeemed_at" do
    redemption = Redemption.new(
      user: users(:demo),
      reward: rewards(:free_coffee),
      points_spent: 100
    )
    assert_not redemption.valid?
    assert_includes redemption.errors[:redeemed_at], "can't be blank"
  end

  test "belongs to user" do
    redemption = redemptions(:demo_redemption)
    assert_equal users(:demo), redemption.user
  end

  test "belongs to reward" do
    redemption = redemptions(:demo_redemption)
    assert_equal rewards(:free_coffee), redemption.reward
  end
end
