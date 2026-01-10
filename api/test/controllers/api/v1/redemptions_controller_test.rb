require "test_helper"

module Api
  module V1
    class RedemptionsControllerTest < ActionDispatch::IntegrationTest
      setup do
        @user = users(:demo)
        @reward = rewards(:free_coffee)
      end

      test "creates redemption with sufficient points" do
        initial_balance = @user.points_balance

        post api_v1_redemptions_url,
             params: { reward_id: @reward.id },
             headers: { "X-User-Id" => @user.id.to_s }

        assert_response :created
        json = JSON.parse(response.body)

        assert_equal @reward.points_cost, json["points_spent"]
        assert_not_nil json["redeemed_at"]
        assert_equal @reward.id, json["reward"]["id"]
        assert_equal @reward.name, json["reward"]["name"]

        @user.reload
        assert_equal initial_balance - @reward.points_cost, @user.points_balance
      end

      test "returns 422 with insufficient points" do
        @user.update!(points_balance: @reward.points_cost - 1)

        post api_v1_redemptions_url,
             params: { reward_id: @reward.id },
             headers: { "X-User-Id" => @user.id.to_s }

        assert_response :unprocessable_entity
        json = JSON.parse(response.body)
        assert_equal "Insufficient points", json["error"]
      end

      test "returns 422 for unavailable reward" do
        @reward.update!(available: false)

        post api_v1_redemptions_url,
             params: { reward_id: @reward.id },
             headers: { "X-User-Id" => @user.id.to_s }

        assert_response :unprocessable_entity
        json = JSON.parse(response.body)
        assert_equal "Reward unavailable", json["error"]
      end

      test "returns 404 for non-existent reward" do
        post api_v1_redemptions_url,
             params: { reward_id: -1 },
             headers: { "X-User-Id" => @user.id.to_s }

        assert_response :not_found
        json = JSON.parse(response.body)
        assert_equal "Reward not found", json["error"]
      end

      test "uses current_user from X-User-Id header" do
        other_user = User.create!(email: "other@example.com", points_balance: 1000)

        post api_v1_redemptions_url,
             params: { reward_id: @reward.id },
             headers: { "X-User-Id" => other_user.id.to_s }

        assert_response :created

        other_user.reload
        assert_equal 1000 - @reward.points_cost, other_user.points_balance
      end
    end
  end
end
