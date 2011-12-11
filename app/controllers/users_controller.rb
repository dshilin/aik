class UsersController < ApplicationController  

  # render new.rhtml
  def new
    @user = User.new
  end
 
  def create
    logout_keeping_session!
    @user = User.new(params[:user])
    success = @user && @user.save
    if success && @user.errors.empty?
      redirect_back_or_default('/')
      flash[:notice] = "Спасибо за регистрацию!  На ваш email было выслано письмо с кодом активации."
    else
      flash[:error]  = "Невозможно создать такой аккаунт. Обратитесь к администратору системы"
      render :action => 'new'
    end
  end

  def activate
    logout_keeping_session!
    user = User.find_by_activation_code(params[:activation_code]) unless params[:activation_code].blank?
    case
    when (!params[:activation_code].blank?) && user && !user.active?
      user.activate!
      flash[:notice] = "Регистрация завершена. Войдите в систему чтобы продолжить"
      redirect_to '/login'
    when params[:activation_code].blank?
      flash[:error] = "Пропущен код активации.  Пожалуйста, пройдите по ссылке в письме."
      redirect_back_or_default('/')
    else 
      flash[:error]  = "Невозможно найти пользователя с таким кодом активации -- проверьте отправленное Вам письмо. Может быть вы уже зарегистрированы? -- попробуйте войти в систему."
      redirect_back_or_default('/')
    end
  end
end
