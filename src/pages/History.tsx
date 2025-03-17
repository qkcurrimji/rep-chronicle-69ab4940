
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Filter, Search, Download } from "lucide-react";
import WorkoutCard from "@/components/WorkoutCard";

interface Workout {
  id: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  date: Date;
}

// Generate mock historical workout data
const generateHistoricalWorkouts = () => {
  const mockExercises = [
    "Bench Press", "Squat", "Deadlift", "Pull Up", "Shoulder Press",
    "Bicep Curl", "Tricep Extension", "Lat Pulldown", "Leg Press"
  ];
  
  const workouts: Workout[] = [];
  
  // Create workouts for the past 14 days
  for (let i = 14; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Skip some days to make it realistic
    if (i % 3 === 2) continue;
    
    // Add 1-3 workouts per day
    const workoutsCount = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < workoutsCount; j++) {
      workouts.push({
        id: `workout-${i}-${j}`,
        exercise: mockExercises[Math.floor(Math.random() * mockExercises.length)],
        sets: Math.floor(Math.random() * 5) + 1,
        reps: Math.floor(Math.random() * 12) + 5,
        weight: Math.floor(Math.random() * 100) + 10,
        date: new Date(date)
      });
    }
  }
  
  return workouts;
};

export default function History() {
  const [workouts] = useState<Workout[]>(generateHistoricalWorkouts());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  
  // Get unique exercises
  const exercises = Array.from(new Set(workouts.map(w => w.exercise))).sort();
  
  // Group workouts by date
  const groupedWorkouts = workouts
    .filter(workout => {
      const matchesSearch = workout.exercise.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesExercise = selectedExercise ? workout.exercise === selectedExercise : true;
      return matchesSearch && matchesExercise;
    })
    .reduce((groups, workout) => {
      const dateString = workout.date.toDateString();
      
      if (!groups[dateString]) {
        groups[dateString] = [];
      }
      
      groups[dateString].push(workout);
      return groups;
    }, {} as Record<string, Workout[]>);
  
  // Sort dates in descending order
  const sortedDates = Object.keys(groupedWorkouts).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="container max-w-lg py-8 px-4 md:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Workout History</h1>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search exercises..."
              className="workout-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto py-1 -mx-1 px-1 no-scrollbar">
            <button
              onClick={() => setSelectedExercise(null)}
              className={`subtle-badge whitespace-nowrap ${
                selectedExercise === null ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""
              }`}
            >
              All Exercises
            </button>
            
            {exercises.map(exercise => (
              <button
                key={exercise}
                onClick={() => setSelectedExercise(exercise)}
                className={`subtle-badge whitespace-nowrap ${
                  selectedExercise === exercise ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""
                }`}
              >
                {exercise}
              </button>
            ))}
          </div>
        </div>
      </div>

      {sortedDates.length > 0 ? (
        <AnimatePresence>
          <div className="space-y-8">
            {sortedDates.map((dateString, dateIndex) => (
              <motion.div
                key={dateString}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: dateIndex * 0.1 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-base font-medium">
                    {new Date(dateString).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {groupedWorkouts[dateString].map((workout, index) => (
                    <WorkoutCard
                      key={workout.id}
                      exercise={workout.exercise}
                      sets={workout.sets}
                      reps={workout.reps}
                      weight={workout.weight}
                      animate={false}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 rounded-xl border border-dashed text-center p-8">
          <Filter className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No matching workouts</h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            Try adjusting your search or filters to find your workout history.
          </p>
        </div>
      )}
      
      {sortedDates.length > 0 && (
        <div className="mt-8 flex justify-center">
          <button className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted">
            <Download className="h-4 w-4" />
            Export History
          </button>
        </div>
      )}
    </div>
  );
}
