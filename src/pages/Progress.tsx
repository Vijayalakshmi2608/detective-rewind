import { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useGame } from "@/lib/gameContext";
import { CASE_LEVELS } from "@/lib/cases";
import {
  type SkillDimension,
  SKILL_LABELS,
} from "@/lib/adaptiveModel";
import {
  ArrowRight,
  Award,
  BookOpenCheck,
  Brain,
  CheckCircle2,
  Eye,
  Lock,
  Mic,
  RotateCcw,
  Search,
  Sparkles,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
};

type Achievement = {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
};

export default function Progress() {
  const navigate = useNavigate();
  const { state, caseProgress, isLevelUnlocked } = useGame();
  const { progression, learnerModel } = state;

  // ─── Real journey stats ───
  const journey = useMemo(() => {
    let clues = 0;
    let solved = 0;
    let attempts = 0;
    let correctFirstTry = 0;
    let rewinds = 0;
    let rewindImprovements = 0;
    let readAloud = 0;
    for (const lvl of CASE_LEVELS) {
      const p = progression.cases[lvl.caseData.id];
      if (!p) continue;
      clues += p.cluesFound.length;
      attempts += p.attempts;
      correctFirstTry += p.correctFirstTry;
      rewinds += p.rewindsUsed;
      rewindImprovements += p.rewindImprovements;
      readAloud += p.readAloudSessions;
      if (p.completed) solved++;
    }
    const accuracy =
      attempts > 0 ? Math.round((correctFirstTry / attempts) * 100) : 0;
    const totalClues = CASE_LEVELS.reduce(
      (sum, l) => sum + l.caseData.totalClues,
      0,
    );
    return {
      clues,
      totalClues,
      solved,
      attempts,
      accuracy,
      rewinds,
      rewindImprovements,
      readAloud,
    };
  }, [progression]);

  // ─── Achievements — earned from real behaviors, never speed ───
  const achievements = useMemo<Achievement[]>(() => {
    const A: Achievement[] = [
      {
        id: "first-read",
        label: "Careful Reader",
        description: "Completed a read-aloud session",
        icon: <Mic className="h-4 w-4" />,
        earned: journey.readAloud >= 1,
      },
      {
        id: "fluent-five",
        label: "Fluent Investigator",
        description: "Completed 5 read-aloud sessions",
        icon: <BookOpenCheck className="h-4 w-4" />,
        earned: journey.readAloud >= 5,
      },
      {
        id: "first-clue",
        label: "Evidence Finder",
        description: "Discovered your first clue",
        icon: <Search className="h-4 w-4" />,
        earned: journey.clues >= 1,
      },
      {
        id: "clue-collector",
        label: "Clue Collector",
        description: "Discovered 10 clues",
        icon: <Sparkles className="h-4 w-4" />,
        earned: journey.clues >= 10,
      },
      {
        id: "rewind-brave",
        label: "Rewind Detective",
        description: "Used Rewind to re-read and try again",
        icon: <RotateCcw className="h-4 w-4" />,
        earned: journey.rewinds >= 1,
      },
      {
        id: "rewind-growth",
        label: "Growth Mindset",
        description: "Improved after a Rewind intervention",
        icon: <Brain className="h-4 w-4" />,
        earned: journey.rewindImprovements >= 1,
      },
      {
        id: "first-case",
        label: "Case Cracker",
        description: "Solved your first case",
        icon: <Trophy className="h-4 w-4" />,
        earned: journey.solved >= 1,
      },
      {
        id: "sharp-eye",
        label: "Sharp Eye",
        description: "70%+ first-try accuracy (5+ attempts)",
        icon: <Eye className="h-4 w-4" />,
        earned: journey.attempts >= 5 && journey.accuracy >= 70,
      },
    ];
    return A;
  }, [journey]);

  const earnedCount = achievements.filter((a) => a.earned).length;

  // ─── Skills practiced (from learner model — real attempts) ───
  const skillRows = useMemo(() => {
    const dims: SkillDimension[] = [
      "comprehension",
      "inference",
      "vocabulary",
      "evidenceAnalysis",
      "deduction",
    ];
    return dims.map((d) => ({
      dim: d,
      label: SKILL_LABELS[d],
      attempts: learnerModel.profile[d].attempts,
      score: learnerModel.profile[d].score,
    }));
  }, [learnerModel]);

  return (
    <main className="min-h-screen bg-background pb-28">
      <header className="px-5 pb-5 pt-8 sm:px-8 sm:pt-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
          Your Progress
        </p>
        <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Detective Profile
        </h1>
      </header>

      <div className="space-y-5 px-5 sm:px-8">
        {/* Journey Hero */}
        <motion.div {...fadeUp}>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-foreground via-foreground/95 to-foreground/80 p-6 text-primary-foreground shadow-elevated sm:p-8">
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
            <div className="relative z-10">
              <div className="mb-5 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/15">
                  <Trophy className="h-8 w-8 text-gold" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                    Learning Journey
                  </p>
                  <p className="text-2xl font-extrabold tracking-tight">
                    {journey.solved} of {CASE_LEVELS.length} cases solved
                  </p>
                  <p className="mt-0.5 text-xs text-white/50">
                    Case{" "}
                    {
                      CASE_LEVELS[
                        Math.min(journey.solved, CASE_LEVELS.length - 1)
                      ].level
                    }{" "}
                    ·{" "}
                    {
                      CASE_LEVELS[
                        Math.min(journey.solved, CASE_LEVELS.length - 1)
                      ].focusLabel
                    }
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-[11px] font-medium text-white/50">
                  <span>Progress toward next case</span>
                  <span>
                    {journey.clues}/{journey.totalClues} clues collected
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gold/60"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.max((journey.clues / journey.totalClues) * 100, 4)}%`,
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div {...fadeUp} transition={{ delay: 0.08 }}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { value: `${journey.clues}/${journey.totalClues}`, label: "Clues Found" },
              { value: String(journey.solved), label: "Cases Solved" },
              {
                value: journey.attempts > 0 ? `${journey.accuracy}%` : "—",
                label: "First-try Accuracy",
              },
              { value: String(journey.readAloud), label: "Read-aloud Sessions" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border/40 bg-card p-4 text-center shadow-card"
              >
                <p className="text-2xl font-extrabold tracking-tight text-foreground">
                  {stat.value}
                </p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Case Journey */}
        <motion.div {...fadeUp} transition={{ delay: 0.12 }}>
          <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Case Levels
          </h3>
          <div className="space-y-2">
            {CASE_LEVELS.map((lvl) => {
              const p = caseProgress(lvl.caseData.id);
              const unlocked = isLevelUnlocked(lvl.level);
              const completed = p.completed;
              return (
                <div
                  key={lvl.caseData.id}
                  className={cn(
                    "flex items-center gap-3.5 rounded-2xl border p-4",
                    completed
                      ? "border-emerald-200/50 bg-emerald-50/40"
                      : unlocked
                        ? "border-border/60 bg-card shadow-card"
                        : "border-border/30 bg-secondary/30",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl",
                      !unlocked
                        ? "bg-secondary/60 opacity-60 grayscale"
                        : completed
                          ? "bg-emerald-100/70"
                          : "bg-secondary",
                    )}
                  >
                    {!unlocked ? (
                      <Lock className="h-4 w-4 text-muted-foreground/60" />
                    ) : completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      lvl.caseData.icon
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-bold tracking-tight",
                        !unlocked && "text-muted-foreground/60",
                      )}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Level {String(lvl.level).padStart(2, "0")}{" "}
                      </span>
                      {lvl.caseData.title}
                    </p>
                    <p className="text-[11px] font-medium text-muted-foreground">
                      {unlocked
                        ? `${lvl.focus.join(" · ")}`
                        : "Complete the previous case to unlock"}
                    </p>
                  </div>
                  {completed ? (
                    <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      Solved
                    </span>
                  ) : unlocked ? (
                    <span className="rounded-lg bg-gold/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gold">
                      {p.attempts > 0 ? "Active" : "Ready"}
                    </span>
                  ) : (
                    <span className="rounded-lg bg-secondary/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                      Locked
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Skills practiced */}
        <motion.div {...fadeUp} transition={{ delay: 0.16 }}>
          <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Skills Practiced
          </h3>
          <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-card sm:p-5">
            {skillRows.every((r) => r.attempts === 0) ? (
              <p className="py-2 text-center text-[13px] text-muted-foreground">
                Investigate a case to build your skill profile — it fills in
                from your real answers.
              </p>
            ) : (
              <div className="space-y-3.5">
                {skillRows.map((row) => (
                  <div key={row.dim}>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">
                        {row.label}
                      </span>
                      <span className="font-medium text-muted-foreground">
                        {row.attempts === 0
                          ? "not yet practiced"
                          : `${row.score}% · ${row.attempts} ${row.attempts === 1 ? "try" : "tries"}`}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <motion.div
                        className={cn(
                          "h-full rounded-full",
                          row.score >= 70
                            ? "bg-emerald-400/80"
                            : row.score >= 40
                              ? "bg-gold"
                              : row.attempts > 0
                                ? "bg-amber-400/70"
                                : "bg-secondary",
                        )}
                        initial={{ width: 0 }}
                        animate={{
                          width:
                            row.attempts === 0
                              ? "4%"
                              : `${Math.max(row.score, 6)}%`,
                        }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
          <h3 className="mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-gold" />
              Investigator Achievements
            </span>
            <span>
              {earnedCount}/{achievements.length}
            </span>
          </h3>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {achievements.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.24 + i * 0.03 }}
                className={cn(
                  "rounded-2xl border p-3.5 text-center",
                  a.earned
                    ? "border-gold/30 bg-gold/[0.06]"
                    : "border-border/30 bg-secondary/30",
                )}
              >
                <div
                  className={cn(
                    "mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl",
                    a.earned
                      ? "bg-gold/15 text-gold"
                      : "bg-secondary text-muted-foreground/40",
                  )}
                >
                  {a.icon}
                </div>
                <p
                  className={cn(
                    "text-xs font-bold",
                    a.earned ? "text-foreground" : "text-muted-foreground/50",
                  )}
                >
                  {a.label}
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-[10px] leading-snug",
                    a.earned ? "text-muted-foreground" : "text-muted-foreground/40",
                  )}
                >
                  {a.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div {...fadeUp} transition={{ delay: 0.26 }}>
          <button
            onClick={() => navigate("/home")}
            className="flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-md transition-all duration-300 hover:translate-y-[-1px] hover:bg-primary/90 hover:shadow-lg active:translate-y-0"
          >
            Back to Case Files
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </main>
  );
}
