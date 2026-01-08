class RedemptionResource
  include Alba::Resource

  attributes :id, :points_spent, :redeemed_at

  one :reward, resource: RewardResource
end
