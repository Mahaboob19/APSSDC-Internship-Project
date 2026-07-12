# PlaceSync — Student Placement Tracker

This repository contains PlaceSync, a placement tracking application, split into decoupled frontend and backend services. The backend natively supports both local JSON file persistence and AWS DynamoDB database persistence.

## Repository Structure

```
├── backend/               # Node.js/Express REST API
│   ├── src/               # Application code
│   ├── .env.example       # Backend environmental variable config
│   └── package.json
│
├── frontend/              # Decoupled Static HTML, CSS, JS Web Client
│   ├── css/               # Styling
│   ├── js/                # Client logic and page scripts
│   ├── index.html         # Student portal
│   ├── admin.html         # Admin dashboard
│   └── package.json
│
├── terraform/             # IaC scripts for AWS deployment
│   ├── main.tf            # Provisions S3, EC2, CloudFront, DynamoDB, IAM
│   ├── variables.tf       # Configurable region/instance parameters
│   └── outputs.tf         # CloudFront and Server access endpoints
│
├── package.json           # Root orchestration for concurrently launching servers
└── README.md              # Project documentation (this file)
```

---

## Local Development Setup

To run both the frontend and backend locally with a unified command:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (version >= 18.0.0).

### 2. Install Dependencies
Run the following command at the root of the repository to install all packages for both the root, frontend, and backend packages:
```bash
npm install && npm run install:all
```

### 3. Run Locally
Start both services in parallel:
```bash
npm run dev
```
* The **Frontend** will be served at [http://localhost:5000](http://localhost:5000).
* The **Backend** API will be running at [http://localhost:3000](http://localhost:3000).

*By default, the local backend uses a local JSON file (`backend/src/data/db.json`) as a mock database (CORS is configured to allow requests from port 5000).*

---

## Production Deployment on AWS

The project is configured to deploy onto AWS using 5 primary services:
1. **Amazon S3**: Hosts the static web client.
2. **Amazon EC2**: Hosts the API service.
3. **Amazon DynamoDB**: Provides key-value persistent storage for company drives and applications.
4. **Amazon CloudFront**: Routes `/api/*` to the EC2 backend and `/` to S3, removing the need for CORS and enabling CDN distribution.
5. **AWS IAM**: Authorizes EC2 access to DynamoDB tables securely.

### Step-by-Step Deployment Instructions

#### 1. Setup AWS CLI & Terraform
1. Install the [AWS CLI](https://aws.amazon.com/cli/) and [Terraform CLI](https://www.terraform.io/downloads).
2. Configure your AWS credentials:
   ```bash
   aws configure
   ```

#### 2. Provision Resources with Terraform
1. Navigate to the terraform directory:
   ```bash
   cd terraform
   ```
2. Initialize Terraform:
   ```bash
   terraform init
   ```
3. Preview the infrastructure plan:
   ```bash
   terraform plan
   ```
4. Deploy the infrastructure:
   ```bash
   terraform apply
   ```
   *Enter `yes` when prompted. Wait for the provisioning to finish. This will output the CloudFront distribution domain.*

#### 3. Upload Frontend to S3
Upload the static files from the `frontend/` directory to the newly created S3 bucket (use the bucket name shown in your Terraform outputs):
```bash
aws s3 sync ../frontend s3://<YOUR_S3_BUCKET_NAME> --exclude "package.json" --exclude "node_modules/*"
```

#### 4. Access the App
Open the **CloudFront Distribution Domain Name** (available in the Terraform outputs) in your browser to view the running, deployed application!
