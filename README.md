# FitTrack Pro - MVP Version

A comprehensive fitness tracking application with individual user databases, workout logging, nutrition tracking, body measurements, and cardio activities. Built for local development and cloud deployment.

## 📚 Documentation

- **[LOCAL_SETUP.md](LOCAL_SETUP.md)** - Complete local development setup guide
- **[CLOUD_MIGRATION.md](CLOUD_MIGRATION.md)** - Deploy to Azure, AWS, or other cloud platforms
- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute quick start guide
- **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - Architecture and design decisions
- **[FILE_INVENTORY.md](FILE_INVENTORY.md)** - Detailed file descriptions
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Pre-deployment checklist

## 🎯 Features

### ✅ Current MVP Features
- **User Registration** - Automatic database creation per user
- **Workout Tracking** - Log exercises, sets, reps, weight with variable tracking per set
- **Exercise Library** - Pre-loaded with 35+ common exercises
- **Workout History** - View past workouts with volume calculations
- **Body Measurements** - Track weight, body fat %, and measurements
- **Dashboard** - Overview of recent activity and stats

### 🚧 Coming Soon
- **Nutrition Tracking** - Integration with USDA FoodData Central
- **Cardio Activities** - Running, cycling, swimming tracking
- **Progress Charts** - Visual graphs and trends
- **Workout Templates** - Save and reuse workout plans
- **Personal Records** - Automatic PR tracking
- **Mobile Apps** - iOS and Android native apps

## 📁 Project Structure

```
fittrack-pro/
├── api/
│   ├── server.js          # Node.js/Express API server
│   └── package.json       # API dependencies
├── frontend/
│   ├── App.jsx            # React application
│   └── index.html         # Standalone HTML version (for testing)
└── database/
    └── schema.sql         # SQL Server database schema
```

## 🗄️ Database Architecture

### Database Naming Convention
Each user gets their own database: `firstinitial_lastname_XXXXX`

**Examples:**
- John Smith (first): `j_smith_00000`
- Jane Smith (second): `j_smith_00001`
- Mike Johnson: `m_johnson_00000`

### Tables Per User Database

1. **exercises** - Master list of exercises with muscle groups
2. **workouts** - Individual workout sessions with timestamps
3. **workout_sets** - Each row = 1 set (supports variable weight/reps)
4. **cardio** - Cardio activities (running, cycling, etc.)
5. **nutrition_log** - Food intake with macros
6. **nutrition_goals** - Daily nutrition targets
7. **body_measurements** - Weight and body measurements
8. **workout_templates** - Saved workout plans
9. **template_exercises** - Exercises in templates
10. **personal_records** - Automatic PR tracking
11. **user_preferences** - App settings

### Key Features
- **Normalized structure** - Exercises stored separately from workouts
- **Flexible set tracking** - Each set is its own record
- **Complete history** - All data timestamped for progression tracking
- **Views included** - Pre-built views for common queries
- **Foreign keys** - Proper relationships with cascade delete

## 🚀 Quick Start

### Two Deployment Options

**Option 1: Local Development (Recommended to start)**
- Runs entirely on your computer
- Free SQL Server Express
- Perfect for testing and development
- ⭐ **[See LOCAL_SETUP.md for complete guide](LOCAL_SETUP.md)**

**Option 2: Cloud Production**
- Deploy to Azure, AWS, or other cloud platforms
- Accessible from anywhere
- Professional hosting with backups
- 📚 **[See CLOUD_MIGRATION.md when ready](CLOUD_MIGRATION.md)**

---

## 🏠 Local Setup (Quick Version)

### Prerequisites

1. **Node.js** 16+ ([Download](https://nodejs.org/))
2. **SQL Server** (one of):
   - SQL Server Express (Free) - Recommended
   - SQL Server Developer (Free)
   - SQL Server LocalDB (Free, Windows only)
3. **SQL Server Management Studio** (Optional but helpful)

### Quick Install

```bash
# 1. Clone repository
git clone <repo-url>
cd Gym-App

# 2. Install dependencies
cd api
npm install

# 3. Configure database
cp .env.example .env
# Edit .env with your SQL Server connection

# 4. Start API
npm start

# 5. Open frontend
# Just open frontend/index.html in your browser!
```

That's it! For detailed setup instructions, troubleshooting, and SQL Server installation guide, see **[LOCAL_SETUP.md](LOCAL_SETUP.md)**.

This installs:
- `express` - Web server framework
- `mssql` - SQL Server driver
- `cors` - Cross-origin resource sharing

### Step 3: Configure Database Connection

Edit `api/server.js` lines 19-32 to add your SQL Server credentials:

```javascript
const config = {
    server: '192.168.1.74',
    port: 1433,
    user: 'your_username',        // Add your SQL user
    password: 'your_password',    // Add your password
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};
```

**OR** for Windows Authentication (if on Windows):

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

### Step 4: Test Database Connection

```bash
cd api
node -e "const sql = require('mssql'); const config = {server: '192.168.1.74', port: 1433, options: {encrypt: false, trustServerCertificate: true}}; sql.connect(config).then(() => {console.log('✅ Connected!'); process.exit(0);}).catch(err => {console.error('❌ Failed:', err.message); process.exit(1);});"
```

### Step 5: Start the API Server

```bash
cd api
npm start
```

You should see:
```
===========================================
🚀 FitTrack Pro API Server
===========================================
✅ Server running on port 3001
📡 API endpoint: http://localhost:3001/api
🗄️  Database: 192.168.1.74:1433
===========================================
```

### Step 6: Test the API

Open a browser and go to:
- Health check: http://localhost:3001/api/health
- Connection test: http://localhost:3001/api/test-connection

### Step 7: Open the Frontend

**Option A: Simple HTML (Recommended for Testing)**

1. Open `frontend/index.html` directly in your browser
2. No build step required!

**Option B: React Development (For Full Development)**

```bash
cd frontend
# Create React app if needed
npx create-react-app .
# Copy App.jsx content into src/App.js
npm start
```

## 📱 Usage

### Creating Your First User

1. Open the frontend (index.html or React app)
2. Fill in registration form:
   - First Name: John
   - Last Name: Smith
   - Email: john@example.com
   - Password: (your password)
3. Click "Create Account"
4. Database `j_smith_00000` will be created automatically
5. You're logged in and ready to track!

### Starting a Workout

1. Click "Workouts" tab
2. Click "Start Workout"
3. Enter workout name (optional)
4. Add sets:
   - Select exercise
   - Enter weight (lbs)
   - Enter reps
   - Click "Add Set"
5. Click "Finish Workout" when done

### Tracking Progress

- **Dashboard** - View recent workouts and stats
- **Workouts** - See workout history and volume
- **Progress** - View body measurements (coming soon)
- **Nutrition** - Log meals (integration coming soon)

## 🔧 Troubleshooting

### API Won't Start

**Problem:** `Cannot connect to SQL Server`

**Solutions:**
1. Verify SQL Server is running: `ping 192.168.1.74`
2. Check port is open: `telnet 192.168.1.74 1433`
3. Ensure SQL Server Authentication is enabled
4. Check firewall allows port 1433
5. Verify credentials in `server.js`

### Database Creation Fails

**Problem:** `Permission denied to create database`

**Solution:** Grant your SQL user `dbcreator` role:

```sql
USE master;
ALTER SERVER ROLE dbcreator ADD MEMBER your_username;
```

### Frontend Can't Connect to API

**Problem:** `CORS error` or `Network error`

**Solutions:**
1. Ensure API is running on port 3001
2. Check `API_URL` in frontend code matches your API location
3. If on different machines, update CORS settings in `server.js`

### macOS Connection Issues

**Problem:** Can't connect from Mac to Windows SQL Server

**Solution:** 
- Windows Authentication won't work from macOS
- Use SQL Server Authentication instead
- Install ODBC drivers: `brew install msodbcsql17`

## 🔐 Security Notes

**⚠️ Important for Production:**

1. **Never commit credentials** - Use environment variables
2. **Enable SSL/TLS** - Set `encrypt: true` in production
3. **Add authentication** - Implement JWT or session-based auth
4. **Validate inputs** - Add comprehensive input validation
5. **Rate limiting** - Prevent abuse of API endpoints
6. **Password hashing** - Use bcrypt for password storage

**For MVP/Development:**
- Current setup is fine for local testing
- Add security features before deploying

## 📊 API Endpoints

### User Management
- `POST /api/register` - Register new user (creates database)
- `GET /api/test-connection` - Test database connectivity

### Exercises
- `GET /api/:dbName/exercises` - Get all exercises
- `POST /api/:dbName/exercises` - Add new exercise

### Workouts
- `GET /api/:dbName/workouts` - Get workout history
- `POST /api/:dbName/workouts` - Create new workout
- `PATCH /api/:dbName/workouts/:id/complete` - Complete workout

### Workout Sets
- `GET /api/:dbName/workouts/:id/sets` - Get sets for workout
- `POST /api/:dbName/workouts/:id/sets` - Add set to workout

### Nutrition
- `GET /api/:dbName/nutrition` - Get nutrition log
- `GET /api/:dbName/nutrition/daily-totals` - Get daily totals
- `POST /api/:dbName/nutrition` - Log food/meal

### Body Measurements
- `GET /api/:dbName/measurements` - Get measurements history
- `GET /api/:dbName/measurements/latest` - Get latest measurement
- `POST /api/:dbName/measurements` - Add measurement

### Cardio
- `GET /api/:dbName/cardio` - Get cardio activities
- `POST /api/:dbName/cardio` - Log cardio activity

## 🎨 Customization

### Adding New Exercises

**Method 1: Via API**
```javascript
fetch('http://localhost:3001/api/j_smith_00000/exercises', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        exercise_name: 'Bulgarian Split Squat',
        muscle_group: 'Legs',
        equipment: 'Dumbbell',
        category: 'strength'
    })
});
```

**Method 2: Directly in SQL**
```sql
USE j_smith_00000;
INSERT INTO exercises (exercise_name, muscle_group, equipment)
VALUES ('Bulgarian Split Squat', 'Legs', 'Dumbbell');
```

### Changing Database Naming

Edit `generateDatabaseName()` in `server.js`:

```javascript
function generateDatabaseName(firstName, lastName) {
    // Current: j_smith_XXXXX
    const firstInitial = firstName.charAt(0).toLowerCase();
    const cleanLastName = lastName.toLowerCase().replace(/[^a-z]/g, '');
    return `${firstInitial}_${cleanLastName}`;
    
    // Alternative: full name
    // return `${firstName.toLowerCase()}_${lastName.toLowerCase()}`;
    
    // Alternative: short code
    // return `user`;
}
```

## 📱 Mobile Development

### React Native Setup (Coming Soon)

The architecture is mobile-ready:
1. **API** already provides RESTful endpoints
2. **Database** structure supports multiple platforms
3. **Authentication** ready to add JWT tokens

**Next Steps for Mobile:**
1. Create React Native app: `npx react-native init FitTrackPro`
2. Use same API endpoints with `fetch` or `axios`
3. Add mobile-specific features (camera, GPS, notifications)
4. Publish to App Store and Google Play

### PWA (Progressive Web App)

Convert to PWA for mobile-like experience:
1. Add service worker for offline support
2. Add manifest.json for "Add to Home Screen"
3. Cache API responses locally
4. Works on iOS and Android

## 🔄 Next Development Steps

### Phase 2: Enhanced Features
- [ ] Nutrition integration with USDA FoodData Central
- [ ] Barcode scanning for food logging
- [ ] Progress charts and graphs
- [ ] Photo progress tracking
- [ ] Export data (CSV, PDF)

### Phase 3: Social & Motivation
- [ ] Workout sharing
- [ ] Friend connections
- [ ] Leaderboards
- [ ] Achievement badges
- [ ] Streak tracking

### Phase 4: Advanced Analytics
- [ ] AI workout recommendations
- [ ] Progressive overload suggestions
- [ ] Injury prevention insights
- [ ] Integration with wearables

## 🐛 Known Issues

1. **Food database not integrated** - Nutrition tracking is placeholder
2. **No authentication** - Anyone can access any database if they know the name
3. **No data validation** - Limited input sanitization
4. **No image upload** - Progress photos not yet supported

## 📄 License

MIT License - Free to use and modify

## 👤 Author

Built for Joe - FitTrack Pro MVP

## 🙏 Acknowledgments

- SQL Server for robust database management
- Node.js/Express for API framework
- React for frontend framework
- Tailwind CSS for styling

---

**Ready to start tracking your fitness journey!** 💪

For questions or issues, check the troubleshooting section or review the API endpoints documentation.
