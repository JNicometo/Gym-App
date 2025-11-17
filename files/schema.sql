-- FitTrack Pro - Complete Database Schema
-- This creates the structure for each user's database
-- Database naming convention: firstinitial_lastname_XXXXX (e.g., j_smith_00000)

-- ====================
-- EXERCISES TABLE
-- ====================
-- Stores master list of exercises with details
CREATE TABLE exercises (
    id INT IDENTITY(1,1) PRIMARY KEY,
    exercise_name NVARCHAR(255) NOT NULL UNIQUE,
    muscle_group NVARCHAR(100),
    equipment NVARCHAR(100),
    category NVARCHAR(50) DEFAULT 'strength', -- 'strength', 'cardio', 'flexibility'
    instructions NVARCHAR(MAX),
    is_active BIT DEFAULT 1,
    created_date DATETIME2 DEFAULT GETDATE()
);

-- Index for fast exercise searches
CREATE INDEX IX_exercises_name ON exercises(exercise_name);
CREATE INDEX IX_exercises_muscle ON exercises(muscle_group);

-- ====================
-- WORKOUTS TABLE
-- ====================
-- Stores individual workout sessions
CREATE TABLE workouts (
    id INT IDENTITY(1,1) PRIMARY KEY,
    workout_name NVARCHAR(255),
    workout_date DATE DEFAULT CAST(GETDATE() AS DATE),
    start_time DATETIME2,
    end_time DATETIME2,
    duration_minutes AS DATEDIFF(MINUTE, start_time, end_time) PERSISTED,
    notes NVARCHAR(MAX),
    is_completed BIT DEFAULT 0,
    created_date DATETIME2 DEFAULT GETDATE()
);

-- Index for date-based queries
CREATE INDEX IX_workouts_date ON workouts(workout_date DESC);

-- ====================
-- WORKOUT SETS TABLE (STRENGTH TRAINING)
-- ====================
-- Each row represents ONE SET of an exercise
-- Allows tracking variable weights/reps per set
CREATE TABLE workout_sets (
    id INT IDENTITY(1,1) PRIMARY KEY,
    workout_id INT NOT NULL,
    exercise_id INT NOT NULL,
    set_number INT NOT NULL,
    weight DECIMAL(8,2), -- Weight in pounds or kg
    reps INT,
    rest_seconds INT, -- Rest time before this set
    rpe DECIMAL(3,1), -- Rate of Perceived Exertion (1-10 scale)
    is_completed BIT DEFAULT 0,
    notes NVARCHAR(500),
    created_date DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT FK_workout_sets_workout FOREIGN KEY (workout_id) 
        REFERENCES workouts(id) ON DELETE CASCADE,
    CONSTRAINT FK_workout_sets_exercise FOREIGN KEY (exercise_id) 
        REFERENCES exercises(id)
);

-- Indexes for performance
CREATE INDEX IX_workout_sets_workout ON workout_sets(workout_id);
CREATE INDEX IX_workout_sets_exercise ON workout_sets(exercise_id);
CREATE INDEX IX_workout_sets_workout_exercise ON workout_sets(workout_id, exercise_id);

-- ====================
-- CARDIO TABLE
-- ====================
-- Tracks cardio/endurance activities
CREATE TABLE cardio (
    id INT IDENTITY(1,1) PRIMARY KEY,
    workout_id INT, -- Optional: link to workout session
    exercise_name NVARCHAR(255) NOT NULL, -- 'Running', 'Cycling', 'Swimming', etc.
    distance DECIMAL(8,2), -- Distance in miles or km
    distance_unit NVARCHAR(10) DEFAULT 'miles', -- 'miles' or 'km'
    duration_minutes INT,
    avg_heart_rate INT,
    max_heart_rate INT,
    calories_burned INT,
    pace NVARCHAR(50), -- e.g., '8:30 min/mile'
    elevation_gain DECIMAL(8,2), -- For activities like running/cycling
    workout_date DATE DEFAULT CAST(GETDATE() AS DATE),
    notes NVARCHAR(MAX),
    created_date DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT FK_cardio_workout FOREIGN KEY (workout_id) 
        REFERENCES workouts(id) ON DELETE SET NULL
);

-- Index for date-based queries
CREATE INDEX IX_cardio_date ON cardio(workout_date DESC);
CREATE INDEX IX_cardio_exercise ON cardio(exercise_name);

-- ====================
-- BODY MEASUREMENTS TABLE
-- ====================
-- Tracks body stats and measurements over time
CREATE TABLE body_measurements (
    id INT IDENTITY(1,1) PRIMARY KEY,
    measurement_date DATE DEFAULT CAST(GETDATE() AS DATE),
    weight DECIMAL(6,2), -- Body weight in lbs or kg
    weight_unit NVARCHAR(10) DEFAULT 'lbs',
    body_fat_percentage DECIMAL(5,2),
    muscle_mass_percentage DECIMAL(5,2),
    
    -- Body measurements in inches or cm
    neck DECIMAL(5,2),
    chest DECIMAL(5,2),
    waist DECIMAL(5,2),
    hips DECIMAL(5,2),
    left_arm DECIMAL(5,2),
    right_arm DECIMAL(5,2),
    left_thigh DECIMAL(5,2),
    right_thigh DECIMAL(5,2),
    left_calf DECIMAL(5,2),
    right_calf DECIMAL(5,2),
    
    measurement_unit NVARCHAR(10) DEFAULT 'inches',
    notes NVARCHAR(500),
    created_date DATETIME2 DEFAULT GETDATE()
);

-- Index for date-based queries
CREATE INDEX IX_body_measurements_date ON body_measurements(measurement_date DESC);

-- ====================
-- NUTRITION TABLE
-- ====================
-- Tracks daily food intake and macros
CREATE TABLE nutrition_log (
    id INT IDENTITY(1,1) PRIMARY KEY,
    log_date DATE DEFAULT CAST(GETDATE() AS DATE),
    meal_type NVARCHAR(50), -- 'breakfast', 'lunch', 'dinner', 'snack'
    food_name NVARCHAR(255) NOT NULL,
    serving_size DECIMAL(8,2),
    serving_unit NVARCHAR(50),
    
    -- Macros
    calories INT,
    protein DECIMAL(8,2),
    carbs DECIMAL(8,2),
    fat DECIMAL(8,2),
    fiber DECIMAL(8,2),
    sugar DECIMAL(8,2),
    sodium INT,
    
    -- From food database
    food_database_id NVARCHAR(100), -- Reference to USDA or external DB
    notes NVARCHAR(500),
    created_date DATETIME2 DEFAULT GETDATE()
);

-- Indexes for date and meal type queries
CREATE INDEX IX_nutrition_date ON nutrition_log(log_date DESC);
CREATE INDEX IX_nutrition_date_meal ON nutrition_log(log_date, meal_type);

-- ====================
-- NUTRITION GOALS TABLE
-- ====================
-- Stores user's daily nutrition targets
CREATE TABLE nutrition_goals (
    id INT IDENTITY(1,1) PRIMARY KEY,
    goal_name NVARCHAR(100) DEFAULT 'Default Goals',
    daily_calories INT DEFAULT 2000,
    daily_protein DECIMAL(8,2) DEFAULT 150,
    daily_carbs DECIMAL(8,2) DEFAULT 200,
    daily_fat DECIMAL(8,2) DEFAULT 67,
    daily_fiber DECIMAL(8,2) DEFAULT 30,
    start_date DATE DEFAULT CAST(GETDATE() AS DATE),
    end_date DATE,
    is_active BIT DEFAULT 1,
    created_date DATETIME2 DEFAULT GETDATE()
);

-- ====================
-- WORKOUT TEMPLATES TABLE
-- ====================
-- Saves workout plans for easy reuse
CREATE TABLE workout_templates (
    id INT IDENTITY(1,1) PRIMARY KEY,
    template_name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    category NVARCHAR(100), -- 'Push', 'Pull', 'Legs', etc.
    is_active BIT DEFAULT 1,
    created_date DATETIME2 DEFAULT GETDATE()
);

-- ====================
-- TEMPLATE EXERCISES TABLE
-- ====================
-- Links exercises to templates with planned sets/reps
CREATE TABLE template_exercises (
    id INT IDENTITY(1,1) PRIMARY KEY,
    template_id INT NOT NULL,
    exercise_id INT NOT NULL,
    exercise_order INT DEFAULT 1,
    target_sets INT,
    target_reps_min INT,
    target_reps_max INT,
    target_weight DECIMAL(8,2),
    rest_seconds INT DEFAULT 90,
    notes NVARCHAR(500),
    
    CONSTRAINT FK_template_exercises_template FOREIGN KEY (template_id) 
        REFERENCES workout_templates(id) ON DELETE CASCADE,
    CONSTRAINT FK_template_exercises_exercise FOREIGN KEY (exercise_id) 
        REFERENCES exercises(id)
);

-- Index for template queries
CREATE INDEX IX_template_exercises_template ON template_exercises(template_id, exercise_order);

-- ====================
-- PERSONAL RECORDS TABLE
-- ====================
-- Tracks PRs automatically
CREATE TABLE personal_records (
    id INT IDENTITY(1,1) PRIMARY KEY,
    exercise_id INT NOT NULL,
    record_type NVARCHAR(50), -- '1RM', '3RM', '5RM', 'Max Reps', 'Max Weight', etc.
    value DECIMAL(8,2), -- Weight or rep count
    reps INT,
    achieved_date DATE DEFAULT CAST(GETDATE() AS DATE),
    workout_id INT, -- Link to the workout where PR was achieved
    notes NVARCHAR(500),
    created_date DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT FK_personal_records_exercise FOREIGN KEY (exercise_id) 
        REFERENCES exercises(id),
    CONSTRAINT FK_personal_records_workout FOREIGN KEY (workout_id) 
        REFERENCES workouts(id) ON DELETE SET NULL
);

-- Index for exercise-based PR lookups
CREATE INDEX IX_personal_records_exercise ON personal_records(exercise_id, achieved_date DESC);

-- ====================
-- USER PREFERENCES TABLE
-- ====================
-- Stores app settings and preferences
CREATE TABLE user_preferences (
    id INT IDENTITY(1,1) PRIMARY KEY,
    preference_key NVARCHAR(100) NOT NULL UNIQUE,
    preference_value NVARCHAR(MAX),
    data_type NVARCHAR(50) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    updated_date DATETIME2 DEFAULT GETDATE()
);

-- Insert default preferences
INSERT INTO user_preferences (preference_key, preference_value, data_type) VALUES
('weight_unit', 'lbs', 'string'),
('distance_unit', 'miles', 'string'),
('measurement_unit', 'inches', 'string'),
('theme', 'light', 'string'),
('rest_timer_enabled', 'true', 'boolean'),
('default_rest_seconds', '90', 'number');

-- ====================
-- INSERT DEFAULT EXERCISES
-- ====================
INSERT INTO exercises (exercise_name, muscle_group, equipment, category) VALUES
-- Chest
('Barbell Bench Press', 'Chest', 'Barbell', 'strength'),
('Incline Dumbbell Press', 'Chest', 'Dumbbell', 'strength'),
('Decline Bench Press', 'Chest', 'Barbell', 'strength'),
('Dumbbell Flyes', 'Chest', 'Dumbbell', 'strength'),
('Push-ups', 'Chest', 'Bodyweight', 'strength'),
('Cable Crossover', 'Chest', 'Cable', 'strength'),

-- Back
('Barbell Deadlift', 'Back', 'Barbell', 'strength'),
('Pull-ups', 'Back', 'Bodyweight', 'strength'),
('Bent-Over Barbell Row', 'Back', 'Barbell', 'strength'),
('Lat Pulldown', 'Back', 'Cable', 'strength'),
('Seated Cable Row', 'Back', 'Cable', 'strength'),
('T-Bar Row', 'Back', 'Barbell', 'strength'),
('Dumbbell Row', 'Back', 'Dumbbell', 'strength'),

-- Legs
('Barbell Squat', 'Legs', 'Barbell', 'strength'),
('Front Squat', 'Legs', 'Barbell', 'strength'),
('Romanian Deadlift', 'Legs', 'Barbell', 'strength'),
('Leg Press', 'Legs', 'Machine', 'strength'),
('Leg Extension', 'Legs', 'Machine', 'strength'),
('Leg Curl', 'Legs', 'Machine', 'strength'),
('Walking Lunges', 'Legs', 'Dumbbell', 'strength'),
('Calf Raises', 'Legs', 'Machine', 'strength'),

-- Shoulders
('Overhead Press', 'Shoulders', 'Barbell', 'strength'),
('Dumbbell Shoulder Press', 'Shoulders', 'Dumbbell', 'strength'),
('Lateral Raises', 'Shoulders', 'Dumbbell', 'strength'),
('Front Raises', 'Shoulders', 'Dumbbell', 'strength'),
('Rear Delt Flyes', 'Shoulders', 'Dumbbell', 'strength'),
('Face Pulls', 'Shoulders', 'Cable', 'strength'),

-- Arms
('Barbell Curl', 'Arms', 'Barbell', 'strength'),
('Dumbbell Curl', 'Arms', 'Dumbbell', 'strength'),
('Hammer Curl', 'Arms', 'Dumbbell', 'strength'),
('Tricep Dips', 'Arms', 'Bodyweight', 'strength'),
('Tricep Pushdown', 'Arms', 'Cable', 'strength'),
('Skull Crushers', 'Arms', 'Barbell', 'strength'),
('Close-Grip Bench Press', 'Arms', 'Barbell', 'strength'),

-- Core
('Plank', 'Core', 'Bodyweight', 'strength'),
('Crunches', 'Core', 'Bodyweight', 'strength'),
('Russian Twists', 'Core', 'Bodyweight', 'strength'),
('Hanging Leg Raises', 'Core', 'Bodyweight', 'strength'),
('Cable Crunches', 'Core', 'Cable', 'strength');

-- ====================
-- VIEWS FOR COMMON QUERIES
-- ====================

-- View: Latest body measurements
CREATE VIEW v_latest_measurements AS
SELECT TOP 1 *
FROM body_measurements
ORDER BY measurement_date DESC, created_date DESC;
GO

-- View: Daily nutrition totals
CREATE VIEW v_daily_nutrition_totals AS
SELECT 
    log_date,
    SUM(calories) as total_calories,
    SUM(protein) as total_protein,
    SUM(carbs) as total_carbs,
    SUM(fat) as total_fat,
    SUM(fiber) as total_fiber,
    COUNT(*) as meal_count
FROM nutrition_log
GROUP BY log_date;
GO

-- View: Workout summary with volume
CREATE VIEW v_workout_summary AS
SELECT 
    w.id as workout_id,
    w.workout_name,
    w.workout_date,
    w.duration_minutes,
    COUNT(DISTINCT ws.exercise_id) as exercise_count,
    COUNT(ws.id) as total_sets,
    SUM(ws.weight * ws.reps) as total_volume,
    AVG(ws.rpe) as avg_rpe
FROM workouts w
LEFT JOIN workout_sets ws ON w.id = ws.workout_id
GROUP BY w.id, w.workout_name, w.workout_date, w.duration_minutes;
GO

-- View: Exercise progress over time
CREATE VIEW v_exercise_progress AS
SELECT 
    e.exercise_name,
    ws.exercise_id,
    w.workout_date,
    MAX(ws.weight) as max_weight,
    MAX(ws.reps) as max_reps,
    SUM(ws.weight * ws.reps) as total_volume,
    COUNT(ws.id) as total_sets
FROM workout_sets ws
JOIN workouts w ON ws.workout_id = w.id
JOIN exercises e ON ws.exercise_id = e.id
WHERE ws.is_completed = 1
GROUP BY e.exercise_name, ws.exercise_id, w.workout_date;
GO

PRINT 'FitTrack Pro database schema created successfully!';
PRINT 'Database includes: Exercises, Workouts, Nutrition, Body Measurements, Cardio, and more';
