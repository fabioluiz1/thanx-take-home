# Demo user with initial points balance
User.find_or_create_by!(email: "demo@example.com") do |user|
  user.points_balance = 500
end

puts "Created demo user: demo@example.com with 500 points"
