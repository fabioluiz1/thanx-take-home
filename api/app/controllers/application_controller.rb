class ApplicationController < ActionController::API
  include SentryContext

  private

  # DEMO AUTHENTICATION - Design Decision
  #
  # This application is a demo/take-home project where real authentication
  # (JWT, sessions, OAuth, etc.) is explicitly out of scope. The focus is on
  # demonstrating rewards and redemption features, not auth infrastructure.
  #
  # How it works:
  # - Accepts X-User-Id header to specify which user to act as
  # - Falls back to User.first when no header provided (single-user demo mode)
  # - In production, this would return 401 Unauthorized without valid auth
  #
  # This allows the frontend to work without login flows while still having
  # a real User record for points balance, transactions, etc.
  def current_user
    @current_user ||= User.find_by(id: request.headers["X-User-Id"]) || User.first
  end
end
