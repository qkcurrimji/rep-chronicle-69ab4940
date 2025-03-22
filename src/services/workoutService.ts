
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { subDays } from 'date-fns';

export interface Workout {
  id: string;
  workout_date: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
}

export interface ExerciseData {
  name: string;
}

// Load workout data with optional filtering for recent data only
export async function loadWorkouts(last45DaysOnly = false): Promise<Workout[]> {
  try {
    let query = supabase
      .from('workouts')
      .select('*')
      .order('workout_date', { ascending: false });
    
    if (last45DaysOnly) {
      const lastDate = subDays(new Date(), 45).toISOString().split('T')[0];
      query = query.gte('workout_date', lastDate);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error loading workouts:', error);
      toast.error('Failed to load workouts');
      return [];
    }
    
    return data as Workout[];
  } catch (error) {
    console.error('Error loading workouts:', error);
    toast.error('Failed to load workouts');
    return [];
  }
}

// Save a new workout
export async function saveWorkout(
  date: Date, 
  exercise: string, 
  sets: number, 
  reps: number, 
  weight: number
): Promise<boolean> {
  try {
    // Format date as YYYY-MM-DD
    const formattedDate = date.toISOString().split('T')[0];
    
    // Save workout
    const { error: workoutError } = await supabase
      .from('workouts')
      .insert({
        workout_date: formattedDate,
        exercise,
        sets,
        reps,
        weight
      });
    
    if (workoutError) {
      console.error('Error saving workout:', workoutError);
      toast.error('Failed to save workout');
      return false;
    }
    
    // Check if exercise exists, if not add it
    const exercises = await getExerciseList();
    if (!exercises.includes(exercise)) {
      const { error: exerciseError } = await supabase
        .from('exercises')
        .insert({ name: exercise });
      
      if (exerciseError) {
        console.error('Error saving exercise:', exerciseError);
        // We don't fail the whole operation if just the exercise entry fails
      }
    }
    
    toast.success(`Saved: ${exercise}`);
    return true;
  } catch (error) {
    console.error('Error saving workout:', error);
    toast.error('Failed to save workout');
    return false;
  }
}

// Delete a workout by ID
export async function deleteWorkout(workoutId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', workoutId);
    
    if (error) {
      console.error('Error deleting workout:', error);
      toast.error('Failed to delete workout');
      return false;
    }
    
    toast.success('Workout deleted');
    return true;
  } catch (error) {
    console.error('Error deleting workout:', error);
    toast.error('Failed to delete workout');
    return false;
  }
}

// Get list of all exercises
export async function getExerciseList(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('name');
    
    if (error) {
      console.error('Error loading exercises:', error);
      toast.error('Failed to load exercises');
      return [];
    }
    
    return data.map(item => item.name).sort();
  } catch (error) {
    console.error('Error loading exercises:', error);
    toast.error('Failed to load exercises');
    return [];
  }
}

// Replicate all workouts from a specific day to today
export async function replicateDayWorkouts(sourceDate: Date): Promise<boolean> {
  try {
    // Format the source date
    const formattedSourceDate = sourceDate.toISOString().split('T')[0];
    
    // Get workouts for the source date
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('workout_date', formattedSourceDate);
    
    if (error) {
      console.error('Error loading workouts to replicate:', error);
      toast.error('Failed to load workouts to replicate');
      return false;
    }
    
    if (!data || data.length === 0) {
      toast.error('No workouts found for the selected date');
      return false;
    }
    
    // Today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Prepare the replicated workouts
    const workoutsToInsert = data.map((workout: Workout) => ({
      workout_date: today,
      exercise: workout.exercise,
      sets: workout.sets,
      reps: workout.reps,
      weight: workout.weight
    }));
    
    // Insert the replicated workouts
    const { error: insertError } = await supabase
      .from('workouts')
      .insert(workoutsToInsert);
    
    if (insertError) {
      console.error('Error replicating workouts:', insertError);
      toast.error('Failed to replicate workouts');
      return false;
    }
    
    toast.success(`Successfully replicated ${workoutsToInsert.length} workouts`);
    return true;
  } catch (error) {
    console.error('Error replicating workouts:', error);
    toast.error('Failed to replicate workouts');
    return false;
  }
}

// Filter workouts by exercise and date range
export function filterWorkouts(
  workouts: Workout[],
  exerciseFilter: string,
  startDate: Date | null,
  endDate: Date | null
): Workout[] {
  return workouts.filter(workout => {
    // Filter by exercise if not "All"
    if (exerciseFilter !== "All" && workout.exercise !== exerciseFilter) {
      return false;
    }
    
    // Filter by date range if provided
    if (startDate && endDate) {
      const workoutDate = new Date(workout.workout_date);
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      if (workoutDate < start || workoutDate > end) {
        return false;
      }
    }
    
    return true;
  });
}
