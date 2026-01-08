module Api
  module V1
    class RewardsController < ApplicationController
      DEFAULT_LIMIT = 20
      MAX_LIMIT = 100

      # Returns only available rewards (unavailable rewards are excluded)
      def index
        rewards = Reward.available
          .order(:points_cost)
          .limit(limit)
          .offset(offset)

        render json: RewardResource.new(rewards).serializable_hash
      end

      private

      def limit
        [ [ params.fetch(:limit, DEFAULT_LIMIT).to_i, 1 ].max, MAX_LIMIT ].min
      end

      def offset
        [ params.fetch(:offset, 0).to_i, 0 ].max
      end
    end
  end
end
