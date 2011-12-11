class WelcomeController < ApplicationController
  def index
    @news = New.all(:select => "*",
                    :limit=>"4",
                    :order=>"id desc")
    @events = Event.all(:select => "*",
                    :limit=>"3",
                    :order=>"actual_time")                    
  end
end
