import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useGame } from "@/lib/gameContext";
import { getRank, RANKS } from "@/lib/gameData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
};

export default function Progress() {
  const navigate = useNavigate();
  const { state } = useGame();
  const rank = getRank(state.score);

  const nextRank = RANKS.find((r) => r.minScore > state.score);
  const progressToNext = nextRank
    ? Math.round(
        ((state.score -
          (RANKS[RANKS.indexOf(nextRank) - 1]?.minScore ?? 0)) /
          (nextRank.minScore -
            (RANKS[RANKS.indexOf(nextRank) - 1]?.minScore ?? 0))) *
          100,
      )
    : 100;

  return (
    <main className="min-h-screen bg-background pb-28">
      <header className="px-5 pt-8 pb-5 sm:px-8 sm:pt-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
          Your Progress
        </p>
        <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Detective Profile
        </h1>
      </header>

      <div className="space-y-5 px-5 sm:px-8">
        {/* Rank Hero */}
        <motion.div {...fadeUp}>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-foreground via-foreground/95 to-foreground/80 p-6 sm:p-8 text-primary-foreground shadow-elevated">
            <div className="absolute inset-0 opacity-[0.03]">
              <div
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
                className="absolute inset-0"
              />
            </div>
            <div className="absolute right-4 top-4 text-7xl opacity-10">
              {rank.icon}
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/15 text-4xl">
                  {rank.icon}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                    Current Rank
                  </p>
                  <p className="text-2xl font-extrabold tracking-tight">{rank.name}</p>
                </div>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold">{state.score}</span>
                <span className="text-sm text-white/50 font-medium">points</span>
              </div>

              {nextRank && (
                <div className="mt-5">
                  <div className="flex items-center justify-between text-[11px] text-white/50 font-medium">
                    <span>{rank.name}</span>
                    <span>{nextRank.name}</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-gold/60"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(progressToNext, 5)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-white/40 font-medium">
                    {nextRank.minScore - state.score} points to next rank
                  </p>
                </div>
              )}

              {!nextRank && (
                <p className="mt-3 text-[11px] text-gold/80 font-semibold">
                  🏆 You've reached the highest rank!
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid — Responsive */}
        <motion.div {...fadeUp} transition={{ delay: 0.08 }}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { value: state.cluesFound.length, label: "Clues Found" },
              {
                value: Object.values(state.answeredQuestions).filter(Boolean).length,
                label: "Correct Answers",
              },
              { value: `${state.currentSceneIndex + 1}/${state.totalScenes}`, label: "Scenes" },
              { value: "1", label: "Cases Active" },
            ].map((stat) => (
              <Card key={stat.label} className="border-0 bg-card shadow-card">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-extrabold text-foreground tracking-tight">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Rank Ladder */}
        <motion.div {...fadeUp} transition={{ delay: 0.12 }}>
          <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Rank Progression
          </h3>
          <Card className="border-0 bg-card shadow-card">
            <CardContent className="p-4 sm:p-5">
              <div className="space-y-3">
                {RANKS.map((r) => {
                  const isActive = rank.name === r.name;
                  const isUnlocked = state.score >= r.minScore;
                  return (
                    <div
                      key={r.name}
                      className={cn(
                        "flex items-center gap-3 rounded-xl p-3.5 transition-all",
                        isActive && "bg-primary/5 ring-1 ring-primary/15",
                        !isUnlocked && "opacity-40",
                      )}
                    >
                      <span className="text-2xl">{r.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-foreground">
                          {r.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-medium">
                          {r.minScore} points required
                        </p>
                      </div>
                      {isUnlocked ? (
                        <CheckCircle2 className="h-5 w-5 text-gold" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground/20" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Case Status */}
        <motion.div {...fadeUp} transition={{ delay: 0.16 }}>
          <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Case Activity
          </h3>
          <Card className="border-0 bg-card shadow-card">
            <CardContent className="flex items-center gap-4 p-4 sm:p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-2xl">
                {state.currentCase.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">
                  {state.currentCase.title}
                </p>
                <p className="text-[11px] text-muted-foreground font-medium">
                  {state.progress}% complete · {state.score} points earned
                </p>
              </div>
              {state.progress === 100 ? (
                <span className="rounded-lg bg-emerald-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Solved
                </span>
              ) : (
                <span className="rounded-lg bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gold">
                  Active
                </span>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
          <Button
            onClick={() => navigate("/reading")}
            size="lg"
            className="w-full h-14 rounded-2xl text-sm font-bold bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-1px]"
          >
            Keep Investigating
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
