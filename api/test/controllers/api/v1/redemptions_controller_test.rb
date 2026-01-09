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

      test "index returns user's redemptions in reverse chronological order" do
        # Clean up existing redemptions
        @user.redemptions.destroy_all

        # Create redemptions at different times
        redemption1 = Redemption.create!(
          user: @user,
          reward: @reward,
          points_spent: @reward.points_cost,
          redeemed_at: 2.days.ago
        )
        redemption2 = Redemption.create!(
          user: @user,
          reward: rewards(:free_dessert),
          points_spent: rewards(:free_dessert).points_cost,
          redeemed_at: 1.day.ago
        )
        redemption3 = Redemption.create!(
          user: @user,
          reward: @reward,
          points_spent: @reward.points_cost,
          redeemed_at: Time.current
        )

        get api_v1_redemptions_url,
            headers: { "X-User-Id" => @user.id.to_s }

        assert_response :success
        json = JSON.parse(response.body)

        assert_equal 3, json.length
        assert_equal redemption3.id, json[0]["id"]
        assert_equal redemption2.id, json[1]["id"]
        assert_equal redemption1.id, json[2]["id"]
      end

      test "index scopes to current user" do
        # Clean up existing redemptions
        @user.redemptions.destroy_all

        other_user = User.create!(email: "other@example.com", points_balance: 1000)

        # Create redemptions for different users
        user_redemption = Redemption.create!(
          user: @user,
          reward: @reward,
          points_spent: @reward.points_cost,
          redeemed_at: Time.current
        )
        other_redemption = Redemption.create!(
          user: other_user,
          reward: @reward,
          points_spent: @reward.points_cost,
          redeemed_at: Time.current
        )

        get api_v1_redemptions_url,
            headers: { "X-User-Id" => @user.id.to_s }

        assert_response :success
        json = JSON.parse(response.body)

        assert_equal 1, json.length
        assert_equal user_redemption.id, json[0]["id"]
        refute_includes json.map { |r| r["id"] }, other_redemption.id
      end

      test "index eager loads rewards to prevent N+1 queries" do
        # Clean up existing redemptions
        @user.redemptions.destroy_all

        # Create a redemption
        Redemption.create!(
          user: @user,
          reward: @reward,
          points_spent: @reward.points_cost,
          redeemed_at: Time.current
        )

        # Count queries during the request
        queries_count = 0
        query_counter = lambda do |_name, _start, _finish, _id, payload|
          queries_count += 1 unless payload[:name] == "SCHEMA"
        end

        ActiveSupport::Notifications.subscribed(query_counter, "sql.active_record") do
          get api_v1_redemptions_url,
              headers: { "X-User-Id" => @user.id.to_s }
        end

        assert_response :success
        # Should execute only 3 queries: 1 for user lookup, 1 for redemptions with rewards eager loaded
        assert_operator queries_count, :<=, 3
      end

      test "index returns empty array when no redemptions" do
        # Clean up existing redemptions
        @user.redemptions.destroy_all

        get api_v1_redemptions_url,
            headers: { "X-User-Id" => @user.id.to_s }

        assert_response :success
        json = JSON.parse(response.body)

        assert_equal [], json
      end
    end
  end
end
