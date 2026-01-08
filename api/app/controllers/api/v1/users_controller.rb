module Api
  module V1
    class UsersController < ApplicationController
      def me
        if current_user
          render json: UserResource.new(current_user).serialize
        else
          render json: { error: "User not found" }, status: :not_found
        end
      end
    end
  end
end
