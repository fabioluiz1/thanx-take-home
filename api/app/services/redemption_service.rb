class RedemptionService
  class InsufficientPointsError < StandardError; end
  class RewardUnavailableError < StandardError; end

  def self.redeem(user_id:, reward_id:)
    new(user_id:, reward_id:).redeem
  end

  def initialize(user_id:, reward_id:)
    @user_id = user_id
    @reward_id = reward_id
  end

  def redeem
    ActiveRecord::Base.transaction do
      user = User.lock.find(@user_id)
      reward = Reward.find(@reward_id)

      raise RewardUnavailableError unless reward.available
      raise InsufficientPointsError if user.points_balance < reward.points_cost

      user.update!(points_balance: user.points_balance - reward.points_cost)

      Redemption.create!(
        user:,
        reward:,
        points_spent: reward.points_cost,
        redeemed_at: Time.current
      )
    end
  end
end
