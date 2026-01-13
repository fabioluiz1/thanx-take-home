# OIDC Provider for GitHub Actions
# Allows GitHub Actions to authenticate to AWS without long-lived credentials

# Create OIDC provider for GitHub
resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = [
    "sts.amazonaws.com",
  ]

  # GitHub's thumbprint (verified)
  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1",
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd",
  ]
}

# IAM role that GitHub Actions will assume
resource "aws_iam_role" "github_actions" {
  name = "${var.project_name}-github-actions"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.github.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            "token.actions.githubusercontent.com:sub" = "repo:${var.github_org}/${var.github_repo}:*"
          }
        }
      }
    ]
  })
}

# Policy for GitHub Actions to deploy to ECS
resource "aws_iam_role_policy" "github_actions_deploy" {
  name = "deploy-policy"
  role = aws_iam_role.github_actions.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      # ECR permissions
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
        ]
        Resource = "*"
      },
      # ECS permissions
      {
        Effect = "Allow"
        Action = [
          "ecs:DescribeServices",
          "ecs:DescribeTaskDefinition",
          "ecs:DescribeTasks",
          "ecs:ListTasks",
          "ecs:RegisterTaskDefinition",
          "ecs:UpdateService",
          "ecs:RunTask",
        ]
        Resource = "*"
      },
      # IAM permissions (for passing execution role)
      {
        Effect = "Allow"
        Action = [
          "iam:PassRole",
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "iam:PassedToService" = "ecs-tasks.amazonaws.com"
          }
        }
      },
      # CloudWatch Logs (for deployment verification)
      {
        Effect = "Allow"
        Action = [
          "logs:GetLogEvents",
          "logs:FilterLogEvents",
        ]
        Resource = "*"
      },
      # Systems Manager (for reading secrets during deployment)
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
        ]
        Resource = "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/${var.project_name}/*"
      },
      # EC2 permissions (for fetching service IPs)
      {
        Effect = "Allow"
        Action = [
          "ec2:DescribeNetworkInterfaces",
        ]
        Resource = "*"
      },
      # S3 permissions (for Terraform state backend)
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
        ]
        Resource = [
          "arn:aws:s3:::rewards-app-tf-state-*",
          "arn:aws:s3:::rewards-app-tf-state-*/*",
        ]
      },
      # DynamoDB permissions (for Terraform state locking)
      {
        Effect = "Allow"
        Action = [
          "dynamodb:DescribeTable",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:DeleteItem",
        ]
        Resource = "arn:aws:dynamodb:*:*:table/rewards-app-tf-locks"
      },
      # IAM permissions (for terraform plan/apply to read/create roles)
      {
        Effect = "Allow"
        Action = [
          "iam:GetRole",
          "iam:ListRolePolicies",
          "iam:GetRolePolicy",
          "iam:GetOpenIDConnectProvider",
          "iam:ListOpenIDConnectProviders",
          "iam:CreateRole",
          "iam:CreateOpenIDConnectProvider",
          "iam:UpdateAssumeRolePolicy",
          "iam:PutRolePolicy",
          "iam:DeleteRolePolicy",
          "iam:TagRole",
          "iam:UntagRole",
          "iam:ListRoleTags",
        ]
        Resource = "*"
      },
      # ECR permissions (for terraform plan/apply to manage repositories)
      {
        Effect = "Allow"
        Action = [
          "ecr:DescribeRepositories",
          "ecr:CreateRepository",
          "ecr:PutLifecyclePolicy",
          "ecr:ListTagsForResource",
          "ecr:TagResource",
          "ecr:UntagResource",
        ]
        Resource = "*"
      },
      # ECS permissions (for terraform plan/apply to manage clusters)
      {
        Effect = "Allow"
        Action = [
          "ecs:DescribeClusters",
          "ecs:CreateCluster",
          "ecs:DescribeContainerInstances",
        ]
        Resource = "*"
      },
      # CloudWatch Logs permissions (for terraform plan/apply to manage log groups)
      {
        Effect = "Allow"
        Action = [
          "logs:DescribeLogGroups",
          "logs:CreateLogGroup",
          "logs:TagLogGroup",
          "logs:ListTagsForResource",
          "logs:UntagResource",
        ]
        Resource = "*"
      },
      # SSM permissions (for terraform plan/apply to manage parameters)
      {
        Effect = "Allow"
        Action = [
          "ssm:DescribeParameters",
          "ssm:GetParameter",
          "ssm:PutParameter",
          "ssm:AddTagsToResource",
          "ssm:ListTagsForResource",
        ]
        Resource = "*"
      },
      # EC2 permissions (for terraform plan/apply to manage VPC resources)
      {
        Effect = "Allow"
        Action = [
          "ec2:DescribeVpcs",
          "ec2:DescribeVpcAttribute",
          "ec2:DescribeSubnets",
          "ec2:DescribeSecurityGroups",
          "ec2:DescribeRouteTables",
          "ec2:DescribeInternetGateways",
          "ec2:DescribeNatGateways",
          "ec2:CreateVpc",
          "ec2:CreateSubnet",
          "ec2:CreateSecurityGroup",
          "ec2:CreateRouteTable",
          "ec2:CreateInternetGateway",
          "ec2:CreateNatGateway",
          "ec2:AllocateAddress",
          "ec2:AssociateRouteTable",
          "ec2:AuthorizeSecurityGroupIngress",
          "ec2:AuthorizeSecurityGroupEgress",
          "ec2:AttachInternetGateway",
          "ec2:ModifyVpcAttribute",
          "ec2:CreateTags",
          "ec2:DescribeTags",
        ]
        Resource = "*"
      },
      # RDS permissions (for terraform plan/apply to manage database)
      {
        Effect = "Allow"
        Action = [
          "rds:DescribeDBInstances",
          "rds:DescribeDBSubnetGroups",
          "rds:CreateDBSubnetGroup",
          "rds:CreateDBInstance",
          "rds:ModifyDBInstance",
          "rds:ListTagsForResource",
          "rds:AddTagsToResource",
          "rds:RemoveTagsFromResource",
        ]
        Resource = "*"
      },
      # Budget permissions (for terraform plan/apply to manage cost alerts)
      {
        Effect = "Allow"
        Action = [
          "budgets:ViewBudget",
          "budgets:CreateBudget",
          "budgets:UpdateBudget",
          "budgets:ListTagsForResource",
          "budgets:TagResource",
          "budgets:UntagResource",
        ]
        Resource = "*"
      },
      # Service Discovery permissions (for terraform plan/apply to manage service discovery)
      {
        Effect = "Allow"
        Action = [
          "servicediscovery:CreatePrivateDnsNamespace",
          "servicediscovery:CreateService",
          "servicediscovery:GetNamespace",
          "servicediscovery:GetService",
        ]
        Resource = "*"
      },
    ]
  })
}
