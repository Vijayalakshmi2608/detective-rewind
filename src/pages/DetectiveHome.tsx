import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useGame } from "@/lib/gameContext";
import { CASE_LEVELS } from "@/lib/cases";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Search,
  BookOpen,
  Brain,
  Lock,
  MapPin,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
};

export default function DetectiveHome() {
  const navigate = useNavigate();
  const { state, selectLevel, caseProgress, isLevelUnlocked } = useGame();
  const {
    currentLevel,
    currentCaseLevel,
    currentCase,
    cluesFound,
    currentSceneIndex,
    totalScenes,
    progression,
  } = state;

  // ─── Real totals across all cases ───
  const totals = (() => {
    let clues = 0;
    let solved = 0;
    let readAloud = 0;
    for (const lvl of CASE_LEVELS) {
      const p = progression.cases[lvl.caseData.id];
      if (!p) continue;
      clues += p.cluesFound.length;
      readAloud += p.readAloudSessions;
      if (p.completed) solved++;
    }
    return { clues, solved, readAloud };
  })();

  // The active case = highest unlocked, not-yet-completed level
  const activeLevel =
    CASE_LEVELS.find(
      (l) => isLevelUnlocked(l.level) && !caseProgress(l.caseData.id).completed,
    ) ?? CASE_LEVELS[CASE_LEVELS.length - 1];

  const isActiveCase = currentCase.id === activeLevel.caseData.id;

  const handleContinue = () => {
    if (!isActiveCase) selectLevel(activeLevel.level);
    navigate("/reading");
  };

  return (
    <main className="min-h-screen bg-background pb-28">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        {/* Welcome Hero — compact, engaging */}
        <header className="pb-6 pt-8 sm:pb-8 sm:pt-12">
          <motion.p
            {...fadeUp}
            className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold"
          >
            Detective Academy · Case Files
          </motion.p>
          <motion.h1
            {...fadeUp}
            transition={{ delay: 0.05 }}
            className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
          >
            Welcome back, Detective
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ delay: 0.1 }}
            className="mt-2 text-[15px] leading-relaxed text-muted-foreground sm:text-base"
          >
            {totals.solved === 0
              ? "Your first mystery is waiting. Reading is how you solve it."
              : `${totals.solved} ${totals.solved === 1 ? "case" : "cases"} solved — the next mystery is unlocked.`}
          </motion.p>
        </header>

        <div className="grid gap-5 lg:grid-cols-5 lg:gap-6">
          {/* ─── Left: active case file + CTA ─── */}
          <div className="space-y-5 lg:col-span-3">
            <motion.div {...fadeUp} transition={{ delay: 0.12 }}>
              <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-card transition-shadow duration-300 hover:shadow-card-hover">
                {/* Case-file tab strip */}
                <div className="flex items-center justify-between border-b border-dashed border-border/70 bg-secondary/50 px-5 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-gold">
                      Level {activeLevel.level}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      Case File · Active
                    </span>
                  </div>
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-40" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary text-3xl">
                      {activeLevel.caseData.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl font-extrabold leading-tight tracking-tight text-foreground sm:text-2xl">
                        {activeLevel.caseData.title}
                      </h2>
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {activeLevel.caseData.location}
                        <span className="mx-1 text-border">·</span>
                        {activeLevel.focusLabel}
                      </p>
                    </div>
                  </div>

                  {/* Focus chips — what this case trains */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {activeLevel.focus.map((f) => (
                      <span
                        key={f}
                        className="rounded-full border border-border/50 bg-secondary/60 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground"
                      >
                        {f}
                      </span>
                    ))}
                  </div>

                  {/* Scene progress */}
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-muted-foreground">
                        Scene {currentSceneIndex + 1} of {totalScenes}
                      </span>
                      <span className="font-bold text-foreground">
                        {activeLevel.caseData.totalClues - cluesFound.length}{" "}
                        {activeLevel.caseData.totalClues - cluesFound.length === 1
                          ? "clue"
                          : "clues"}{" "}
                        left to find
                      </span>
                    </div>
                    <div className="mt-2.5 flex gap-1.5">
                      {Array.from({ length: totalScenes }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 0.3 + i * 0.06, duration: 0.3 }}
                          className={cn(
                            "h-1.5 flex-1 origin-left rounded-full",
                            i < currentSceneIndex
                              ? "bg-primary"
                              : i === currentSceneIndex
                                ? "bg-gold"
                                : "bg-secondary",
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Strongest CTA */}
                  <button
                    onClick={handleContinue}
                    className="mt-5 flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-md transition-all duration-200 hover:translate-y-[-1px] hover:bg-primary/90 hover:shadow-lg active:translate-y-0"
                  >
                    Continue Investigation
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ─── Right: journey progress + quick links ─── */}
          <div className="space-y-5 lg:col-span-2">
            {/* Learning progress */}
            <motion.div {...fadeUp} transition={{ delay: 0.18 }}>
              <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-card sm:p-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Investigation Totals
                </h3>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-2xl font-extrabold tracking-tight text-foreground">
                      {totals.clues}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      clues
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold tracking-tight text-foreground">
                      {totals.solved}
                      <span className="text-sm text-muted-foreground">
                        /{CASE_LEVELS.length}
                      </span>
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      solved
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold tracking-tight text-foreground">
                      {totals.readAloud}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      read aloud
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick links */}
            <motion.div {...fadeUp} transition={{ delay: 0.24 }}>
              <div className="space-y-2.5">
                {[
                  {
                    label: "Clue Board",
                    desc: `${totals.clues} clues collected`,
                    path: "/clues",
                    icon: <Search className="h-4 w-4" />,
                  },
                  {
                    label: "Tutor Insights",
                    desc: "See what AI learned about your reading",
                    path: "/tutor",
                    icon: <Brain className="h-4 w-4" />,
                  },
                  {
                    label: "Vocabulary Notes",
                    desc: "Words you've discovered",
                    path: "/vocabulary",
                    icon: <BookOpen className="h-4 w-4" />,
                  },
                ].map((link) => (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className="group flex w-full items-center gap-3.5 rounded-2xl border border-border/60 bg-card px-4 py-3.5 text-left shadow-card transition-all duration-200 hover:border-primary/15 hover:shadow-card-hover active:scale-[0.99]"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-colors duration-200 group-hover:bg-primary/8 group-hover:text-primary">
                      {link.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        {link.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{link.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground/40" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ─── Case Journey — full level list ─── */}
        <section className="mt-8">
          <motion.h2
            {...fadeUp}
            className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
          >
            Case Journey · Solve in Order
          </motion.h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {CASE_LEVELS.map((lvl, idx) => {
              const p = caseProgress(lvl.caseData.id);
              const unlocked = isLevelUnlocked(lvl.level);
              const completed = p.completed;
              const isCurrent = lvl.caseData.id === activeLevel.caseData.id;

              return (
                <motion.button
                  key={lvl.caseData.id}
                  {...fadeUp}
                  transition={{ delay: 0.28 + idx * 0.04 }}
                  onClick={() => {
                    if (!unlocked) return;
                    selectLevel(lvl.level);
                    navigate(completed ? "/case" : "/reading");
                  }}
                  disabled={!unlocked}
                  className={cn(
                    "group flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200",
                    !unlocked && "cursor-not-allowed border-border/30 bg-secondary/30",
                    unlocked &&
                      !completed &&
                      "border-border/60 bg-card shadow-card hover:border-primary/20 hover:shadow-card-hover active:scale-[0.99]",
                    completed &&
                      "border-emerald-200/50 bg-emerald-50/40 hover:border-emerald-300/60",
                    isCurrent &&
                      !completed &&
                      "ring-2 ring-gold/40 ring-offset-2 ring-offset-background",
                  )}
                >
                  {/* Status icon */}
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl",
                      !unlocked
                        ? "bg-secondary/60 grayscale opacity-60"
                        : completed
                          ? "bg-emerald-100/70"
                          : "bg-secondary",
                    )}
                  >
                    {!unlocked ? (
                      <Lock className="h-5 w-5 text-muted-foreground/60" />
                    ) : completed ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    ) : (
                      lvl.caseData.icon
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider",
                          completed
                            ? "text-emerald-700"
                            : unlocked
                              ? "text-primary"
                              : "text-muted-foreground/50",
                        )}
                      >
                        Level {String(lvl.level).padStart(2, "0")}
                      </span>
                      {completed && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          Completed
                        </span>
                      )}
                      {!completed && unlocked && (
                        <span className="flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold">
                          {isCurrent ? "In Progress" : "Unlocked"}
                        </span>
                      )}
                      {!unlocked && (
                        <span className="flex items-center gap-1 rounded-full bg-secondary/70 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">
                          <Lock className="h-2.5 w-2.5" />
                          Locked
                        </span>
                      )}
                    </div>
                    <p
                      className={cn(
                        "truncate text-[15px] font-bold tracking-tight",
                        !unlocked
                          ? "text-muted-foreground/60"
                          : "text-foreground",
                      )}
                    >
                      {lvl.caseData.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {unlocked
                        ? `${lvl.focusLabel} · ${lvl.caseData.totalClues} clues`
                        : "Complete the previous case to unlock"}
                    </p>
                  </div>

                  {unlocked && (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform duration-200 group-hover:translate-x-0.5" />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Journey legend */}
          <motion.div
            {...fadeUp}
            transition={{ delay: 0.5 }}
            className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-gold" /> Solve each case to
              unlock the next
            </span>
            <span className="hidden text-border sm:inline">·</span>
            <span>Progress is saved automatically</span>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
