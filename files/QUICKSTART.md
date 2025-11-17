# FitTrack Pro - Quick Start Guide

Get up and running in 5 minutes!

## 🚀 Fastest Path to Running

### Step 1: Install Dependencies (2 minutes)

```bash
cd fittrack-pro/api
npm install
```

### Step 2: Configure Database (1 minute)

Open `api/server.js` and update line 19-32 with your SQL Server credentials:

```javascript
const config = {
    server: '192.168.1.74',
    port: 1433,
    user: 'your_sql_username',      // ADD THIS
    password: 'your_sql_password',  // ADD THIS
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};
```

### Step 3: Start API Server (30 seconds)

```bash
cd api
npm start
```

Should see: `✅ Server running on port 3001`

### Step 4: Open Frontend (30 seconds)

**Double-click:** `frontend/index.html`

OR

**From terminal:**
```bash
# macOS
open frontend/index.html

# Linux
xdg-open frontend/index.html

# Windows
start frontend/index.html
```

### Step 5: Create Your Account (1 minute)

1. Fill in the registration form
2. Click "Create Account"
3. Your personal database will be created automatically!

## ✅ You're Done!

You can now:
- Start workouts
- Log sets
- Track progress
- View history

## 🔍 Verify Everything Works

### Test 1: Check API Health
Open in browser: http://localhost:3001/api/health

Should see: `{"status":"ok","message":"FitTrack Pro API is running"}`

### Test 2: Check Database Connection
Open in browser: http://localhost:3001/api/test-connection

Should see: `{"success":true,"message":"Database connection successful"}`

### Test 3: Register User
1. Open frontend
2. Register with any name/email
3. Should see success message
4. Dashboard should load

## 🐛 Quick Fixes

### "Cannot connect to database"
```bash
# Test connection
ping 192.168.1.74

# Check SQL Server is running
# Verify credentials in server.js
# Ensure SQL Server Authentication is enabled
```

### "Port 3001 already in use"
```bash
# Kill existing process
lsof -ti:3001 | xargs kill -9

# Or change port in server.js (line 12)
const PORT = 3002;  // Use different port
```

### "CORS error in browser"
- Ensure API is running first
- Check API_URL in index.html matches (should be http://localhost:3001/api)

## 📝 What Happens When You Register?

1. API receives your name/email
2. Generates database name: `j_smith_00000`
3. Creates your personal database
4. Runs schema.sql to create all tables
5. Pre-loads 35+ exercises
6. Returns success with your database name
7. Frontend saves user info to localStorage
8. You're logged in!

## 🗄️ Your Database

After registration, check SQL Server:

```sql
-- See your new database
SELECT name FROM sys.databases WHERE name LIKE 'j_smith%';

-- View tables
USE j_smith_00000;
SELECT * FROM sys.tables;

-- See pre-loaded exercises
SELECT * FROM exercises;
```

## 🎯 Next Steps

**Try these features:**
1. Click "Workouts" → "Start Workout"
2. Add a few sets with different exercises
3. Click "Finish Workout"
4. View workout in history
5. Check Dashboard for stats

**Food Database Integration (Coming Next):**
- Your food database is at `192.168.1.74` in `food.main` table
- Next phase will integrate this for nutrition tracking

## 📱 Mobile Access

**Want to use on phone right now?**

1. Find your computer's IP address:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. Update API_URL in `frontend/index.html`:
   ```javascript
   const API_URL = 'http://YOUR_IP:3001/api';  // e.g., http://192.168.1.100:3001/api
   ```

3. Open from phone browser:
   ```
   http://YOUR_IP:3001/frontend/index.html
   ```

Note: Computer and phone must be on same WiFi network

## 💡 Pro Tips

1. **Keep API running** - Don't close the terminal running `npm start`
2. **Use Chrome DevTools** - Press F12 to see any errors
3. **Check Network tab** - See all API calls being made
4. **localStorage** - Your login persists in browser storage

## 🔄 Restart Everything

If something goes wrong:

```bash
# Stop API (Ctrl+C in terminal)
# Restart API
cd api
npm start

# Refresh browser (Cmd+R / Ctrl+R)
# Or clear cache (Cmd+Shift+R / Ctrl+Shift+R)
```

## 📞 Still Having Issues?

1. Check README.md for detailed troubleshooting
2. Verify all prerequisites are met
3. Check SQL Server connectivity
4. Look at browser console for errors (F12)
5. Check terminal for API error messages

---

**You're ready to track your fitness!** 💪

Start with a quick workout to test everything out!
