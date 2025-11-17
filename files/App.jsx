import React, { useState, useEffect } from 'react';
import { 
  User, Dumbbell, Utensils, Scale, Activity, 
  TrendingUp, Plus, Calendar, Check, X, Menu,
  BarChart3, Target, Clock, Award
} from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

const FitTrackPro = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  
  // Registration state
  const [regForm, setRegForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  
  // Workout state
  const [workouts, setWorkouts] = useState([]);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  
  // Nutrition state
  const [nutritionLog, setNutritionLog] = useState([]);
  const [dailyTotals, setDailyTotals] = useState(null);
  
  // Measurements state
  const [measurements, setMeasurements] = useState([]);
  const [latestMeasurement, setLatestMeasurement] = useState(null);
  
  // Cardio state
  const [cardioLog, setCardioLog] = useState([]);

  // ==========================================
  // REGISTRATION & LOGIN
  // ==========================================
  
  const handleRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCurrentUser(data.user);
        localStorage.setItem('fittrack_user', JSON.stringify(data.user));
        alert('Registration successful! Your personal database has been created.');
        loadUserData(data.user.databaseName);
      } else {
        alert('Registration failed: ' + data.error);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Failed to register. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };
  
  const loadUserData = async (dbName) => {
    try {
      // Load exercises
      const exercisesRes = await fetch(`${API_URL}/${dbName}/exercises`);
      setExercises(await exercisesRes.json());
      
      // Load workouts
      const workoutsRes = await fetch(`${API_URL}/${dbName}/workouts?limit=10`);
      setWorkouts(await workoutsRes.json());
      
      // Load latest measurement
      const latestMeasRes = await fetch(`${API_URL}/${dbName}/measurements/latest`);
      setLatestMeasurement(await latestMeasRes.json());
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };
  
  useEffect(() => {
    // Check for saved user
    const savedUser = localStorage.getItem('fittrack_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      loadUserData(user.databaseName);
    }
  }, []);

  // ==========================================
  // REGISTRATION SCREEN
  // ==========================================
  
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-full">
                <Dumbbell className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">FitTrack Pro</h1>
            <p className="text-gray-600">Your Personal Fitness Companion</p>
          </div>
          
          <form onSubmit={handleRegistration} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                required
                value={regForm.firstName}
                onChange={(e) => setRegForm({...regForm, firstName: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                required
                value={regForm.lastName}
                onChange={(e) => setRegForm({...regForm, lastName: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Smith"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={regForm.email}
                onChange={(e) => setRegForm({...regForm, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={regForm.password}
                onChange={(e) => setRegForm({...regForm, password: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            
            {regForm.firstName && regForm.lastName && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  Your database: <span className="font-mono font-semibold text-blue-600">
                    {regForm.firstName.charAt(0).toLowerCase()}_{regForm.lastName.toLowerCase().replace(/[^a-z]/g, '')}_XXXXX
                  </span>
                </p>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Your personal database will be created automatically</p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN APP INTERFACE
  // ==========================================
  
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'nutrition', label: 'Nutrition', icon: Utensils },
    { id: 'measurements', label: 'Progress', icon: Scale },
    { id: 'cardio', label: 'Cardio', icon: Activity }
  ];

  // ==========================================
  // DASHBOARD
  // ==========================================
  
  const Dashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Recent Workouts"
          value={workouts.length}
          icon={Dumbbell}
          color="blue"
        />
        <StatCard
          title="Current Weight"
          value={latestMeasurement?.weight ? `${latestMeasurement.weight} ${latestMeasurement.weight_unit}` : 'N/A'}
          icon={Scale}
          color="green"
        />
        <StatCard
          title="Exercises"
          value={exercises.length}
          icon={Target}
          color="purple"
        />
        <StatCard
          title="Total Volume"
          value="Track"
          icon={BarChart3}
          color="orange"
        />
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        {workouts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No workouts yet. Start your first workout!</p>
        ) : (
          <div className="space-y-3">
            {workouts.slice(0, 5).map(workout => (
              <div key={workout.workout_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{workout.workout_name || 'Workout'}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(workout.workout_date).toLocaleDateString()} • 
                    {workout.exercise_count} exercises • {workout.total_sets} sets
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-blue-600">
                    {workout.total_volume?.toLocaleString()} lbs
                  </p>
                  <p className="text-xs text-gray-500">Total Volume</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ==========================================
  // WORKOUTS TAB
  // ==========================================
  
  const WorkoutsTab = () => {
    const [workoutForm, setWorkoutForm] = useState({
      workout_name: '',
      notes: ''
    });
    
    const [setForm, setSetForm] = useState({
      exercise_id: '',
      weight: '',
      reps: '',
      set_number: 1
    });
    
    const startWorkout = async () => {
      try {
        const response = await fetch(`${API_URL}/${currentUser.databaseName}/workouts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workout_name: workoutForm.workout_name || 'Untitled Workout',
            notes: workoutForm.notes
          })
        });
        
        const newWorkout = await response.json();
        setActiveWorkout(newWorkout);
        setWorkouts([newWorkout, ...workouts]);
        alert('Workout started!');
      } catch (error) {
        console.error('Error starting workout:', error);
      }
    };
    
    const addSet = async () => {
      if (!activeWorkout || !setForm.exercise_id || !setForm.weight || !setForm.reps) {
        alert('Please fill in all fields');
        return;
      }
      
      try {
        await fetch(`${API_URL}/${currentUser.databaseName}/workouts/${activeWorkout.id}/sets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(setForm)
        });
        
        alert('Set added!');
        setSetForm({
          ...setForm,
          set_number: setForm.set_number + 1
        });
      } catch (error) {
        console.error('Error adding set:', error);
      }
    };
    
    const completeWorkout = async () => {
      try {
        await fetch(`${API_URL}/${currentUser.databaseName}/workouts/${activeWorkout.id}/complete`, {
          method: 'PATCH'
        });
        
        alert('Workout completed!');
        setActiveWorkout(null);
        setSetForm({ exercise_id: '', weight: '', reps: '', set_number: 1 });
        loadUserData(currentUser.databaseName);
      } catch (error) {
        console.error('Error completing workout:', error);
      }
    };
    
    return (
      <div className="space-y-6">
        {!activeWorkout ? (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Start New Workout</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Workout Name (optional)"
                value={workoutForm.workout_name}
                onChange={(e) => setWorkoutForm({...workoutForm, workout_name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <textarea
                placeholder="Notes (optional)"
                value={workoutForm.notes}
                onChange={(e) => setWorkoutForm({...workoutForm, notes: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows="3"
              />
              <button
                onClick={startWorkout}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700"
              >
                Start Workout
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold">{activeWorkout.workout_name}</h3>
                <p className="text-sm text-gray-600">Workout in Progress</p>
              </div>
              <button
                onClick={completeWorkout}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Finish
              </button>
            </div>
            
            <div className="space-y-4">
              <select
                value={setForm.exercise_id}
                onChange={(e) => setSetForm({...setForm, exercise_id: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select Exercise</option>
                {exercises.map(ex => (
                  <option key={ex.id} value={ex.id}>
                    {ex.exercise_name} ({ex.muscle_group})
                  </option>
                ))}
              </select>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Set #</label>
                  <input
                    type="number"
                    value={setForm.set_number}
                    onChange={(e) => setSetForm({...setForm, set_number: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (lbs)</label>
                  <input
                    type="number"
                    step="2.5"
                    value={setForm.weight}
                    onChange={(e) => setSetForm({...setForm, weight: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reps</label>
                  <input
                    type="number"
                    value={setForm.reps}
                    onChange={(e) => setSetForm({...setForm, reps: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              
              <button
                onClick={addSet}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Set
              </button>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Workout History</h3>
          {workouts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No workouts yet</p>
          ) : (
            <div className="space-y-3">
              {workouts.map(workout => (
                <div key={workout.workout_id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{workout.workout_name || 'Untitled'}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(workout.workout_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">
                        {workout.total_sets || 0}
                      </p>
                      <p className="text-xs text-gray-500">Total Sets</p>
                    </div>
                  </div>
                  {workout.exercise_count > 0 && (
                    <div className="mt-2 flex gap-4 text-sm text-gray-600">
                      <span>{workout.exercise_count} exercises</span>
                      <span>•</span>
                      <span>{workout.total_volume?.toLocaleString()} lbs volume</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ==========================================
  // NUTRITION TAB (Placeholder)
  // ==========================================
  
  const NutritionTab = () => (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Nutrition Tracking</h3>
      <p className="text-gray-600">
        Nutrition tracking interface coming soon. Will integrate with food database at 192.168.1.74 (food.main table).
      </p>
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Next Steps:</strong> Integrate USDA FoodData Central for comprehensive food database
        </p>
      </div>
    </div>
  );

  // ==========================================
  // MEASUREMENTS TAB (Placeholder)
  // ==========================================
  
  const MeasurementsTab = () => (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Body Measurements</h3>
      {latestMeasurement ? (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">
              {latestMeasurement.weight} {latestMeasurement.weight_unit}
            </p>
            <p className="text-sm text-gray-600">
              Measured on {new Date(latestMeasurement.measurement_date).toLocaleDateString()}
            </p>
          </div>
          <p className="text-gray-600">Full measurement tracking interface coming soon.</p>
        </div>
      ) : (
        <p className="text-gray-600">No measurements recorded yet.</p>
      )}
    </div>
  );

  // ==========================================
  // CARDIO TAB (Placeholder)
  // ==========================================
  
  const CardioTab = () => (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Cardio Activities</h3>
      <p className="text-gray-600">Cardio tracking interface coming soon.</p>
    </div>
  );

  // ==========================================
  // HELPER COMPONENTS
  // ==========================================
  
  const StatCard = ({ title, value, icon: Icon, color }) => {
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600'
    };
    
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    );
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'workouts':
        return <WorkoutsTab />;
      case 'nutrition':
        return <NutritionTab />;
      case 'measurements':
        return <MeasurementsTab />;
      case 'cardio':
        return <CardioTab />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FitTrack Pro</h1>
                <p className="text-xs text-gray-600">
                  {currentUser.firstName} {currentUser.lastName}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to logout?')) {
                  localStorage.removeItem('fittrack_user');
                  setCurrentUser(null);
                }
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default FitTrackPro;
