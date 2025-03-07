resource "aws_cognito_user_pool" "snc_userpool" {
  name = "snc-userpool-${var.stage}"

  username_configuration {
    case_sensitive = false
  }
}

resource "aws_cognito_identity_provider" "example_provider" {
  user_pool_id  = aws_cognito_user_pool.example.id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    authorize_scopes = "email"
    client_id        = "your client_id"
    client_secret    = "your client_secret"
  }

  attribute_mapping = {
    email    = "email"
    username = "sub"
  }
}

resource "aws_cognito_identity_provider" "snc_user_pool_provider" {
  user_pool_id = aws_cognito_user_pool.snc_userpool.id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    client_id = "TODO_CLIENT_DEFINITION"
  }
}
