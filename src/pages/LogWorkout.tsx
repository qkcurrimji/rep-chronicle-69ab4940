
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Dumbbell, ChevronDown, X } from "lucide-react";
import WorkoutCard from "@/components/WorkoutCard";

interface Workout {
  id: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  date: Date;
}

// Simulated data - in a real app this would come from an API or database
const mockExercises = [
  "Bench Press",
  "Squat",
  "Deadlift",
  "Pull Up",
  "Push Up",
  "Shoulder Press",
  "Bicep Curl",
  "Tricep Extension",
  "Lat Pulldown",
  "Leg Press"
];

// Generate some mock workouts
const generateMockWorkouts = () => {
  const today = new Date();
  return Array(3).fill(null).map((_, i) => ({
    id: `workout-${i}`,
    exercise: mockExercises[Math.floor(Math.random() * mockExercises.length)],
    sets: Math.floor(Math.random() * 5) + 1,
    reps: Math.floor(Math.random() * 12) + 5,
    weight: Math.floor(Math.random() * 100) + 10,
    date: today
  }));
};

export default function LogWorkout() {
  const { toast } = useToast();
  const [workouts, setWorkouts] = useState<Workout[]>(generateMockWorkouts());
  const [isLoggingWorkout, setIsLoggingWorkout] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    exercise: "",
    sets: 1,
    reps: 10,
    weight: 20
  });
  const [editWorkoutId, setEditWorkoutId] = useState<string | null>(null);

  const handleLogWorkout = () => {
    if (!newWorkout.exercise) {
      toast({
        title: "Exercise name is required",
        description: "Please enter an exercise name",
        variant: "destructive"
      });
      return;
    }

    if (editWorkoutId) {
      setWorkouts(workouts.map(workout => 
        workout.id === editWorkoutId 
          ? { 
              ...workout, 
              exercise: newWorkout.exercise,
              sets: newWorkout.sets,
              reps: newWorkout.reps,
              weight: newWorkout.weight
            } 
          : workout
      ));
      
      toast({
        title: "Workout updated",
        description: `${newWorkout.exercise} has been updated`
      });
      
      setEditWorkoutId(null);
    } else {
      const newWorkoutItem = {
        id: `workout-${Date.now()}`,
        exercise: newWorkout.exercise,
        sets: newWorkout.sets,
        reps: newWorkout.reps,
        weight: newWorkout.weight,
        date: new Date()
      };
      
      setWorkouts([newWorkoutItem, ...workouts]);
      
      toast({
        title: "Workout logged",
        description: `${newWorkout.exercise} has been added to your log`
      });
    }
    
    setNewWorkout({
      exercise: "",
      sets: 1,
      reps: 10,
      weight: 20
    });
    
    setIsLoggingWorkout(false);
  };

  const handleEditWorkout = (workout: Workout) => {
    setNewWorkout({
      exercise: workout.exercise,
      sets: workout.sets,
      reps: workout.reps,
      weight: workout.weight
    });
    setEditWorkoutId(workout.id);
    setIsLoggingWorkout(true);
  };

  const handleDeleteWorkout = (id: string) => {
    setWorkouts(workouts.filter(workout => workout.id !== id));
    
    toast({
      title: "Workout deleted",
      description: "The workout has been removed from your log"
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <div className="container max-w-lg py-8 px-4 md:px-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Today's Workout</h1>
        <button
          onClick={() => setIsLoggingWorkout(true)}
          className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Log</span>
        </button>
      </div>

      <div className="mb-8">
        <p className="text-muted-foreground">
          {formatDate(new Date())}
        </p>
      </div>

      <AnimatePresence>
        {isLoggingWorkout && (
          <motion.div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-full max-w-lg rounded-t-xl sm:rounded-xl bg-card border shadow-lg overflow-hidden"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center justify-between border-b p-4">
                <h3 className="text-lg font-semibold">
                  {editWorkoutId ? "Edit Workout" : "Log Workout"}
                </h3>
                <button
                  onClick={() => {
                    setIsLoggingWorkout(false);
                    setEditWorkoutId(null);
                    setNewWorkout({
                      exercise: "",
                      sets: 1,
                      reps: 10,
                      weight: 20
                    });
                  }}
                  className="rounded-full p-1 hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label htmlFor="exercise" className="block text-sm font-medium text-foreground mb-1.5">
                    Exercise
                  </label>
                  <div className="relative">
                    <input
                      id="exercise"
                      type="text"
                      className="workout-input pr-8"
                      placeholder="e.g. Bench Press"
                      value={newWorkout.exercise}
                      onChange={(e) => setNewWorkout({ ...newWorkout, exercise: e.target.value })}
                      list="exercise-options"
                      autoFocus
                    />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <datalist id="exercise-options">
                      {mockExercises.map((exercise) => (
                        <option key={exercise} value={exercise} />
                      ))}
                    </datalist>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="sets" className="block text-sm font-medium text-foreground mb-1.5">
                      Sets
                    </label>
                    <input
                      id="sets"
                      type="number"
                      min="1"
                      className="workout-input"
                      value={newWorkout.sets}
                      onChange={(e) => setNewWorkout({ ...newWorkout, sets: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div>
                    <label htmlFor="reps" className="block text-sm font-medium text-foreground mb-1.5">
                      Reps
                    </label>
                    <input
                      id="reps"
                      type="number"
                      min="1"
                      className="workout-input"
                      value={newWorkout.reps}
                      onChange={(e) => setNewWorkout({ ...newWorkout, reps: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-foreground mb-1.5">
                      Weight (kg)
                    </label>
                    <input
                      id="weight"
                      type="number"
                      min="0"
                      step="0.5"
                      className="workout-input"
                      value={newWorkout.weight}
                      onChange={(e) => setNewWorkout({ ...newWorkout, weight: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleLogWorkout}
                  className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
                >
                  {editWorkoutId ? "Update Workout" : "Log Workout"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {workouts.length > 0 ? (
          <div className="space-y-4">
            {workouts.map((workout, index) => (
              <WorkoutCard
                key={workout.id}
                exercise={workout.exercise}
                sets={workout.sets}
                reps={workout.reps}
                weight={workout.weight}
                onEdit={() => handleEditWorkout(workout)}
                onDelete={() => handleDeleteWorkout(workout.id)}
                animate
              />
            ))}
          </div>
        ) : (
          <motion.div
            className="flex flex-col items-center justify-center h-64 rounded-xl border border-dashed text-center p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Dumbbell className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">No workouts logged</h3>
            <p className="text-muted-foreground text-sm max-w-xs mb-4">
              Start tracking your progress by logging your first workout.
            </p>
            <button
              onClick={() => setIsLoggingWorkout(true)}
              className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Log Workout</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
