class User < ApplicationRecord
  has_many :redemptions

  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :points_balance, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
end
