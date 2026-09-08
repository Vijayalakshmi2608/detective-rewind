import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { useGame } from "@/lib/gameContext";
import { getRank, RANKS } from "@/lib/gameData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Circle, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45 },
};

export default function Progress() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state } = useGame();
  const rank = getRank(state.score);

  const nextRank = RANKS.find((r) => r.minScore > state.score);
  const progressToNext = nextRank
    ? Math.round(
        ((state.score - (RANKS[RANKS.indexOf(nextRank) - 1]?.minScore ?? 0)) /
          (nextRank.minScore -
            (RANKS[RANKS.indexOf(nextRank) - 1]?.minScore ?? 0))) *
          100,
      )
    : 100;

  return (
    <main className="min-h-screen bg-[#f8f7f4] pb-24">
      <header className="px-5 pt-6 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Your Progress
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
          Detective Profile
        </h1>
      </header>

      <div className="space-y-5 px-5">
        {/* Rank Hero */}
        <motion.div {...fadeUp}>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-lg">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute right-4 top-4 text-8xl">🔍</div>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-4xl">
                  {rank.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                    Current Rank
                  </p>
                  <p className="text-2xl font-bold">{rank.name}</p>
                </div>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{state.score}</span>
                <span className="text-sm text-white/60">points</span>
              </div>

              {nextRank && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>{rank.name}</span>
                    <span>{nextRank.name}</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-white/40"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(progressToNext, 5)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-white/50">
                    {nextRank.minScore - state.score} points to next rank
                  </p>
                </div>
              )}

              {!nextRank && (
                <p className="mt-2 text-xs text-white/60">
                  🏆 You've reached the highest rank!
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-0 bg-white shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {state.cluesFound.length}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Clues Found
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {Object.values(state.answeredQuestions).filter(Boolean).length}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Correct Answers
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {state.currentSceneIndex + 1}/{state.totalScenes}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Scenes Explored
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">1</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Cases Active
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Rank Ladder */}
        <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-foreground">
            Rank Progression
          </h3>
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="space-y-3">
                {RANKS.map((r, i) => {
                  const isActive = rank.name === r.name;
                  const isUnlocked = state.score >= r.minScore;
                  return (
                    <div
                      key={r.name}
                      className={cn(
                        "flex items-center gap-3 rounded-xl p-3 transition-all",
                        isActive && "bg-primary/5 ring-1 ring-primary/20",
                        !isUnlocked && "opacity-40",
                      )}
                    >
                      <span className="text-2xl">{r.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-foreground">
                          {r.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {r.minScore} points required
                        </p>
                      </div>
                      {isUnlocked ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground/30" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Case Status */}
        <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-foreground">
            Case Activity
          </h3>
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                {state.currentCase.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">
                  {state.currentCase.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {state.progress}% complete · {state.score} points earned
                </p>
              </div>
              {state.progress === 100 ? (
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  Solved
                </span>
              ) : (
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  Active
                </span>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div {...fadeUp} transition={{ delay: 0.25 }}>
          <Button
            onClick={() => navigate("/reading")}
            size="lg"
            className="w-full h-13 rounded-2xl text-sm font-semibold"
          >
            Keep Investigating
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
