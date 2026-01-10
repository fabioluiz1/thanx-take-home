class CreateRewards < ActiveRecord::Migration[8.1]
  def change
    create_table :rewards do |t|
      t.string :name, null: false
      t.text :description
      t.integer :points_cost, null: false
      t.string :image_url
      t.boolean :available, null: false, default: true

      t.timestamps
    end

    add_index :rewards, %i[available points_cost]
  end
end
