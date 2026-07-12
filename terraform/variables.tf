variable "aws_region" {
  type        = string
  description = "AWS region to deploy resources"
  default     = "us-east-1"
}

variable "instance_type" {
  type        = string
  description = "EC2 instance type for backend server"
  default     = "t2.micro"
}

variable "company_table_name" {
  type        = string
  description = "DynamoDB table name for companies"
  default     = "placesync-companies"
}

variable "application_table_name" {
  type        = string
  description = "DynamoDB table name for student applications"
  default     = "placesync-applications"
}
