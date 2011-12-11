class Event < ActiveRecord::Base
  has_attached_file :photo, :styles => { :medium => "150x100>"}
end
