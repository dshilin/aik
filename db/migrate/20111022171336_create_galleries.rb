class CreateGalleries < ActiveRecord::Migration
  def self.up
    create_table :galleries do |t|
      t.column :title, :string
      t.column :description, :text
      t.timestamps
    end
  end

  def self.down
    drop_table :galleries
  end
end
