# FitTrack Pro - Local Development Setup

Complete guide for running FitTrack Pro entirely on your local machine.

## Table of Contents
- [Prerequisites](#prerequisites)
- [SQL Server Installation](#sql-server-installation)
- [Application Setup](#application-setup)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)
- [Testing](#testing)

---

## Prerequisites

### Required Software

1. **Node.js** (v16 or higher)
   - Download: https://nodejs.org/
   - Verify installation: `node --version`

2. **SQL Server** (one of these options):
   - **SQL Server Express** (Free, recommended for local dev)
   - **SQL Server Developer Edition** (Free, full features)
   - **SQL Server LocalDB** (Lightweight, Windows only)

3. **SQL Server Management Studio (SSMS)** (Optional but recommended)
   - Download: https://aka.ms/ssmsfullsetup
   - Makes database management much easier

4. **Git** (for version control)
   - Download: https://git-scm.com/

---

## SQL Server Installation

### Option 1: SQL Server Express (Recommended)

1. **Download SQL Server Express**
   - Visit: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
   - Click "Download now" under "Express" edition

2. **Install SQL Server Express**
   ```
   - Run the installer
   - Choose "Basic" installation
   - Accept license terms
   - Choose installation location
   - Click "Install"
   - Note the connection string shown at the end (e.g., localhost\SQLEXPRESS)
   ```

3. **Enable SQL Server Authentication** (Optional, for SQL Auth)
   - Open SQL Server Management Studio (SSMS)
   - Connect to your server (localhost\SQLEXPRESS)
   - Right-click server name → Properties
   - Go to Security page
   - Select "SQL Server and Windows Authentication mode"
   - Click OK
   - Restart SQL Server service:
     ```bash
     # In Windows Services or PowerShell:
     Restart-Service MSSQL$SQLEXPRESS
     ```

4. **Create SA Account** (If using SQL Authentication)
   - In SSMS, expand Security → Logins
   - Right-click "sa" → Properties
   - Set a strong password
   - Under "Status", set Login to "Enabled"
   - Click OK

5. **Enable TCP/IP Protocol**
   - Open SQL Server Configuration Manager
   - Expand SQL Server Network Configuration
   - Click "Protocols for SQLEXPRESS"
   - Right-click "TCP/IP" → Enable
   - Restart SQL Server service

### Option 2: SQL Server Developer Edition

1. **Download SQL Server Developer**
   - Visit: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
   - Click "Download now" under "Developer" edition

2. **Install**
   - Run installer
   - Choose "Custom" installation
   - Follow the wizard
   - For Authentication, choose "Mixed Mode" (allows both Windows and SQL Auth)
   - Set SA password
   - Complete installation

3. **Verify Installation**
   - Open SSMS
   - Connect to: localhost or localhost\MSSQLSERVER
   - Should connect successfully

### Option 3: LocalDB (Lightweight, Windows Only)

1. **Install with Visual Studio** or separately
2. **Connection string**: `(localdb)\MSSQLLocalDB`
3. **Note**: Automatically starts when accessed

---

## Application Setup

### Step 1: Clone or Download the Project

```bash
git clone <your-repo-url>
cd Gym-App
```

### Step 2: Install API Dependencies

```bash
cd api
npm install
```

This installs:
- express (web server)
- mssql (SQL Server driver)
- cors (cross-origin support)
- dotenv (environment variables)

### Step 3: Configure Database Connection

1. **Copy the example environment file:**
   ```bash
   cd api
   cp .env.example .env
   ```

2. **Edit `.env` file:**

   **For Windows Authentication** (Recommended - uses your Windows login):
   ```env
   PORT=3001
   DB_SERVER=localhost\SQLEXPRESS
   DB_PORT=1433
   DB_ENCRYPT=false
   # Leave DB_USER and DB_PASSWORD empty for Windows Auth
   ```

   **For SQL Server Authentication** (If you set up SA account):
   ```env
   PORT=3001
   DB_SERVER=localhost\SQLEXPRESS
   DB_PORT=1433
   DB_ENCRYPT=false
   DB_USER=sa
   DB_PASSWORD=YourStrongPassword123!
   ```

   **For LocalDB**:
   ```env
   PORT=3001
   DB_SERVER=(localdb)\\MSSQLLocalDB
   DB_PORT=1433
   DB_ENCRYPT=false
   ```

### Step 4: Test Database Connection

```bash
cd api
node -e "require('dotenv').config(); const sql = require('mssql'); sql.connect({ server: process.env.DB_SERVER || 'localhost', options: { encrypt: false, trustServerCertificate: true } }).then(() => { console.log('✅ Connected!'); process.exit(0); }).catch(err => { console.error('❌ Failed:', err.message); process.exit(1); });"
```

You should see: `✅ Connected!`

---

## Running the Application

### Start the API Server

```bash
cd api
npm start
```

You should see:
```
===========================================
🚀 FitTrack Pro API Server
===========================================
Using Windows Authentication
Connecting to SQL Server at: localhost\SQLEXPRESS:1433
✅ Server running on port 3001
📡 API endpoint: http://localhost:3001/api
🗄️  Database: localhost\SQLEXPRESS:1433
===========================================
```

### Test the API

Open a browser and go to:
- http://localhost:3001/api/health
- Should see: `{"status":"ok","message":"FitTrack Pro API is running"}`

### Open the Frontend

**Option 1: Standalone HTML (Easiest)**
- Simply open `frontend/index.html` in your browser
- Double-click the file or:
  ```bash
  # Windows
  start frontend/index.html

  # macOS
  open frontend/index.html

  # Linux
  xdg-open frontend/index.html
  ```

**Option 2: React Development Server** (Optional)
- If you want to use the React version with hot reload
- See the React setup section in README.md

---

## First-Time Usage

### Create Your First User

1. Open the frontend (frontend/index.html)
2. Fill in the registration form:
   - First Name: John
   - Last Name: Smith
   - Email: john@example.com
   - Password: test123
3. Click "Create Account"
4. Your database `j_smith_00000` will be created automatically!
5. You'll be logged in and see your dashboard

### What Just Happened?

The application:
1. Created a new SQL Server database called `j_smith_00000`
2. Ran the schema.sql file to create all 11 tables
3. Pre-loaded 35+ exercises
4. Set up default preferences
5. Saved your login to localStorage

### View Your Database

In SQL Server Management Studio:
```sql
-- See all user databases
SELECT name FROM sys.databases
WHERE name LIKE 'j_%' OR name LIKE 'm_%'
ORDER BY name;

-- Use your database
USE j_smith_00000;

-- View pre-loaded exercises
SELECT * FROM exercises;

-- View tables
SELECT * FROM sys.tables;
```

---

## Troubleshooting

### Problem: "Cannot connect to database"

**Solution 1: Check SQL Server is running**
```bash
# Windows PowerShell (as Administrator)
Get-Service | Where-Object {$_.Name -like '*SQL*'}

# If stopped, start it:
Start-Service MSSQL$SQLEXPRESS
```

**Solution 2: Verify connection string**
- Make sure DB_SERVER in .env matches your SQL Server instance
- Common values:
  - `localhost` (default instance)
  - `localhost\SQLEXPRESS` (express edition)
  - `localhost\SQLSERVER` (developer edition)
  - `(localdb)\MSSQLLocalDB` (LocalDB)

**Solution 3: Check firewall**
- Windows Firewall might block SQL Server
- Add exception for SQL Server (port 1433)

### Problem: "Login failed for user"

**Solution 1: Use Windows Authentication**
- In `.env`, remove or comment out DB_USER and DB_PASSWORD
- The app will use your Windows login automatically

**Solution 2: Enable SQL Authentication**
- Follow "Enable SQL Server Authentication" steps above
- Make sure SA account is enabled
- Verify password is correct in .env

### Problem: "Port 3001 already in use"

**Solution:**
```bash
# Change port in .env file
PORT=3002

# Or kill the process using port 3001:
# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3001 | xargs kill -9
```

### Problem: "CORS error in browser"

**Solution:**
- Make sure API server is running on port 3001
- Open browser console (F12) to see the actual error
- Try accessing http://localhost:3001/api/health directly

### Problem: Database creation fails

**Solution 1: Check permissions**
```sql
-- In SSMS, run as admin:
-- Give your account dbcreator role
USE master;
ALTER SERVER ROLE dbcreator ADD MEMBER [YOUR_DOMAIN\YOUR_USERNAME];
GO

-- Or for SA:
ALTER SERVER ROLE dbcreator ADD MEMBER sa;
GO
```

**Solution 2: Manual database creation**
- Create database manually in SSMS
- Name it: j_smith_00000
- Copy contents of `database/schema.sql`
- Execute in that database

### Problem: Frontend shows blank page

**Solution:**
1. Open browser console (F12)
2. Check for errors
3. Verify API is running: http://localhost:3001/api/health
4. Clear browser cache and localStorage:
   ```javascript
   // In browser console:
   localStorage.clear();
   location.reload();
   ```

---

## Testing

### Test API Endpoints

```bash
# Health check
curl http://localhost:3001/api/health

# Test database connection
curl http://localhost:3001/api/test-connection

# Register a user (creates database)
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"test123"}'

# Get exercises (replace with your database name)
curl http://localhost:3001/api/t_user_00000/exercises
```

### Test Frontend

1. Open frontend/index.html
2. Register a new user
3. Try starting a workout
4. Add a few sets
5. Complete the workout
6. Check the dashboard

### Verify Database

```sql
-- In SSMS, check that everything was created
USE j_smith_00000;

-- Count exercises (should be 35+)
SELECT COUNT(*) as exercise_count FROM exercises;

-- Check tables
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES;

-- Check views
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.VIEWS;
```

---

## Performance Tips for Local Development

### 1. Use LocalDB for lightweight development
- Starts automatically when accessed
- Doesn't run as a background service
- Perfect for solo development

### 2. Disable SQL Server if not needed
```bash
# Windows Services
Stop-Service MSSQL$SQLEXPRESS
Set-Service MSSQL$SQLEXPRESS -StartupType Manual
```

### 3. Use nodemon for auto-restart
```bash
cd api
npm run dev  # Uses nodemon instead of node
```

### 4. Keep SSMS open
- Makes it easy to browse databases
- Quick query execution
- Visual database management

---

## Next Steps

Once everything is working locally:

1. **Test all features** - Make sure everything works as expected
2. **Customize** - Add your own exercises, modify the schema, etc.
3. **Read CLOUD_MIGRATION.md** - When ready to deploy to the cloud
4. **Backup your data** - Export databases regularly

---

## Development Workflow

### Daily Development
1. Start SQL Server (if not auto-started)
2. `cd api && npm start`
3. Open frontend/index.html
4. Code and test

### Adding Features
1. Update database schema in `database/schema.sql`
2. Add API endpoints in `api/server.js`
3. Update frontend in `frontend/index.html` or `frontend/App.jsx`
4. Test with real data

### Backing Up Data
```sql
-- In SSMS
BACKUP DATABASE j_smith_00000
TO DISK = 'C:\Backups\fittrack_backup.bak';

-- Restore later:
RESTORE DATABASE j_smith_00000
FROM DISK = 'C:\Backups\fittrack_backup.bak';
```

---

## Security Notes for Local Development

**This local setup is NOT production-ready**. Security considerations:

- ✅ Safe for local development and testing
- ❌ Do NOT expose to the internet
- ❌ Do NOT use in production without adding:
  - JWT authentication
  - Password hashing
  - Input validation
  - HTTPS/SSL
  - Rate limiting

See CLOUD_MIGRATION.md for production security setup.

---

## Resources

- **SQL Server Documentation**: https://docs.microsoft.com/en-us/sql/
- **Node.js Guides**: https://nodejs.org/en/docs/
- **Express.js**: https://expressjs.com/
- **SQL Server mssql package**: https://www.npmjs.com/package/mssql

---

## Getting Help

If you encounter issues:

1. Check this troubleshooting section
2. Look at the error messages in:
   - Terminal (API errors)
   - Browser console (Frontend errors)
   - SQL Server error logs
3. Verify all prerequisites are installed correctly
4. Try the test commands above

---

**You're all set!** Start the API, open the frontend, and begin tracking your fitness journey locally. When you're ready to share with others or deploy to production, see `CLOUD_MIGRATION.md`.
