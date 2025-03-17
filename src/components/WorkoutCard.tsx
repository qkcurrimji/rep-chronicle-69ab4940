
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronRight, Dumbbell, BarChart3 } from "lucide-react";

interface WorkoutCardProps {
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  date?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  animate?: boolean;
  className?: string;
}

export default function WorkoutCard({
  exercise,
  sets,
  reps,
  weight,
  date,
  onEdit,
  onDelete,
  animate = true,
  className,
}: WorkoutCardProps) {
  const cardVariants = {
    initial: animate ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
    hover: { y: -4, transition: { type: "spring", stiffness: 400, damping: 10 } }
  };

  return (
    <motion.div
      className={cn(
        "workout-card group cursor-default",
        className
      )}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Dumbbell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-medium text-foreground line-clamp-1">{exercise}</h3>
            {date && <p className="text-xs text-muted-foreground">{date}</p>}
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Edit workout"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 rounded-full hover:bg-red-50 transition-colors"
              aria-label="Delete workout"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                <path d="M18 6L6 18"></path>
                <path d="M6 6l12 12"></path>
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-workout-light px-3 py-2">
          <p className="text-xs text-muted-foreground mb-1">Sets</p>
          <p className="text-base font-medium">{sets}</p>
        </div>
        <div className="rounded-lg bg-workout-light px-3 py-2">
          <p className="text-xs text-muted-foreground mb-1">Reps</p>
          <p className="text-base font-medium">{reps}</p>
        </div>
        <div className="rounded-lg bg-workout-light px-3 py-2">
          <p className="text-xs text-muted-foreground mb-1">Weight</p>
          <p className="text-base font-medium">{weight} kg</p>
        </div>
      </div>
    </motion.div>
  );
}
