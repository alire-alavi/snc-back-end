terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
  profile = "sdom"
}

variable "stage" {
  type = "string"
  default = "dev"
  description = "Stage in which the app is deployed"
}
