class Redemption < ApplicationRecord
  belongs_to :user
  belongs_to :reward

  validates :points_spent, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validates :redeemed_at, presence: true
end
