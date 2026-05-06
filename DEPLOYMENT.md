# AWS Deployment Guide (Free Tier)

This guide outlines how to deploy the Lightweight IAM System to an Amazon Web Services (AWS) EC2 instance using the Free Tier (t2.micro/t3.micro).

## 1. Launch EC2 Instance
- **Region**: us-east-1 (or your preferred region).
- **AMI**: Ubuntu 22.04 LTS (Free Tier eligible).
- **Instance Type**: t2.micro or t3.micro.
- **Key Pair**: Generate or use an existing one to SSH into the instance.

## 2. Configure Security Group
Ensure the following ports are open in the Inbound Rules:
- **SSH (22)**: For remote access.
- **HTTP (80)**: For public access to the application.
- **Custom TCP (5000)**: Optional, if you want direct access to the backend API.

## 3. Server Preparation
Once connected via SSH:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js & NPM
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2
```

## 4. Application Deployment
1. **Clone the repository**:
   `git clone <your-repo-link>`
2. **Setup Backend**:
   ```bash
   cd server
   npm install
   # Create .env with production credentials
   cp .env.example .env 
   pm2 start index.js --name "iam-api"
   ```
3. **Setup Frontend**:
   ```bash
   cd ../client
   npm install
   npm run build
   # Install Nginx to serve the build
   sudo apt install nginx -y
   ```
4. **Configure Nginx**:
   ```bash
   sudo nano /etc/nginx/sites-available/default
   ```
   *Replace content with a proxy to the build folder and the API.*

## 5. Security Evaluation
- **RBAC**: Verified that student tokens cannot access `/api/users`.
- **JWT**: Tokens expire after 8 hours to minimize exposure window.
- **Audit Logging**: All sensitive administrative actions are logged to `iam.db`.
