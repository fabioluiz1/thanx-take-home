require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "valid user" do
    user = User.new(email: "test@example.com", points_balance: 100)
    assert user.valid?
  end

  test "requires email" do
    user = User.new(points_balance: 100)
    assert_not user.valid?
    assert_includes user.errors[:email], "can't be blank"
  end

  test "requires unique email" do
    User.create!(email: "test@example.com", points_balance: 0)
    user = User.new(email: "test@example.com", points_balance: 0)
    assert_not user.valid?
    assert_includes user.errors[:email], "has already been taken"
  end

  test "validates email format" do
    user = User.new(email: "invalid", points_balance: 0)
    assert_not user.valid?
    assert_includes user.errors[:email], "is invalid"
  end

  test "defaults points_balance to 0" do
    user = User.create!(email: "new@example.com")
    assert_equal 0, user.points_balance
  end

  test "requires non-negative points_balance" do
    user = User.new(email: "test@example.com", points_balance: -1)
    assert_not user.valid?
    assert_includes user.errors[:points_balance], "must be greater than or equal to 0"
  end
end
