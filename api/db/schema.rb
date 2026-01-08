# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_01_08_204345) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "redemptions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "points_spent", null: false
    t.datetime "redeemed_at", null: false
    t.bigint "reward_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["reward_id"], name: "index_redemptions_on_reward_id"
    t.index ["user_id", "redeemed_at"], name: "index_redemptions_on_user_id_and_redeemed_at"
    t.index ["user_id"], name: "index_redemptions_on_user_id"
  end

  create_table "rewards", force: :cascade do |t|
    t.boolean "available", default: true, null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.string "image_url"
    t.string "name", null: false
    t.integer "points_cost", null: false
    t.datetime "updated_at", null: false
    t.index ["available", "points_cost"], name: "index_rewards_on_available_and_points_cost"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.integer "points_balance", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "redemptions", "rewards"
  add_foreign_key "redemptions", "users"
end
