
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Filter, Search, Download, ChevronDown, RotateCw } from "lucide-react";
import WorkoutCard from "@/components/WorkoutCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  loadWorkouts, 
  getExerciseList, 
  filterWorkouts, 
  replicateDayWorkouts,
  Workout
} from "@/services/workoutService";
import { format } from 'date-fns';

export default function History() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [showAllData, setShowAllData] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  
  // Queries
  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises'],
    queryFn: getExerciseList
  });

  const { data: workouts = [], isLoading } = useQuery({
    queryKey: ['workouts', showAllData],
    queryFn: () => loadWorkouts(!showAllData)
  });

  // Mutations
  const replicateWorkoutsMutation = useMutation({
    mutationFn: replicateDayWorkouts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    }
  });

  // Filter workouts based on searchTerm, selectedExercise, and dateRange
  let filteredWorkouts = workouts;
  
  // Apply exercise filter
  if (selectedExercise) {
    filteredWorkouts = filteredWorkouts.filter(w => w.exercise === selectedExercise);
  }
  
  // Apply search filter
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    filteredWorkouts = filteredWorkouts.filter(w => 
      w.exercise.toLowerCase().includes(searchLower)
    );
  }
  
  // Apply date filter
  if (dateRange[0] && dateRange[1]) {
    filteredWorkouts = filterWorkouts(
      filteredWorkouts,
      "All",
      dateRange[0],
      dateRange[1]
    );
  }

  // Group workouts by date
  const groupedWorkouts: Record<string, Workout[]> = {};
  filteredWorkouts.forEach(workout => {
    const dateString = workout.workout_date.split('T')[0]; // YYYY-MM-DD
    if (!groupedWorkouts[dateString]) {
      groupedWorkouts[dateString] = [];
    }
    groupedWorkouts[dateString].push(workout);
  });
  
  // Sort dates in descending order
  const sortedDates = Object.keys(groupedWorkouts).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  // Handle replicating workouts from a specific day
  const handleReplicateWorkouts = (sourceDate: string) => {
    replicateWorkoutsMutation.mutate(new Date(sourceDate));
  };

  // Download workouts as CSV
  const downloadWorkoutsCSV = () => {
    if (filteredWorkouts.length === 0) return;
    
    // Format workouts for CSV
    const headers = ['Date', 'Exercise', 'Sets', 'Reps', 'Weight (kg)'];
    const csvRows = [headers.join(',')];
    
    filteredWorkouts.forEach(w => {
      const row = [
        w.workout_date,
        `"${w.exercise}"`, // Quotes to handle commas in exercise names
        w.sets,
        w.reps,
        w.weight
      ];
      csvRows.push(row.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'workout_history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={showAllData} 
                onChange={() => setShowAllData(!showAllData)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              Show all history
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Exercise</label>
              <div className="relative">
                <select
                  className="workout-input pr-8 w-full"
                  value={selectedExercise || ""}
                  onChange={(e) => setSelectedExercise(e.target.value || null)}
                >
                  <option value="">All Exercises</option>
                  {exercises.map(exercise => (
                    <option key={exercise} value={exercise}>{exercise}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Date Range</label>
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  className="workout-input flex-1"
                  value={dateRange[0] ? format(dateRange[0], 'yyyy-MM-dd') : ''}
                  onChange={(e) => setDateRange([e.target.value ? new Date(e.target.value) : null, dateRange[1]])}
                />
                <span>to</span>
                <input
                  type="date"
                  className="workout-input flex-1"
                  value={dateRange[1] ? format(dateRange[1], 'yyyy-MM-dd') : ''}
                  onChange={(e) => setDateRange([dateRange[0], e.target.value ? new Date(e.target.value) : null])}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : sortedDates.length > 0 ? (
        <AnimatePresence>
          <div className="space-y-8">
            {sortedDates.map((dateString, dateIndex) => (
              <motion.div
                key={dateString}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: dateIndex * 0.1 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
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
                  
                  <button 
                    onClick={() => handleReplicateWorkouts(dateString)}
                    disabled={replicateWorkoutsMutation.isPending}
                    className="flex items-center gap-1 text-xs rounded-full bg-primary/10 text-primary px-2 py-1 hover:bg-primary/20 transition-colors"
                  >
                    <RotateCw className="h-3 w-3" />
                    <span>Replicate</span>
                  </button>
                </div>
                
                <div className="rounded-lg border bg-card overflow-hidden">
                  {groupedWorkouts[dateString].map((workout, index) => (
                    <div key={workout.id} className={index > 0 ? "border-t" : ""}>
                      <WorkoutCard
                        exercise={workout.exercise}
                        sets={workout.sets}
                        reps={workout.reps}
                        weight={workout.weight}
                        animate={false}
                      />
                    </div>
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
          <button 
            onClick={downloadWorkoutsCSV}
            className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            <Download className="h-4 w-4" />
            Export History
          </button>
        </div>
      )}
    </div>
  );
}
