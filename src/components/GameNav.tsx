import { useLocation, useNavigate } from "react-router";
import { Home, FileText, Search, BookOpen, Trophy, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-white/80 backdrop-blur-xl safe-area-pb">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
