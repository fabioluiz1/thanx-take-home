class ApplicationController < ActionController::API
  include SentryContext

  private

  def current_user
    @current_user ||= User.find_by(id: request.headers["X-User-Id"]) || User.first
  end
end
