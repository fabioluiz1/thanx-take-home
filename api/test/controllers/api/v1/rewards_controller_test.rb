require "test_helper"

module Api
  module V1
    class RewardsControllerTest < ActionDispatch::IntegrationTest
      test "returns available rewards ordered by points cost" do
        get api_v1_rewards_url

        assert_response :success
        json = JSON.parse(response.body)

        assert_kind_of Array, json
        available_rewards = Reward.available.order(:points_cost)
        assert_equal available_rewards.count, json.length

        json.each_with_index do |reward_json, index|
          reward = available_rewards[index]
          assert_equal reward.id, reward_json["id"]
          assert_equal reward.name, reward_json["name"]
          assert_equal reward.description, reward_json["description"]
          assert_equal reward.points_cost, reward_json["points_cost"]
          assert_equal reward.image_url, reward_json["image_url"]
          assert_equal reward.available, reward_json["available"]
        end
      end

      test "excludes unavailable rewards" do
        get api_v1_rewards_url

        json = JSON.parse(response.body)
        ids = json.map { |r| r["id"] }

        unavailable = rewards(:unavailable_reward)
        assert_not_includes ids, unavailable.id
      end

      test "returns empty array when no available rewards" do
        Reward.update_all(available: false)
        get api_v1_rewards_url

        assert_response :success
        json = JSON.parse(response.body)
        assert_equal [], json
      end

      test "respects limit parameter" do
        get api_v1_rewards_url, params: { limit: 1 }

        json = JSON.parse(response.body)
        assert_equal 1, json.length
      end

      test "respects offset parameter" do
        get api_v1_rewards_url, params: { limit: 1, offset: 1 }

        json = JSON.parse(response.body)
        first_reward = Reward.available.order(:points_cost).second
        assert_equal first_reward.id, json.first["id"]
      end

      test "enforces max limit" do
        get api_v1_rewards_url, params: { limit: 1000 }

        assert_response :success
      end
    end
  end
end
