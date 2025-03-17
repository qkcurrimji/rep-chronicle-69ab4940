
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  ClipboardList, 
  History, 
  Menu,
  X
} from "lucide-react";

const navItems = [
  { name: "Log Workout", path: "/", icon: <ClipboardList className="h-5 w-5" /> },
  { name: "History", path: "/history", icon: <History className="h-5 w-5" /> },
  { name: "Progress", path: "/progress", icon: <BarChart3 className="h-5 w-5" /> },
];

export default function WorkoutNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-semibold text-xl tracking-tight">
              Workout Logger
            </span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground
                  ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                {item.name}
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* Mobile Menu Button */}
        <button
          className="inline-flex md:hidden items-center justify-center rounded-md text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="sr-only">Toggle menu</span>
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {isOpen && (
        <motion.div
          className="md:hidden fixed inset-0 z-50 w-full h-full bg-background"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="container px-4 py-6">
            <nav className="flex flex-col space-y-4 mt-8">
              {navItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 rounded-lg px-3 py-4 text-base
                        ${isActive 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </div>
        </motion.div>
      )}
    </header>
  );
}
