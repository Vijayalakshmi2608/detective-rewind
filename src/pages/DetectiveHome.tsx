import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { useGame } from "@/lib/gameContext";
import { getRank } from "@/lib/gameData";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { ArrowRight, ChevronRight, LogOut, Shield, Zap, Search, BookOpen } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] as const },
};

export default function DetectiveHome() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { state } = useGame();
  const rank = getRank(state.score);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <main className="min-h-screen bg-background pb-28">
      {/* Header */}
      <header className="px-5 pt-8 pb-5 sm:px-8 sm:pt-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
              Detective Agency
            </p>
            <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Welcome{user?.name ? `, ${user.name}` : ""}
            </h1>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-xl p-2.5 text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="space-y-5 px-5 sm:px-8">
        {/* Rank & Score Row */}
        <motion.div {...fadeUp}>
          <Card className="border-0 bg-card shadow-card overflow-hidden">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/8 text-2xl">
                  {rank.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                    Current Rank
                  </p>
                  <p className="mt-0.5 text-lg font-bold text-foreground tracking-tight">
                    {rank.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-primary">{state.score}</p>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Case — Featured Card */}
        <motion.div {...fadeUp} transition={{ delay: 0.08 }}>
          <Card className="border-0 bg-card shadow-card overflow-hidden">
            <CardContent className="p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="relative">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <div className="absolute inset-0 h-2 w-2 rounded-full bg-emerald-500 animate-ping opacity-40" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                  Active Case
                </p>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-4xl">{state.currentCase.icon}</span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-foreground leading-tight tracking-tight">
                    {state.currentCase.title}
                  </h2>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground line-clamp-2">
                    {state.currentCase.subtitle}
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>Scene {state.currentSceneIndex + 1} of {state.totalScenes}</span>
                  <span className="font-bold text-foreground">{state.progress}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80"
                    initial={{ width: 0 }}
                    animate={{ width: `${state.progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Clues found */}
              <div className="mt-3.5 flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5 text-gold" />
                <span className="font-medium">
                  <span className="font-bold text-foreground">{state.cluesFound.length}</span>
                  {" "}of {state.currentCase.totalClues} clues discovered
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Continue Investigation CTA */}
        <motion.div {...fadeUp} transition={{ delay: 0.16 }}>
          <Button
            onClick={() => navigate("/reading")}
            size="lg"
            className="w-full h-14 rounded-2xl text-base font-bold bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-1px]"
          >
            Continue Investigation
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>

        {/* Quick Links */}
        <motion.div {...fadeUp} transition={{ delay: 0.24 }}>
          <div className="space-y-2.5">
            {[
              {
                label: "View Clue Board",
                desc: `${state.cluesFound.length} clues collected`,
                path: "/clues",
                icon: <Search className="h-4 w-4" />,
              },
              {
                label: "Vocabulary Notes",
                desc: "Words you've discovered",
                path: "/vocabulary",
                icon: <BookOpen className="h-4 w-4" />,
              },
              {
                label: "Case Progress",
                desc: `${state.currentCase.suspectCount} suspects to investigate`,
                path: "/progress",
                icon: <Zap className="h-4 w-4" />,
              },
            ].map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="group flex w-full items-center gap-3.5 rounded-2xl border border-border/60 bg-card px-4 py-3.5 text-left transition-all duration-200 hover:shadow-card-hover hover:border-primary/10"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-colors group-hover:bg-primary/8 group-hover:text-primary">
                  {link.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{link.label}</p>
                  <p className="text-xs text-muted-foreground">{link.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground/40" />
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
