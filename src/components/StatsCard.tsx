
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string | number;
  icon?: React.ReactNode;
  positive?: boolean;
  className?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  icon, 
  positive = true,
  className 
}: StatsCardProps) {
  return (
    <motion.div
      className={cn(
        "rounded-xl border bg-card p-4 shadow-sm", 
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-semibold mt-1">{value}</h3>
          
          {change !== undefined && (
            <p className={`text-xs font-medium mt-1 flex items-center ${positive ? 'text-green-500' : 'text-red-500'}`}>
              <span className="inline-block mr-1">
                {positive ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 15l-6-6-6 6"/>
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                )}
              </span>
              {change}
            </p>
          )}
        </div>
        
        {icon && (
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}
