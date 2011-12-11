class CreateEvents < ActiveRecord::Migration
  def self.up
    create_table :events do |t|
      t.column :title, :string
      t.column :description, :text
      t.column :actual_time,       :time
      t.column :photo_file_name, :string
      t.column :photo_content_type, :string
      t.column :photo_file_size, :integer
      t.timestamps
    end
  end

  def self.down
    drop_table :events
  end
end
