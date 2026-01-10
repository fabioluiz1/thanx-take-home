class Reward < ApplicationRecord
  validates :name, presence: true
  validates :points_cost, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validates :available, inclusion: { in: [ true, false ] }

  scope :available, -> { where(available: true) }
end
