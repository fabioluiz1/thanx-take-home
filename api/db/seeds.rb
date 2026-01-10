# Demo user with initial points balance
User.find_or_create_by!(email: "demo@example.com") do |user|
  user.points_balance = 500
end

puts "Created demo user: demo@example.com with 500 points"

# Demo rewards with varied costs and availability
# NOTE: Image URLs are from Unsplash for demo purposes only.
# Replace with your own hosted images in production.
rewards_data = [
  {
    name: "Free Coffee",
    description: "Enjoy a complimentary coffee of your choice, any size.",
    points_cost: 100,
    image_url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400",
    available: true
  },
  {
    name: "Free Pastry",
    description: "Choose any pastry from our fresh-baked selection.",
    points_cost: 150,
    image_url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400",
    available: true
  },
  {
    name: "Lunch Combo",
    description: "A sandwich, side, and drink of your choice.",
    points_cost: 350,
    image_url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400",
    available: true
  },
  {
    name: "Movie Ticket",
    description: "One standard admission to any showing.",
    points_cost: 500,
    image_url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400",
    available: true
  },
  {
    name: "Spa Day Pass",
    description: "Full day access to our partner spa facilities.",
    points_cost: 1000,
    image_url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400",
    available: true
  },
  {
    name: "Limited Edition Mug",
    description: "Exclusive collector's mug - currently out of stock.",
    points_cost: 250,
    image_url: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400",
    available: false
  },
  {
    name: "VIP Experience",
    description: "Exclusive behind-the-scenes tour - temporarily unavailable.",
    points_cost: 2000,
    image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
    available: false
  }
]

rewards_data.each do |data|
  Reward.find_or_create_by!(name: data[:name]) do |reward|
    reward.description = data[:description]
    reward.points_cost = data[:points_cost]
    reward.image_url = data[:image_url]
    reward.available = data[:available]
  end
end

puts "Created #{rewards_data.length} demo rewards"
