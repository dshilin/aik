class Addtypetogallery < ActiveRecord::Migration
  def self.up
        add_column :galleries, :is_photo, :boolen, :default => true
  end

  def self.down
        remove_column :galleries, :type
  end
end
