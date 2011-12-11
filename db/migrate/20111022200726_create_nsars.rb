class CreateNsars < ActiveRecord::Migration
  def self.up
    create_table :nsars do |t|
      t.column :description, :text
      t.timestamps
    end
  end

  def self.down
    drop_table :nsars
  end
end
