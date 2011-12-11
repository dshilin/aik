class CreateContacts < ActiveRecord::Migration
  def self.up
    create_table :contacts do |t|
      t.column :description, :text
    end
  end

  def self.down
    drop_table :contacts
  end
end
