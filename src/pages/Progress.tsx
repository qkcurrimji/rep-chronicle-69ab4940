
import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Calendar, Dumbbell, ChevronDown } from "lucide-react";
import StatsCard from "@/components/StatsCard";

interface ProgressData {
  exercise: string;
  data: {
    date: string;
    weight: number;
  }[];
  stats: {
    current: number;
    max: number;
    average: number;
    progress: number;
    progressPercent: number;
  };
}

// Create mock data for the progress chart
const generateProgressData = (): Record<string, ProgressData> => {
  const exercises = ["Bench Press", "Squat", "Deadlift", "Shoulder Press"];
  const result: Record<string, ProgressData> = {};
  
  exercises.forEach(exercise => {
    const data = [];
    let prevWeight = 20 + Math.floor(Math.random() * 30);
    
    // Generate data points for the last 30 days
    for (let i = 30; i >= 0; i -= 2) {
      // Skip some days
      if (Math.random() > 0.7) continue;
      
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Random small changes in weight with an upward trend
      const change = (Math.random() * 5) - 1.5;
      prevWeight = Math.max(prevWeight + change, prevWeight);
      
      data.push({
        date: date.toISOString().split('T')[0],
        weight: Math.round(prevWeight * 10) / 10
      });
    }
    
    // Calculate stats
    const weights = data.map(d => d.weight);
    const current = weights[weights.length - 1] || 0;
    const max = Math.max(...weights);
    const average = Math.round((weights.reduce((a, b) => a + b, 0) / weights.length) * 10) / 10;
    const first = weights[0] || 0;
    const progress = Math.round((current - first) * 10) / 10;
    const progressPercent = first > 0 ? Math.round((progress / first) * 100) : 0;
    
    result[exercise] = {
      exercise,
      data,
      stats: {
        current,
        max,
        average,
        progress,
        progressPercent
      }
    };
  });
  
  return result;
};

export default function Progress() {
  const [selectedExercise, setSelectedExercise] = useState("Bench Press");
  const progressData = generateProgressData();
  const exercises = Object.keys(progressData);
  
  const currentExerciseData = progressData[selectedExercise];
  
  // Create data for chart
  const chartData = currentExerciseData.data;
  const stats = currentExerciseData.stats;
  
  // Function to get style for chart bars
  const getBarHeight = (weight: number) => {
    const minWeight = Math.min(...chartData.map(d => d.weight));
    const maxWeight = Math.max(...chartData.map(d => d.weight));
    const range = maxWeight - minWeight;
    const normalizedHeight = ((weight - minWeight) / (range || 1)) * 80 + 20;
    
    return `${normalizedHeight}%`;
  };

  return (
    <div className="container max-w-lg py-8 px-4 md:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Progress Tracking</h1>
        <p className="text-muted-foreground">
          Track your weightlifting progress over time
        </p>
      </div>
      
      <div className="mb-6">
        <label htmlFor="exercise-select" className="block text-sm font-medium text-muted-foreground mb-1.5">
          Select Exercise
        </label>
        <div className="relative">
          <select
            id="exercise-select"
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="workout-input pr-10 appearance-none"
          >
            {exercises.map(exercise => (
              <option key={exercise} value={exercise}>
                {exercise}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>
      
      <motion.div
        className="grid grid-cols-2 gap-4 mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <StatsCard 
          title="Current Weight" 
          value={`${stats.current} kg`}
          icon={<Dumbbell className="h-5 w-5 text-primary" />}
        />
        <StatsCard 
          title="Max Weight" 
          value={`${stats.max} kg`}
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
        />
        <StatsCard 
          title="Average Weight" 
          value={`${stats.average} kg`}
        />
        <StatsCard 
          title="Progress" 
          value={`${stats.progress > 0 ? "+" : ""}${stats.progress} kg`}
          change={`${stats.progressPercent}%`}
          positive={stats.progress >= 0}
        />
      </motion.div>
      
      {chartData.length > 0 ? (
        <motion.div
          className="rounded-xl border p-4 bg-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-medium">{selectedExercise} Progress</h3>
            <div className="bg-primary/10 text-primary text-xs font-medium rounded-full px-2 py-1">
              Last {chartData.length} Sessions
            </div>
          </div>
          
          <div className="relative h-64">
            <div className="absolute inset-0 flex items-end justify-between px-2">
              {chartData.map((item, index) => (
                <div
                  key={index}
                  className="relative group flex flex-col items-center"
                  style={{ width: `${100 / Math.min(chartData.length, 15)}%` }}
                >
                  <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-xs rounded py-1 px-2 whitespace-nowrap">
                    {item.weight} kg on {new Date(item.date).toLocaleDateString()}
                  </div>
                  <motion.div
                    className="w-full max-w-[18px] rounded-t bg-primary hover:bg-primary/90 cursor-pointer"
                    style={{ height: getBarHeight(item.weight) }}
                    initial={{ height: 0 }}
                    animate={{ height: getBarHeight(item.weight) }}
                    transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                  ></motion.div>
                </div>
              ))}
            </div>
            
            {/* Chart horizontal lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3, 4].map((_, i) => (
                <div key={i} className="border-t border-border/50 w-full h-0"></div>
              ))}
            </div>
          </div>
          
          <div className="mt-2 flex justify-center">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                {new Date(chartData[0]?.date).toLocaleDateString()} - {new Date(chartData[chartData.length - 1]?.date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 rounded-xl border border-dashed text-center p-8">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No data available</h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            Start logging your workouts to track your progress over time.
          </p>
        </div>
      )}
    </div>
  );
}
