# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_initial_release_session',
  :secret      => '051548759c8ad4b89910c089ccaa39dbb550a35a3e823a84170774f7874e31adae7aae9db83ce175e40b45692a79a74e63f8e453f3a1add391613ea16a992261'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
