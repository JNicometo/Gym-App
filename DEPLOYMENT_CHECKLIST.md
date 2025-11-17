# FitTrack Pro - Deployment Checklist

Use this checklist to get FitTrack Pro up and running!

## ✅ Pre-Deployment Setup

### Database Prerequisites
- [ ] SQL Server is running at 192.168.1.74:1433
- [ ] SQL Server Authentication is enabled (not just Windows Auth)
- [ ] TCP/IP protocol is enabled in SQL Server Configuration
- [ ] Port 1433 is open in firewall
- [ ] You have credentials with `dbcreator` permissions

**Test Connection:**
```bash
# From terminal
telnet 192.168.1.74 1433

# Or ping
ping 192.168.1.74
```

### Development Environment
- [ ] Node.js 16+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Git installed (optional) (`git --version`)
- [ ] Text editor ready (VS Code, Sublime, etc.)

## ✅ Initial Setup (One-Time)

### 1. Extract Files
- [ ] Download/extract the `fittrack-pro` folder
- [ ] Navigate to project directory
- [ ] Verify folder structure exists:
  ```
  fittrack-pro/
  ├── api/
  ├── frontend/
  └── database/
  ```

### 2. Install Dependencies
```bash
cd fittrack-pro/api
npm install
```

- [ ] No errors during installation
- [ ] `node_modules` folder created
- [ ] See confirmation messages for express, mssql, cors

### 3. Configure Database Credentials

Edit `api/server.js` around line 19-32:

**Option A: SQL Server Authentication**
```javascript
const config = {
    server: '192.168.1.74',
    port: 1433,
    user: 'your_username',        // ← ADD YOUR USERNAME
    password: 'your_password',    // ← ADD YOUR PASSWORD
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};
```

**Option B: Windows Authentication (Windows only)**
```javascript
const config = {
    server: '192.168.1.74',
    port: 1433,
    authentication: {
        type: 'default'  // Uses Windows Authentication
    },
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};
```

- [ ] Credentials added
- [ ] File saved

### 4. Test Database Connection

```bash
cd api
node -e "const sql = require('mssql'); const config = {server: '192.168.1.74', port: 1433, user: 'YOUR_USER', password: 'YOUR_PASS', options: {encrypt: false, trustServerCertificate: true}}; sql.connect(config).then(() => {console.log('✅ SUCCESS!'); process.exit(0);}).catch(err => {console.error('❌ FAILED:', err.message); process.exit(1);});"
```

- [ ] See "✅ SUCCESS!" message
- [ ] No error messages

**If Failed:** Check credentials, SQL Server running, firewall settings

## ✅ First Launch

### 1. Start API Server
```bash
cd api
npm start
```

**Should See:**
```
===========================================
🚀 FitTrack Pro API Server
===========================================
✅ Server running on port 3001
📡 API endpoint: http://localhost:3001/api
🗄️  Database: 192.168.1.74:1433
===========================================
```

- [ ] No error messages
- [ ] Server stays running (doesn't crash)
- [ ] Port 3001 is shown

**If Port In Use:**
- Kill existing process: `lsof -ti:3001 | xargs kill -9`
- Or change port in server.js line 12

### 2. Test API Endpoints

**In browser, visit:**

1. Health Check: http://localhost:3001/api/health
   - [ ] See: `{"status":"ok","message":"FitTrack Pro API is running"}`

2. Connection Test: http://localhost:3001/api/test-connection
   - [ ] See: `{"success":true,"message":"Database connection successful"}`

### 3. Open Frontend

**Method 1: Direct File** (Easiest)
```bash
# Just double-click frontend/index.html
# Or from terminal:

# macOS
open frontend/index.html

# Linux
xdg-open frontend/index.html

# Windows
start frontend/index.html
```

**Method 2: React Development Server**
```bash
cd frontend
npm create-react-app .
# Copy App.jsx content to src/App.js
npm start
```

- [ ] Registration page loads
- [ ] No console errors (F12 to check)
- [ ] Page is responsive

## ✅ First User Registration

### Create Test Account
1. Fill in registration form:
   - First Name: **Test**
   - Last Name: **User**
   - Email: **test@example.com**
   - Password: **password123**

2. Click "Create Account"

**Should See:**
- [ ] Success message: "Registration successful!"
- [ ] Database created: `t_user_00000`
- [ ] Automatically logged in
- [ ] Dashboard loads with stats

**Verify in SQL Server:**
```sql
-- Check database was created
SELECT name FROM sys.databases WHERE name LIKE 't_user%';

-- Connect to database
USE t_user_00000;

-- Check tables exist
SELECT * FROM sys.tables;

-- Check exercises were loaded
SELECT COUNT(*) FROM exercises;  -- Should be 35+
```

- [ ] Database exists
- [ ] All 11 tables exist
- [ ] Exercises table has data

## ✅ First Workout

### Log Test Workout
1. Click "Workouts" tab
2. Click "Start Workout"
3. Enter workout name: **Test Workout**
4. Click "Start Workout"

**Should See:**
- [ ] Workout started message
- [ ] Active workout interface loads
- [ ] Exercise dropdown populated

### Add Sets
1. Select exercise: **Barbell Bench Press**
2. Set #: **1**
3. Weight: **135** lbs
4. Reps: **10**
5. Click "Add Set"

**Should See:**
- [ ] Success message
- [ ] Set number increments to 2

**Add 2 More Sets:**
- Set 2: 135 lbs x 10 reps
- Set 3: 135 lbs x 8 reps

- [ ] All sets added successfully

### Complete Workout
1. Click "Finish Workout"

**Should See:**
- [ ] Workout completed message
- [ ] Returned to workout list
- [ ] New workout appears in history

**Verify in Database:**
```sql
USE t_user_00000;

-- Check workout was created
SELECT * FROM workouts;

-- Check sets were logged
SELECT * FROM workout_sets;

-- Check workout summary view
SELECT * FROM v_workout_summary;
```

- [ ] Workout exists
- [ ] Sets exist (should be 3 rows)
- [ ] Summary shows correct totals

## ✅ Verify All Features

### Dashboard
- [ ] Shows workout count
- [ ] Shows recent activity
- [ ] Stats cards display correctly

### Workouts Tab
- [ ] Can start new workout
- [ ] Can add sets with different weights
- [ ] Can complete workout
- [ ] History shows past workouts
- [ ] Volume calculations are correct

### Exercise Library
**In SQL Server:**
```sql
USE t_user_00000;
SELECT muscle_group, COUNT(*) as count 
FROM exercises 
GROUP BY muscle_group;
```

- [ ] See exercises grouped by muscle
- [ ] Multiple muscle groups present

## ✅ Multi-User Test

### Create Second User
1. Logout (if logged in)
2. Register new user:
   - First Name: **Test**
   - Last Name: **User**
   - Email: **test2@example.com**

**Should See:**
- [ ] Success message
- [ ] New database: `t_user_00001` (incremented!)
- [ ] Completely separate from first user

**Verify Isolation:**
```sql
-- Check both databases exist
SELECT name FROM sys.databases WHERE name LIKE 't_user%';

-- t_user_00000 should have first user's data
USE t_user_00000;
SELECT * FROM workouts;

-- t_user_00001 should be empty
USE t_user_00001;
SELECT * FROM workouts;  -- Should be empty
```

- [ ] Both databases exist
- [ ] Data is completely isolated

## ✅ Mobile Access (Optional)

### Same Network Access
1. Find your computer's IP:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows
   ipconfig | findstr IPv4
   ```

2. Update API URL in `frontend/index.html`:
   ```javascript
   const API_URL = 'http://YOUR_IP:3001/api';
   ```

3. From phone browser:
   ```
   http://YOUR_IP/path/to/frontend/index.html
   ```

- [ ] Phone and computer on same WiFi
- [ ] Can access from phone
- [ ] Registration works on phone

## ✅ Production Readiness (Future)

### Security Checklist
- [ ] Add JWT authentication
- [ ] Hash passwords with bcrypt
- [ ] Enable SSL/TLS (encrypt: true)
- [ ] Add rate limiting
- [ ] Input validation and sanitization
- [ ] HTTPS for production
- [ ] Environment variables for secrets
- [ ] SQL injection testing

### Performance Checklist
- [ ] Database indexes verified
- [ ] Connection pooling configured
- [ ] API response time < 200ms
- [ ] Frontend load time < 2s
- [ ] Mobile performance tested

### Deployment Checklist
- [ ] Choose hosting provider
- [ ] Set up CI/CD pipeline
- [ ] Configure environment variables
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Error logging set up

## ✅ Troubleshooting Completed

### Common Issues Fixed
- [ ] "Cannot connect to database" → Verified credentials
- [ ] "Port in use" → Changed port or killed process
- [ ] "CORS error" → Ensured API running first
- [ ] "Database already exists" → Handled incrementing
- [ ] No exercises loading → Checked schema.sql ran

## ✅ Documentation Review

- [ ] Read README.md completely
- [ ] Read QUICKSTART.md
- [ ] Read PROJECT_OVERVIEW.md
- [ ] Understand database schema
- [ ] Know all API endpoints
- [ ] Comfortable with code structure

## ✅ Next Steps

### Immediate (Week 1)
- [ ] Test with real workouts for 1 week
- [ ] Gather feedback on UX
- [ ] Note any bugs or issues
- [ ] List desired features

### Short-term (Month 1)
- [ ] Integrate food database (192.168.1.74)
- [ ] Build nutrition tracking interface
- [ ] Add progress charts
- [ ] Implement photo uploads

### Medium-term (Months 2-3)
- [ ] Add authentication/login
- [ ] Build workout templates
- [ ] Implement PR tracking
- [ ] Add export functionality

### Long-term (Months 4-6)
- [ ] React Native mobile app
- [ ] iOS App Store submission
- [ ] Android Play Store submission
- [ ] Marketing and launch

## 🎉 Success Criteria

You're ready for production when:
- [ ] 10+ test users created successfully
- [ ] 50+ workouts logged without issues
- [ ] No database errors in logs
- [ ] All features working smoothly
- [ ] Mobile access working
- [ ] Load time < 2 seconds
- [ ] Happy with UI/UX

---

## 📝 Notes Section

**Deployment Date:** _______________

**Server IP:** 192.168.1.74:1433

**SQL Username:** _______________

**First User Database:** _______________

**Issues Encountered:**
1. _______________
2. _______________
3. _______________

**Resolved By:**
1. _______________
2. _______________
3. _______________

---

**Status:** 
- [ ] Development
- [ ] Testing
- [ ] Staging
- [ ] Production

**Last Updated:** _______________

**Next Review:** _______________
