class CreateParticipants < ActiveRecord::Migration
  def self.up
    create_table :participants do |t|
      t.column :title, :string
      t.column :description, :text
      t.column :photo_file_name, :string
      t.column :photo_content_type, :string
      t.column :photo_file_size, :integer
      t.timestamps
    end
  end

  def self.down
    drop_table :participants
  end
end
