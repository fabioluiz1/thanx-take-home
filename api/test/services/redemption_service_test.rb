require "test_helper"

class RedemptionServiceTest < ActiveSupport::TestCase
  setup do
    @user = users(:demo)
    @reward = rewards(:free_coffee)
  end

  test "successful redemption creates redemption and deducts points" do
    initial_balance = @user.points_balance
    points_cost = @reward.points_cost

    redemption = RedemptionService.redeem(user_id: @user.id, reward_id: @reward.id)

    assert_kind_of Redemption, redemption
    assert_equal @user.id, redemption.user_id
    assert_equal @reward.id, redemption.reward_id
    assert_equal points_cost, redemption.points_spent
    assert_not_nil redemption.redeemed_at

    @user.reload
    assert_equal initial_balance - points_cost, @user.points_balance
  end

  test "raises InsufficientPointsError when user has insufficient points" do
    @user.update!(points_balance: @reward.points_cost - 1)

    assert_raises RedemptionService::InsufficientPointsError do
      RedemptionService.redeem(user_id: @user.id, reward_id: @reward.id)
    end

    @user.reload
    assert_equal @reward.points_cost - 1, @user.points_balance
    assert_equal 0, Redemption.where(user: @user, reward: @reward).count - 1
  end

  test "raises RewardUnavailableError when reward is unavailable" do
    @reward.update!(available: false)
    initial_balance = @user.points_balance

    assert_raises RedemptionService::RewardUnavailableError do
      RedemptionService.redeem(user_id: @user.id, reward_id: @reward.id)
    end

    @user.reload
    assert_equal initial_balance, @user.points_balance
  end

  test "raises ActiveRecord::RecordNotFound when user not found" do
    assert_raises ActiveRecord::RecordNotFound do
      RedemptionService.redeem(user_id: -1, reward_id: @reward.id)
    end
  end

  test "raises ActiveRecord::RecordNotFound when reward not found" do
    assert_raises ActiveRecord::RecordNotFound do
      RedemptionService.redeem(user_id: @user.id, reward_id: -1)
    end
  end

  test "concurrent requests do not overdraw user balance" do
    @user.update!(points_balance: @reward.points_cost)

    threads = 2.times.map do
      Thread.new do
        RedemptionService.redeem(user_id: @user.id, reward_id: @reward.id)
      rescue RedemptionService::InsufficientPointsError
        :insufficient_points
      end
    end

    results = threads.map(&:value)

    @user.reload
    assert @user.points_balance >= 0, "Balance should never go negative"

    redemption_count = results.count { |r| r.is_a?(Redemption) }
    insufficient_count = results.count { |r| r == :insufficient_points }

    assert_equal 1, redemption_count, "Only one redemption should succeed"
    assert_equal 1, insufficient_count, "One request should fail with insufficient points"
    assert_equal 0, @user.points_balance
  end
end
