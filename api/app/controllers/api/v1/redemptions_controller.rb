module Api
  module V1
    class RedemptionsController < ApplicationController
      def index
        redemptions = current_user.redemptions
                                  .includes(:reward)
                                  .order(redeemed_at: :desc)
        render json: RedemptionResource.new(redemptions).serializable_hash
      end

      def create
        raise ArgumentError, "reward_id is required" unless params[:reward_id].present?

        redemption = RedemptionService.redeem(
          user_id: current_user.id,
          reward_id: params[:reward_id]
        )
        render json: RedemptionResource.new(redemption).serializable_hash, status: :created
      rescue ArgumentError => e
        render json: { error: e.message }, status: :bad_request
      rescue RedemptionService::InsufficientPointsError
        render json: { error: "Insufficient points" }, status: :unprocessable_entity
      rescue RedemptionService::RewardUnavailableError
        render json: { error: "Reward unavailable" }, status: :unprocessable_entity
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Reward not found" }, status: :not_found
      end
    end
  end
end
