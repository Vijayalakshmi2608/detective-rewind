import { useLocation, useNavigate } from "react-router";
import { Home, FileText, Search, BookOpen, Trophy, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { path: "/home", label: "Home", icon: Home },
  { path: "/case", label: "Case", icon: FileText },
  { path: "/reading", label: "Read", icon: BookOpen },
  { path: "/clues", label: "Clues", icon: Search },
  { path: "/progress", label: "Rank", icon: Trophy },
  { path: "/tutor", label: "Tutor", icon: Brain },
];

export function GameNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-white/90 backdrop-blur-xl safe-area-pb">
      <div className="mx-auto flex max-w-lg items-center justify-around px-1 py-1 sm:px-4">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-medium transition-all duration-200 min-w-[48px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground/70",
              )}
            >
              <div className="relative">
                <Icon
                  className="h-[18px] w-[18px] transition-all duration-200"
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1.5 left-1/2 h-[3px] w-3 -translate-x-1/2 rounded-full bg-gold"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
              </div>
              <span
                className={cn(
                  "transition-all duration-200",
                  isActive ? "font-semibold" : "font-medium",
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
