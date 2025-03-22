
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Dumbbell, ChevronDown, X, Calendar } from "lucide-react";
import WorkoutCard from "@/components/WorkoutCard";
import { 
  loadWorkouts, 
  saveWorkout, 
  deleteWorkout, 
  getExerciseList, 
  Workout
} from "@/services/workoutService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function LogWorkout() {
  // Query client for cache invalidation
  const queryClient = useQueryClient();
  
  // State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoggingWorkout, setIsLoggingWorkout] = useState(false);
  const [workoutInputType, setWorkoutInputType] = useState<"new" | "existing">("existing");
  const [newWorkout, setNewWorkout] = useState({
    exercise: "",
    sets: 1,
    reps: 10,
    weight: 20
  });
  const [editWorkoutId, setEditWorkoutId] = useState<string | null>(null);

  // Queries
  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises'],
    queryFn: getExerciseList
  });

  const { data: allWorkouts = [] } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => loadWorkouts(false)
  });

  // Get today's workouts
  const todaysWorkouts = allWorkouts.filter(workout => {
    const workoutDate = new Date(workout.workout_date);
    const selected = new Date(selectedDate);
    return workoutDate.toDateString() === selected.toDateString();
  });

  // Mutations
  const saveWorkoutMutation = useMutation({
    mutationFn: (workout: { 
      date: Date; 
      exercise: string; 
      sets: number; 
      reps: number; 
      weight: number;
      id?: string;
    }) => {
      // If we have an ID, we're editing - delete the old workout first
      if (workout.id) {
        return deleteWorkout(workout.id).then(() => {
          return saveWorkout(
            workout.date, 
            workout.exercise, 
            workout.sets, 
            workout.reps, 
            workout.weight
          );
        });
      }
      return saveWorkout(
        workout.date, 
        workout.exercise, 
        workout.sets, 
        workout.reps, 
        workout.weight
      );
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      
      // Reset form
      setNewWorkout({
        exercise: "",
        sets: 1,
        reps: 10,
        weight: 20
      });
      setIsLoggingWorkout(false);
      setEditWorkoutId(null);
    }
  });

  const deleteWorkoutMutation = useMutation({
    mutationFn: deleteWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    }
  });

  const handleLogWorkout = () => {
    const exerciseName = newWorkout.exercise.trim();
    
    if (!exerciseName) {
      toast.error("Please enter an exercise name");
      return;
    }

    // Title case the exercise name
    const formattedExercise = exerciseName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    saveWorkoutMutation.mutate({
      date: selectedDate,
      exercise: formattedExercise,
      sets: newWorkout.sets,
      reps: newWorkout.reps,
      weight: newWorkout.weight,
      id: editWorkoutId || undefined
    });
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
    setWorkoutInputType("existing");
  };

  const handleDeleteWorkout = (id: string) => {
    deleteWorkoutMutation.mutate(id);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short', 
      day: 'numeric'
    });
  };

  // Group workouts by exercise
  const groupedWorkouts: Record<string, Workout[]> = {};
  todaysWorkouts.forEach(workout => {
    if (!groupedWorkouts[workout.exercise]) {
      groupedWorkouts[workout.exercise] = [];
    }
    groupedWorkouts[workout.exercise].push(workout);
  });

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

      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
          />
        </div>
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
                  <label htmlFor="input-type" className="block text-sm font-medium text-foreground mb-1.5">
                    Exercise Input Type
                  </label>
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setWorkoutInputType("existing")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        workoutInputType === "existing" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      Select Existing
                    </button>
                    <button
                      onClick={() => setWorkoutInputType("new")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        workoutInputType === "new" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      New Exercise
                    </button>
                  </div>
                  
                  <label htmlFor="exercise" className="block text-sm font-medium text-foreground mb-1.5">
                    Exercise
                  </label>
                  {workoutInputType === "existing" ? (
                    <div className="relative">
                      <select
                        id="exercise"
                        className="workout-input pr-8 w-full"
                        value={newWorkout.exercise}
                        onChange={(e) => setNewWorkout({ ...newWorkout, exercise: e.target.value })}
                      >
                        <option value="">Select an exercise</option>
                        {exercises.map((exercise) => (
                          <option key={exercise} value={exercise}>
                            {exercise}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        id="exercise"
                        type="text"
                        className="workout-input w-full"
                        placeholder="e.g. Bench Press"
                        value={newWorkout.exercise}
                        onChange={(e) => setNewWorkout({ ...newWorkout, exercise: e.target.value })}
                        autoFocus
                      />
                    </div>
                  )}
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
                  disabled={saveWorkoutMutation.isPending}
                  className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-70"
                >
                  {saveWorkoutMutation.isPending ? 'Saving...' : (editWorkoutId ? "Update Workout" : "Log Workout")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {Object.keys(groupedWorkouts).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(groupedWorkouts).map(([exercise, workouts]) => (
              <div key={exercise} className="rounded-lg border bg-card overflow-hidden">
                <div className="bg-muted/40 px-4 py-3 font-medium">
                  {exercise}
                </div>
                <div className="divide-y">
                  {workouts.map((workout) => (
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
              </div>
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
