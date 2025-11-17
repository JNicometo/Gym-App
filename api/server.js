// FitTrack Pro - Node.js/Express API Server
// Handles user registration, database provisioning, and all CRUD operations

const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SQL Server Configuration
const config = {
    server: '192.168.1.74',
    port: 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    // Add authentication here if needed
    // user: 'your_username',
    // password: 'your_password',
    // Or use Windows Authentication if on Windows
    authentication: {
        type: 'default'
    }
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Generate database name from user's name
 * Format: firstinitial_lastname_XXXXX
 */
function generateDatabaseName(firstName, lastName) {
    const firstInitial = firstName.charAt(0).toLowerCase();
    const cleanLastName = lastName.toLowerCase().replace(/[^a-z]/g, '');
    return `${firstInitial}_${cleanLastName}`;
}

/**
 * Get the next available user number for a given base name
 */
async function getNextUserNumber(baseName) {
    try {
        const masterConfig = { ...config, database: 'master' };
        const pool = await sql.connect(masterConfig);

        // Find all databases matching the pattern
        const result = await pool.request()
            .query(`
                SELECT name
                FROM sys.databases
                WHERE name LIKE '${baseName}_%'
                AND name NOT IN ('master', 'tempdb', 'model', 'msdb')
                ORDER BY name
            `);

        let nextNumber = 0;

        if (result.recordset.length > 0) {
            // Extract numbers and find the highest
            const numbers = result.recordset
                .map(db => {
                    const parts = db.name.split('_');
                    const lastPart = parts[parts.length - 1];
                    return parseInt(lastPart, 10);
                })
                .filter(num => !isNaN(num));

            if (numbers.length > 0) {
                nextNumber = Math.max(...numbers) + 1;
            }
        }

        await pool.close();
        return nextNumber.toString().padStart(5, '0');
    } catch (error) {
        console.error('Error getting next user number:', error);
        throw error;
    }
}

/**
 * Create a new user database with all tables
 */
async function createUserDatabase(dbName) {
    let masterPool = null;
    let userPool = null;

    try {
        // Connect to master to create database
        const masterConfig = { ...config, database: 'master' };
        masterPool = await sql.connect(masterConfig);

        console.log(`Creating database: ${dbName}`);

        // Check if database already exists
        const checkDb = await masterPool.request()
            .input('dbName', sql.NVarChar, dbName)
            .query(`SELECT database_id FROM sys.databases WHERE name = @dbName`);

        if (checkDb.recordset.length > 0) {
            throw new Error('Database already exists');
        }

        // Create database
        await masterPool.request()
            .query(`CREATE DATABASE [${dbName}]`);

        console.log(`Database ${dbName} created successfully`);

        await masterPool.close();
        masterPool = null;

        // Wait for database to be ready
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Connect to new database
        const userConfig = { ...config, database: dbName };
        userPool = await sql.connect(userConfig);

        // Read and execute schema file
        const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');

        // Split schema into individual statements and execute
        const statements = schema
            .split('GO')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('PRINT'));

        for (const statement of statements) {
            if (statement.length > 0) {
                await userPool.request().query(statement);
            }
        }

        console.log(`Database ${dbName} schema initialized successfully`);

        await userPool.close();
        userPool = null;

        return true;
    } catch (error) {
        console.error('Error creating user database:', error);

        // Cleanup connections
        if (masterPool) await masterPool.close();
        if (userPool) await userPool.close();

        throw error;
    }
}

/**
 * Get connection to a specific user database
 */
async function getUserDatabaseConnection(dbName) {
    const userConfig = { ...config, database: dbName };
    return await sql.connect(userConfig);
}

// ==========================================
// API ENDPOINTS
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'FitTrack Pro API is running' });
});

// Test database connection
app.get('/api/test-connection', async (req, res) => {
    try {
        const masterConfig = { ...config, database: 'master' };
        const pool = await sql.connect(masterConfig);
        await pool.close();
        res.json({ success: true, message: 'Database connection successful' });
    } catch (error) {
        console.error('Connection test failed:', error);
        res.status(500).json({
            success: false,
            error: 'Database connection failed',
            details: error.message
        });
    }
});

// ==========================================
// USER REGISTRATION & MANAGEMENT
// ==========================================

/**
 * Register a new user - creates their personal database
 */
app.post('/api/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Validate input
        if (!firstName || !lastName || !email) {
            return res.status(400).json({
                error: 'First name, last name, and email are required'
            });
        }

        // Generate database name
        const baseName = generateDatabaseName(firstName, lastName);
        const userNumber = await getNextUserNumber(baseName);
        const dbName = `${baseName}_${userNumber}`;

        console.log(`Registering user: ${firstName} ${lastName}`);
        console.log(`Database name: ${dbName}`);

        // Create user database
        await createUserDatabase(dbName);

        // Return success with user info
        res.json({
            success: true,
            message: 'User registered successfully',
            user: {
                firstName,
                lastName,
                email,
                databaseName: dbName,
                userNumber
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Failed to register user',
            details: error.message
        });
    }
});

// ==========================================
// EXERCISES API
// ==========================================

// Get all exercises for a user
app.get('/api/:dbName/exercises', async (req, res) => {
    let pool = null;
    try {
        const { dbName } = req.params;
        pool = await getUserDatabaseConnection(dbName);

        const result = await pool.request()
            .query(`
                SELECT * FROM exercises
                WHERE is_active = 1
                ORDER BY muscle_group, exercise_name
            `);

        await pool.close();
        res.json(result.recordset);
    } catch (error) {
        if (pool) await pool.close();
        console.error('Error fetching exercises:', error);
        res.status(500).json({ error: 'Failed to fetch exercises' });
    }
});

// Add a new exercise
app.post('/api/:dbName/exercises', async (req, res) => {
    let pool = null;
    try {
        const { dbName } = req.params;
        const { exercise_name, muscle_group, equipment, category, instructions } = req.body;

        pool = await getUserDatabaseConnection(dbName);

        const result = await pool.request()
            .input('name', sql.NVarChar, exercise_name)
            .input('muscle', sql.NVarChar, muscle_group)
            .input('equip', sql.NVarChar, equipment)
            .input('cat', sql.NVarChar, category || 'strength')
            .input('inst', sql.NVarChar, instructions)
            .query(`
                INSERT INTO exercises (exercise_name, muscle_group, equipment, category, instructions)
                OUTPUT INSERTED.*
                VALUES (@name, @muscle, @equip, @cat, @inst)
            `);

        await pool.close();
        res.json(result.recordset[0]);
    } catch (error) {
        if (pool) await pool.close();
        console.error('Error adding exercise:', error);
        res.status(500).json({ error: 'Failed to add exercise' });
    }
});

// ==========================================
// WORKOUTS API
// ==========================================

// Get all workouts for a user
app.get('/api/:dbName/workouts', async (req, res) => {
    let pool = null;
    try {
        const { dbName } = req.params;
        const { limit = 50 } = req.query;

        pool = await getUserDatabaseConnection(dbName);

        const result = await pool.request()
            .input('limit', sql.Int, parseInt(limit))
            .query(`
                SELECT TOP (@limit) * FROM v_workout_summary
                ORDER BY workout_date DESC
            `);

        await pool.close();
        res.json(result.recordset);
    } catch (error) {
        if (pool) await pool.close();
        console.error('Error fetching workouts:', error);
        res.status(500).json({ error: 'Failed to fetch workouts' });
    }
});

// Create a new workout
app.post('/api/:dbName/workouts', async (req, res) => {
    let pool = null;
    try {
        const { dbName } = req.params;
        const { workout_name, workout_date, notes } = req.body;

        pool = await getUserDatabaseConnection(dbName);

        const result = await pool.request()
            .input('name', sql.NVarChar, workout_name)
            .input('date', sql.Date, workout_date || new Date())
            .input('notes', sql.NVarChar, notes)
            .input('start', sql.DateTime2, new Date())
            .query(`
                INSERT INTO workouts (workout_name, workout_date, start_time, notes)
                OUTPUT INSERTED.*
                VALUES (@name, @date, @start, @notes)
            `);

        await pool.close();
        res.json(result.recordset[0]);
    } catch (error) {
        if (pool) await pool.close();
        console.error('Error creating workout:', error);
        res.status(500).json({ error: 'Failed to create workout' });
    }
});

// Complete a workout (set end time)
app.patch('/api/:dbName/workouts/:workoutId/complete', async (req, res) => {
    let pool = null;
    try {
        const { dbName, workoutId } = req.params;

        pool = await getUserDatabaseConnection(dbName);

        const result = await pool.request()
            .input('id', sql.Int, workoutId)
            .input('end', sql.DateTime2, new Date())
            .query(`
                UPDATE workouts
                SET end_time = @end, is_completed = 1
                OUTPUT INSERTED.*
                WHERE id = @id
            `);

        await pool.close();
        res.json(result.recordset[0]);
    } catch (error) {
        if (pool) await pool.close();
        console.error('Error completing workout:', error);
        res.status(500).json({ error: 'Failed to complete workout' });
    }
});

// ==========================================
// WORKOUT SETS API
// ==========================================

// Get sets for a specific workout
app.get('/api/:dbName/workouts/:workoutId/sets', async (req, res) => {
    let pool = null;
    try {
        const { dbName, workoutId } = req.params;

        pool = await getUserDatabaseConnection(dbName);

        const result = await pool.request()
            .input('workoutId', sql.Int, workoutId)
            .query(`
                SELECT ws.*, e.exercise_name, e.muscle_group
                FROM workout_sets ws
                JOIN exercises e ON ws.exercise_id = e.id
                WHERE ws.workout_id = @workoutId
                ORDER BY ws.created_date, ws.set_number
            `);

        await pool.close();
        res.json(result.recordset);
    } catch (error) {
        if (pool) await pool.close();
        console.error('Error fetching workout sets:', error);
        res.status(500).json({ error: 'Failed to fetch workout sets' });
    }
});

// Add a set to a workout
app.post('/api/:dbName/workouts/:workoutId/sets', async (req, res) => {
    let pool = null;
    try {
        const { dbName, workoutId } = req.params;
        const { exercise_id, set_number, weight, reps, rest_seconds, rpe, notes } = req.body;

        pool = await getUserDatabaseConnection(dbName);

        const result = await pool.request()
            .input('workoutId', sql.Int, workoutId)
            .input('exerciseId', sql.Int, exercise_id)
            .input('setNum', sql.Int, set_number)
            .input('weight', sql.Decimal(8, 2), weight)
            .input('reps', sql.Int, reps)
            .input('rest', sql.Int, rest_seconds)
            .input('rpe', sql.Decimal(3, 1), rpe)
            .input('notes', sql.NVarChar, notes)
            .query(`
                INSERT INTO workout_sets
                (workout_id, exercise_id, set_number, weight, reps, rest_seconds, rpe, notes, is_completed)
                OUTPUT INSERTED.*
                VALUES (@workoutId, @exerciseId, @setNum, @weight, @reps, @rest, @rpe, @notes, 1)
            `);

        await pool.close();
        res.json(result.recordset[0]);
    } catch (error) {
        if (pool) await pool.close();
        console.error('Error adding set:', error);
        res.status(500).json({ error: 'Failed to add set' });
    }
});

// ==========================================
// NUTRITION API
// ==========================================

// Get nutrition log for a date
app.get('/api/:dbName/nutrition', async (req, res) => {
    let pool = null;
    try {
        const { dbName } = req.params;
        const { date } = req.query;

        pool = await getUserDatabaseConnection(dbName);

        let query;
        const request = pool.request();

        if (date) {
            request.input('date', sql.Date, date);
            query = 'SELECT * FROM nutrition_log WHERE log_date = @date ORDER BY created_date';
        } else {
            query = 'SELECT * FROM nutrition_log ORDER BY log_date DESC, created_date DESC';
        }

        const result = await request.query(query);

        await pool.close();
        res.json(result.recordset);
    } catch (error) {
        if (pool) await pool.close();
        console.error('Error fetching nutrition:', error);
        res.status(500).json({ error: 'Failed to fetch nutrition' });
    }
});

// Get daily nutrition totals
app.get('/api/:dbName/nutrition/daily-totals', async (req, res) => {
    let pool = null;
    try {
        const { dbName } = req.params;
        const { date } = req.query;

        pool = await getUserDatabaseConnection(dbName);

        const request = pool.request();

        let query;
        if (date) {
            request.input('date', sql.Date, date);
            query = 'SELECT * FROM v_daily_nutrition_totals WHERE log_date = @date';
        } else {
            query = 'SELECT TOP 30 * FROM v_daily_nutrition_totals ORDER BY log_date DESC';
        }

        const result = await request.query(query);

        await pool.close();
        res.json(result.recordset);
    } catch (error) {
        if (pool) await pool.close();
        console.error('Error fetching nutrition totals:', error);
        res.status(500).json({ error: 'Failed to fetch nutrition totals' });
    }
});

// Log food/meal
app.post('/api/:dbName/nutrition', async (req, res) => {
    let pool = null;
    try {
        const { dbName } = req.params;
        const {
            food_name, meal_type, serving_size, serving_unit,
            calories, protein, carbs, fat, fiber, sugar, sodium,
            food_database_id, notes, log_date
        } = req.body;

        pool = await getUserDatabaseConnection(dbName);

        const result = await pool.request()
            .input('date', sql.Date, log_date || new Date())
            .input('meal', sql.NVarChar, meal_type)
            .input('food', sql.NVarChar, food_name)
            .input('servSize', sql.Decimal(8, 2), serving_size)
            .input('servUnit', sql.NVarChar, serving_unit)
            .input('cal', sql.Int, calories)
            .input('pro', sql.Decimal(8, 2), protein)
            .input('carbs', sql.Decimal(8, 2), carbs)
            .input('fat', sql.Decimal(8, 2), fat)
            .input('fiber', sql.Decimal(8, 2), fiber)
            .input('sugar', sql.Decimal(8, 2), sugar)
            .input('sodium', sql.Int, sodium)
            .input('dbId', sql.NVarChar, food_database_id)
            .input('notes', sql.NVarChar, notes)
            .query(`
                INSERT INTO nutrition_log
                (log_date, meal_type, food_name, serving_size, serving_unit,
                 calories, protein, carbs, fat, fiber, sugar, sodium, food_database_id, notes)
                OUTPUT INSERTED.*
                VALUES (@date, @meal, @food, @servSize, @servUnit,
                        @cal, @pro, @carbs, @fat, @fiber, @sugar, @sodium, @dbId, @notes)
            `);

        await pool.close();
        res.json(result.recordset[0]);
    } catch (error) {
        if (pool) await pool.close();
        console.error('Error logging food:', error);
        res.status(500).json({ error: 'Failed to log food' });
    }
});

// ==========================================
// BODY MEASUREMENTS API
// ==========================================

// Get body measurements
app.get('/api/:dbName/measurements', async (req, res) => {
    let pool = null;
    try {
        const { dbName } = req.params;
        const { limit = 30 } = req.query;

        pool = await getUserDatabaseConnection(dbName);

        const result = await pool.request()
            .input('limit', sql.Int, parseInt(limit))
            .query(`
                SELECT TOP (@limit) * FROM body_measurements
                ORDER BY measurement_date DESC
            `);

        await pool.close();
        res.json(result.recordset);
    } catch (error) {
        if (pool) await pool.close();
        console.error('Error fetching measurements:', error);
        res.status(500).json({ error: 'Failed to fetch measurements' });
    }
});

// Get latest measurement
app.get('/api/:dbName/measurements/latest', async (req, res) => {
    let pool = null;
    try {
        const { dbName } = req.params;

        pool = await getUserDatabaseConnection(dbName);

        const result = await pool.request()
            .query('SELECT * FROM v_latest_measurements');

        await pool.close();
        res.json(result.recordset[0] || null);
    } catch (error) {
        if (pool) await pool.close();
        console.error('Error fetching latest measurement:', error);
        res.status(500).json({ error: 'Failed to fetch latest measurement' });
    }
});

// Add body measurement
app.post('/api/:dbName/measurements', async (req, res) => {
    let pool = null;
    try {
        const { dbName } = req.params;
        const {
            weight, weight_unit, body_fat_percentage, muscle_mass_percentage,
            neck, chest, waist, hips, left_arm, right_arm,
            left_thigh, right_thigh, left_calf, right_calf,
            measurement_unit, measurement_date, notes
        } = req.body;

        pool = await getUserDatabaseConnection(dbName);

        const result = await pool.request()
            .input('date', sql.Date, measurement_date || new Date())
            .input('weight', sql.Decimal(6, 2), weight)
            .input('weightUnit', sql.NVarChar, weight_unit || 'lbs')
            .input('bodyFat', sql.Decimal(5, 2), body_fat_percentage)
            .input('muscle', sql.Decimal(5, 2), muscle_mass_percentage)
            .input('neck', sql.Decimal(5, 2), neck)
            .input('chest', sql.Decimal(5, 2), chest)
            .input('waist', sql.Decimal(5, 2), waist)
            .input('hips', sql.Decimal(5, 2), hips)
            .input('leftArm', sql.Decimal(5, 2), left_arm)
            .input('rightArm', sql.Decimal(5, 2), right_arm)
            .input('leftThigh', sql.Decimal(5, 2), left_thigh)
            .input('rightThigh', sql.Decimal(5, 2), right_thigh)
            .input('leftCalf', sql.Decimal(5, 2), left_calf)
            .input('rightCalf', sql.Decimal(5, 2), right_calf)
            .input('measUnit', sql.NVarChar, measurement_unit || 'inches')
            .input('notes', sql.NVarChar, notes)
            .query(`
                INSERT INTO body_measurements
                (measurement_date, weight, weight_unit, body_fat_percentage, muscle_mass_percentage,
                 neck, chest, waist, hips, left_arm, right_arm, left_thigh, right_thigh,
                 left_calf, right_calf, measurement_unit, notes)
                OUTPUT INSERTED.*
                VALUES (@date, @weight, @weightUnit, @bodyFat, @muscle,
                        @neck, @chest, @waist, @hips, @leftArm, @rightArm, @leftThigh, @rightThigh,
                        @leftCalf, @rightCalf, @measUnit, @notes)
            `);

        await pool.close();
        res.json(result.recordset[0]);
    } catch (error) {
        if (pool) await pool.close();
        console.error('Error adding measurement:', error);
        res.status(500).json({ error: 'Failed to add measurement' });
    }
});

// ==========================================
// CARDIO API
// ==========================================

// Get cardio activities
app.get('/api/:dbName/cardio', async (req, res) => {
    let pool = null;
    try {
        const { dbName } = req.params;
        const { limit = 50 } = req.query;

        pool = await getUserDatabaseConnection(dbName);

        const result = await pool.request()
            .input('limit', sql.Int, parseInt(limit))
            .query(`
                SELECT TOP (@limit) * FROM cardio
                ORDER BY workout_date DESC
            `);

        await pool.close();
        res.json(result.recordset);
    } catch (error) {
        if (pool) await pool.close();
        console.error('Error fetching cardio:', error);
        res.status(500).json({ error: 'Failed to fetch cardio' });
    }
});

// Log cardio activity
app.post('/api/:dbName/cardio', async (req, res) => {
    let pool = null;
    try {
        const { dbName } = req.params;
        const {
            exercise_name, distance, distance_unit, duration_minutes,
            avg_heart_rate, max_heart_rate, calories_burned,
            pace, elevation_gain, workout_date, notes
        } = req.body;

        pool = await getUserDatabaseConnection(dbName);

        const result = await pool.request()
            .input('exercise', sql.NVarChar, exercise_name)
            .input('distance', sql.Decimal(8, 2), distance)
            .input('distUnit', sql.NVarChar, distance_unit || 'miles')
            .input('duration', sql.Int, duration_minutes)
            .input('avgHr', sql.Int, avg_heart_rate)
            .input('maxHr', sql.Int, max_heart_rate)
            .input('calories', sql.Int, calories_burned)
            .input('pace', sql.NVarChar, pace)
            .input('elevation', sql.Decimal(8, 2), elevation_gain)
            .input('date', sql.Date, workout_date || new Date())
            .input('notes', sql.NVarChar, notes)
            .query(`
                INSERT INTO cardio
                (exercise_name, distance, distance_unit, duration_minutes,
                 avg_heart_rate, max_heart_rate, calories_burned,
                 pace, elevation_gain, workout_date, notes)
                OUTPUT INSERTED.*
                VALUES (@exercise, @distance, @distUnit, @duration,
                        @avgHr, @maxHr, @calories, @pace, @elevation, @date, @notes)
            `);

        await pool.close();
        res.json(result.recordset[0]);
    } catch (error) {
        if (pool) await pool.close();
        console.error('Error logging cardio:', error);
        res.status(500).json({ error: 'Failed to log cardio' });
    }
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
    console.log('===========================================');
    console.log('🚀 FitTrack Pro API Server');
    console.log('===========================================');
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
    console.log(`🗄️  Database: ${config.server}:${config.port}`);
    console.log('===========================================');
});

module.exports = app;
