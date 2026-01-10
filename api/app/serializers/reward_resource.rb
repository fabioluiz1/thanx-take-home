class RewardResource
  include Alba::Resource

  attributes :id, :name, :description, :points_cost, :image_url, :available
end
