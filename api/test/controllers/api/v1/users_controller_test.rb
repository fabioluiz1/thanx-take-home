require "test_helper"

module Api
  module V1
    class UsersControllerTest < ActionDispatch::IntegrationTest
      test "returns current user when X-User-Id header provided" do
        user = users(:demo)
        get api_v1_users_me_url, headers: { "X-User-Id" => user.id.to_s }

        assert_response :success
        json = JSON.parse(response.body)
        assert_equal user.id, json["id"]
        assert_equal user.email, json["email"]
        assert_equal user.points_balance, json["points_balance"]
      end

      # NOTE: This test documents the demo fallback behavior.
      # In production, this would return 401 Unauthorized.
      test "returns first user when no header provided" do
        get api_v1_users_me_url

        assert_response :success
        json = JSON.parse(response.body)
        assert_equal User.first.id, json["id"]
      end

      test "returns 404 when no users exist and no header" do
        User.delete_all
        get api_v1_users_me_url

        assert_response :not_found
        json = JSON.parse(response.body)
        assert_equal "User not found", json["error"]
      end
    end
  end
end
