require "test_helper"

class RewardTest < ActiveSupport::TestCase
  test "valid reward" do
    reward = Reward.new(name: "Free Coffee", points_cost: 100)
    assert reward.valid?
  end

  test "requires name" do
    reward = Reward.new(points_cost: 100)
    assert_not reward.valid?
    assert_includes reward.errors[:name], "can't be blank"
  end

  test "requires points_cost" do
    reward = Reward.new(name: "Free Coffee")
    assert_not reward.valid?
    assert_includes reward.errors[:points_cost], "can't be blank"
  end

  test "requires points_cost greater than 0" do
    reward = Reward.new(name: "Free Coffee", points_cost: 0)
    assert_not reward.valid?
    assert_includes reward.errors[:points_cost], "must be greater than 0"
  end

  test "does not allow negative points_cost" do
    reward = Reward.new(name: "Free Coffee", points_cost: -50)
    assert_not reward.valid?
    assert_includes reward.errors[:points_cost], "must be greater than 0"
  end

  test "defaults available to true" do
    reward = Reward.create!(name: "Free Coffee", points_cost: 100)
    assert reward.available
  end

  test "available scope returns only available rewards" do
    available_count = Reward.available.count
    unavailable_count = Reward.where(available: false).count

    Reward.create!(name: "New Available", points_cost: 100, available: true)
    Reward.create!(name: "New Unavailable", points_cost: 200, available: false)

    assert_equal available_count + 1, Reward.available.count
    assert_equal unavailable_count + 1, Reward.where(available: false).count
  end
end
