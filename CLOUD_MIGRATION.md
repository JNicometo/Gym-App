# FitTrack Pro - Cloud Migration Guide

Complete guide for deploying FitTrack Pro from local development to cloud production.

## Table of Contents
- [Overview](#overview)
- [Cloud Platform Options](#cloud-platform-options)
- [Pre-Migration Checklist](#pre-migration-checklist)
- [Azure Deployment](#azure-deployment)
- [AWS Deployment](#aws-deployment)
- [Alternative Platforms](#alternative-platforms)
- [Post-Migration Tasks](#post-migration-tasks)
- [Cost Estimates](#cost-estimates)

---

## Overview

### Why Migrate to Cloud?

**Local (Current Setup)**
- ✅ Free
- ✅ Full control
- ✅ Fast development
- ❌ Only accessible from your computer
- ❌ No redundancy/backup
- ❌ Can't scale for multiple users

**Cloud (Production)**
- ✅ Accessible from anywhere
- ✅ Automatic backups
- ✅ Scales with users
- ✅ Professional hosting
- ✅ SSL/HTTPS included
- ⚠️ Costs money (but can start cheap)

### Migration Steps Overview

1. Test locally and make sure everything works
2. Choose a cloud platform
3. Set up cloud database
4. Deploy API backend
5. Deploy frontend
6. Configure domain name (optional)
7. Add production security features

---

## Cloud Platform Options

### Option 1: Microsoft Azure (Recommended for SQL Server)

**Pros:**
- Native SQL Server support (Azure SQL Database)
- Excellent for .NET/SQL Server stack
- Free tier available
- Easy integration
- Great documentation

**Cons:**
- Can be complex for beginners
- Pricing can get expensive at scale

**Cost:** ~$15-30/month to start

---

### Option 2: Amazon Web Services (AWS)

**Pros:**
- Most popular cloud platform
- Lots of resources/tutorials
- Very scalable
- Free tier for 12 months

**Cons:**
- SQL Server on AWS is expensive (use RDS)
- Steeper learning curve
- Many services to choose from

**Cost:** ~$20-40/month to start

---

### Option 3: Heroku (Easiest, but limited)

**Pros:**
- Simplest deployment
- Git-based deployment
- Free tier available
- Great for Node.js

**Cons:**
- No native SQL Server support (need to use PostgreSQL instead)
- Limited free tier
- Less control

**Cost:** $0-25/month

---

## Pre-Migration Checklist

### 1. Test Everything Locally

- [ ] All API endpoints work
- [ ] Frontend connects to API
- [ ] Database schema is finalized
- [ ] User registration works
- [ ] Workout tracking works
- [ ] No critical bugs

### 2. Prepare Production Configuration

- [ ] Create production .env file
- [ ] Set strong passwords
- [ ] Document all configuration
- [ ] Backup local database

### 3. Add Production Features

- [ ] Add password hashing (bcrypt)
- [ ] Add JWT authentication
- [ ] Add input validation
- [ ] Add rate limiting
- [ ] Add error logging

### 4. Security Audit

- [ ] All passwords are strong
- [ ] No credentials in code
- [ ] HTTPS/SSL enabled
- [ ] CORS properly configured
- [ ] SQL injection protected (already done with parameterized queries)

---

## Azure Deployment

### Part 1: Set Up Azure SQL Database

1. **Create Azure Account**
   - Go to https://azure.microsoft.com/
   - Sign up for free account ($200 credit)
   - Verify your email

2. **Create SQL Database**
   ```
   - Go to Azure Portal (portal.azure.com)
   - Click "Create a resource"
   - Search for "SQL Database"
   - Click "Create"

   Database details:
   - Database name: fittrack-prod
   - Server: Create new
     - Server name: fittrack-server-[yourname]
     - Location: Choose nearest region
     - Authentication: SQL authentication
     - Server admin login: sqladmin
     - Password: [Strong password - save this!]

   Compute + storage:
   - Service tier: Basic (cheapest, $5/month)
   - Or DTU: Standard S0 ($15/month for better performance)

   Networking:
   - Connectivity: Public endpoint
   - Allow Azure services: Yes
   - Add current client IP: Yes

   Click "Review + Create"
   ```

3. **Configure Firewall**
   - Go to your SQL server
   - Settings → Networking
   - Add your IP address
   - Allow Azure services to access server: ON
   - Save

4. **Get Connection String**
   - Go to your database
   - Settings → Connection strings
   - Copy the ADO.NET connection string
   - Save it - you'll need this!

### Part 2: Deploy API to Azure App Service

1. **Create App Service**
   ```
   - Azure Portal → Create a resource
   - Search "App Service"
   - Click Create

   Details:
   - App name: fittrack-api-[yourname]
   - Runtime: Node 18 LTS
   - Region: Same as database
   - Pricing: Free F1 or Basic B1 ($13/month)

   Click "Review + Create"
   ```

2. **Configure Environment Variables**
   ```
   - Go to your App Service
   - Settings → Configuration
   - Application settings → New application setting

   Add these:
   - DB_SERVER: fittrack-server-yourname.database.windows.net
   - DB_PORT: 1433
   - DB_USER: sqladmin
   - DB_PASSWORD: [your password]
   - DB_ENCRYPT: true
   - PORT: 8080

   Click Save
   ```

3. **Deploy API Code**

   **Method A: Azure CLI (Recommended)**
   ```bash
   # Install Azure CLI
   # https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

   # Login
   az login

   # Build and deploy
   cd api
   zip -r deploy.zip .
   az webapp deployment source config-zip \
     --resource-group your-resource-group \
     --name fittrack-api-yourname \
     --src deploy.zip
   ```

   **Method B: GitHub Actions** (see GitHub deployment section)

   **Method C: FTP Upload** (slowest but works)
   - Get FTP credentials from App Service → Deployment Center
   - Upload all files from `api/` folder

4. **Test API**
   - Visit: https://fittrack-api-yourname.azurewebsites.net/api/health
   - Should see: `{"status":"ok","message":"FitTrack Pro API is running"}`

### Part 3: Deploy Frontend

**Option A: Azure Static Web Apps (Recommended)**
```
- Azure Portal → Create a resource
- Search "Static Web Apps"
- Create

Details:
- Name: fittrack-frontend
- Plan: Free
- Source: Upload code or link GitHub

Upload frontend files:
- Upload index.html
- Update API_URL to your Azure API endpoint
```

**Option B: Azure Blob Storage (Cheaper)**
```
- Create Storage Account
- Enable Static Website hosting
- Upload frontend/index.html
- Set index.html as index document
```

**Option C: Netlify/Vercel (Even Easier)**
```
- Sign up at netlify.com or vercel.com
- Drag and drop frontend folder
- Update API_URL in index.html before uploading
- Free hosting!
```

### Part 4: Update Frontend API URL

Before deploying frontend, update the API URL:

**In frontend/index.html** (line 18):
```javascript
// Change from:
const API_URL = 'http://localhost:3001/api';

// To:
const API_URL = 'https://fittrack-api-yourname.azurewebsites.net/api';
```

**In frontend/App.jsx** (line 8):
```javascript
// Same change
const API_URL = 'https://fittrack-api-yourname.azurewebsites.net/api';
```

---

## AWS Deployment

### Part 1: Set Up RDS SQL Server

1. **Create AWS Account**
   - Go to https://aws.amazon.com/
   - Sign up for free tier

2. **Create RDS Instance**
   ```
   - AWS Console → RDS
   - Create database

   Engine: SQL Server Express (free tier eligible)
   Templates: Free tier

   Settings:
   - DB instance ID: fittrack-db
   - Master username: admin
   - Master password: [Strong password]

   Instance configuration:
   - db.t3.micro (free tier)

   Storage:
   - 20 GB (free tier)

   Connectivity:
   - Public access: Yes
   - VPC security group: Create new

   Click Create
   ```

3. **Configure Security Group**
   - Go to EC2 → Security Groups
   - Find RDS security group
   - Edit inbound rules
   - Add rule: Type=MSSQL, Port=1433, Source=Anywhere (or your IP)

4. **Get Endpoint**
   - RDS → Databases → fittrack-db
   - Copy the endpoint (e.g., fittrack-db.xxxxx.us-east-1.rds.amazonaws.com)

### Part 2: Deploy API to Elastic Beanstalk

1. **Install EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize EB**
   ```bash
   cd api
   eb init

   # Select region
   # Create new application: fittrack-api
   # Platform: Node.js
   # SSH: No (unless you need it)
   ```

3. **Create Environment**
   ```bash
   eb create fittrack-env

   # Configure environment variables:
   eb setenv \
     DB_SERVER=fittrack-db.xxxxx.us-east-1.rds.amazonaws.com \
     DB_PORT=1433 \
     DB_USER=admin \
     DB_PASSWORD=yourpassword \
     DB_ENCRYPT=true
   ```

4. **Deploy**
   ```bash
   eb deploy

   # Open in browser
   eb open
   ```

### Part 3: Deploy Frontend to S3

1. **Create S3 Bucket**
   ```
   - AWS Console → S3
   - Create bucket
   - Name: fittrack-frontend-yourname
   - Uncheck "Block all public access"
   - Create bucket
   ```

2. **Enable Static Website Hosting**
   ```
   - Bucket → Properties
   - Static website hosting: Enable
   - Index document: index.html
   - Save
   ```

3. **Upload Files**
   - Update API_URL in frontend files
   - Upload to S3 bucket
   - Make files public (Actions → Make public)

4. **Get Website URL**
   - Properties → Static website hosting
   - Copy endpoint URL

---

## Alternative Platforms

### Railway.app (Beginner Friendly)

**Pros:**
- Very easy deployment
- Free tier available
- PostgreSQL included (would need to adapt schema)

**Deployment:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd api
railway up
```

### Render.com (Similar to Heroku)

**Pros:**
- Free tier
- Easy deployment
- PostgreSQL support

**Deployment:**
- Connect GitHub repo
- Render auto-deploys on push
- Add environment variables in dashboard

### DigitalOcean App Platform

**Pros:**
- Simple pricing ($5/month)
- Managed database option
- Easy scaling

**Deployment:**
- Connect GitHub
- Select api folder
- Choose database plan
- Deploy

---

## Post-Migration Tasks

### 1. Add Production Security

**Install security packages:**
```bash
cd api
npm install bcrypt jsonwebtoken helmet express-rate-limit
```

**Add to server.js:**
```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
```

### 2. Set Up Monitoring

**Azure:**
- Application Insights (free tier)
- Monitor API performance, errors, usage

**AWS:**
- CloudWatch for logs and metrics

**Third-party:**
- Sentry.io for error tracking
- LogRocket for user sessions

### 3. Configure Custom Domain (Optional)

**Buy domain:**
- Namecheap, GoDaddy, Google Domains ($12/year)

**Configure DNS:**
- Point domain to your cloud service
- Azure: Add custom domain in App Service
- AWS: Use Route 53

**Enable HTTPS:**
- Azure: Automatic with App Service
- AWS: Use Certificate Manager
- Cloudflare: Free SSL

### 4. Set Up Backups

**Azure SQL:**
- Automatic backups included
- Configure retention period
- Test restore process

**AWS RDS:**
- Enable automated backups
- Set backup window
- Create manual snapshots before major changes

### 5. Create Staging Environment

- Duplicate production setup
- Use for testing before deploying to prod
- Same configuration but separate databases

---

## Cost Estimates

### Azure (Recommended for beginners)

**Minimal Setup (~$20/month):**
- Azure SQL Database (Basic): $5/month
- App Service (Basic B1): $13/month
- Static Web App: Free
- **Total: ~$18/month**

**Production Setup (~$50/month):**
- Azure SQL Database (Standard S0): $15/month
- App Service (Standard S1): $25/month
- Application Insights: Free tier
- Static Web App: Free
- **Total: ~$40/month**

### AWS

**Minimal Setup (~$25/month):**
- RDS SQL Server Express (t3.micro): $15/month
- Elastic Beanstalk (t3.micro): $8/month
- S3 Static hosting: ~$1/month
- **Total: ~$24/month**

### Budget-Friendly Options

**Ultra-Cheap (~$0-10/month):**
- Heroku Free Tier (dyno): $0 (with PostgreSQL)
- Railway.app Free Tier: $0
- Render.com Free Tier: $0
- Netlify Frontend: $0

**Note:** Free tiers usually have limitations:
- App sleeps after inactivity
- Limited database size
- Slower performance
- Fewer resources

---

## Migration Checklist

- [ ] Local app fully tested
- [ ] Cloud account created
- [ ] Database created in cloud
- [ ] Database schema deployed
- [ ] Test data migrated (optional)
- [ ] API deployed to cloud
- [ ] Environment variables configured
- [ ] API tested in cloud
- [ ] Frontend updated with cloud API URL
- [ ] Frontend deployed
- [ ] End-to-end testing completed
- [ ] SSL/HTTPS verified
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Custom domain configured (optional)
- [ ] Production security features added
- [ ] Documentation updated

---

## Rollback Plan

If something goes wrong:

1. **Keep local version running**
   - Don't delete local setup until cloud is stable

2. **Database backup**
   - Export local database before migration
   - Keep SQL backup files

3. **Code backup**
   - Commit everything to Git before changes
   - Tag the working version

4. **Quick restore**
   ```bash
   # If cloud fails, revert frontend to localhost:
   # frontend/index.html line 18:
   const API_URL = 'http://localhost:3001/api';

   # Start local API:
   cd api
   npm start
   ```

---

## Performance Optimization

### Database

- Enable connection pooling (already configured)
- Add indexes on frequently queried columns
- Monitor slow queries with Azure Query Performance

### API

- Enable gzip compression
- Add caching for static data (exercises)
- Use CDN for frontend assets

### Frontend

- Minify HTML/JS
- Enable browser caching
- Use CDN (Cloudflare free tier)

---

## Getting Help

**Azure:**
- Documentation: https://docs.microsoft.com/azure
- Support: Azure Portal → Support
- Community: Stack Overflow (tag: azure)

**AWS:**
- Documentation: https://docs.aws.amazon.com
- Support: AWS Console → Support
- Community: AWS Forums

**General:**
- FitTrack Pro issues: Create GitHub issue
- SQL Server: Stack Overflow
- Node.js: Node.js documentation

---

## Next Steps After Migration

1. **Monitor and optimize**
   - Watch for errors
   - Optimize slow queries
   - Review costs

2. **Add features**
   - Progress photos (Azure Blob Storage)
   - Push notifications
   - Social features
   - Premium subscription

3. **Marketing**
   - Create landing page
   - Social media presence
   - App store submission (mobile)

4. **Scale**
   - Upgrade database tier as needed
   - Add more API servers
   - Implement caching (Redis)

---

**You're ready to go to production!** Start small, monitor closely, and scale as your user base grows. The local-first approach means you can always develop and test locally before deploying changes to production.
