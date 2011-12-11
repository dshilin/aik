class NsarsController < ApplicationController
  # GET /nsars
  # GET /nsars.xml
  def index
    @nsars = Nsar.find(:all)

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @nsars }
    end
  end

  # GET /nsars/new
  # GET /nsars/new.xml
  def new
    @nsar = Nsar.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @nsar }
    end
  end

  # GET /nsars/1/edit
  def edit
    @nsar = Nsar.find(params[:id])
  end

  # POST /nsars
  # POST /nsars.xml
  def create
    @nsar = Nsar.new(params[:nsar])

    respond_to do |format|
      if @nsar.save
        format.html { redirect_to(nsars_path) }
        format.xml  { render :xml => @nsar, :status => :created, :location => @nsar }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @nsar.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /nsars/1
  # PUT /nsars/1.xml
  def update
    @nsar = Nsar.find(params[:id])

    respond_to do |format|
      if @nsar.update_attributes(params[:nsar])
        format.html { redirect_to(nsars_path) }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @nsar.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /nsars/1
  # DELETE /nsars/1.xml
  def destroy
    @nsar = Nsar.find(params[:id])
    @nsar.destroy

    respond_to do |format|
      format.html { redirect_to(nsars_url) }
      format.xml  { head :ok }
    end
  end
end
