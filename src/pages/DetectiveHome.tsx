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
import { ArrowRight, ChevronRight, LogOut, Shield } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
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
    <main className="min-h-screen bg-[#f8f7f4] pb-24">
      {/* Header */}
      <header className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Detective Agency
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              Welcome{user?.name ? `, ${user.name}` : ""}
            </h1>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="space-y-5 px-5">
        {/* Rank Card */}
        <motion.div {...fadeUp}>
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
                {rank.icon}
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Current Rank
                </p>
                <p className="mt-0.5 text-lg font-bold text-foreground">
                  {rank.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{state.score}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Case */}
        <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
                  Active Case
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-3xl">{state.currentCase.icon}</span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-foreground leading-tight">
                    {state.currentCase.title}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {state.currentCase.subtitle}
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>Scene {state.currentSceneIndex + 1} of {state.totalScenes}</span>
                  <span>{state.progress}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${state.progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Clues found */}
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                <span>{state.cluesFound.length} of {state.currentCase.totalClues} clues discovered</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Continue Investigation */}
        <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
          <Button
            onClick={() => navigate("/reading")}
            size="lg"
            className="w-full h-14 rounded-2xl text-base font-semibold bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
          >
            Continue Investigation
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>

        {/* Quick Links */}
        <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
          <div className="space-y-2">
            {[
              {
                label: "View Clue Board",
                desc: `${state.cluesFound.length} clues collected`,
                path: "/clues",
                emoji: "🔍",
              },
              {
                label: "Vocabulary Notes",
                desc: "Words you've discovered",
                path: "/vocabulary",
                emoji: "📖",
              },
              {
                label: "Case Progress",
                desc: `${state.currentCase.suspectCount} suspects to investigate`,
                path: "/progress",
                emoji: "📊",
              },
            ].map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-white px-4 py-3 text-left transition-all duration-200 hover:shadow-sm"
              >
                <span className="text-xl">{link.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{link.label}</p>
                  <p className="text-xs text-muted-foreground">{link.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
