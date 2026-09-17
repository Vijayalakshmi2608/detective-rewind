import { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useGame } from "@/lib/gameContext";
import { CASE_LEVELS } from "@/lib/cases";
import {
  BadgeCheck,
  BookOpen,
  Brain,
  CheckCircle2,
  FileSearch,
  Lightbulb,
  Lock,
  Mic,
  RotateCcw,
  Sparkles,
  Search,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
};

function Check({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200/60 bg-emerald-50/70 px-4 py-2.5">
      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
      <span className="text-[13px] font-semibold text-emerald-800">{label}</span>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-3.5 text-center">
      <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-gold/12 text-gold">
        {icon}
      </div>
      <p className="text-lg font-extrabold tracking-tight text-foreground">
        {value}
      </p>
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

export default function CaseComplete() {
  const navigate = useNavigate();
  const { state, caseProgress } = useGame();

  const finishedCase = state.currentCase;
  const finishedLevel = state.currentCaseLevel;
  const prog = caseProgress(finishedCase.id);

  const nextLevel = CASE_LEVELS.find((l) => l.level === finishedLevel.level + 1);
  const isFinalCase = !nextLevel;

  // Learning summary — only from REAL session data
  const summary = useMemo(() => {
    const clues = prog.cluesFound.length;
    const accuracy =
      prog.attempts > 0
        ? Math.round((prog.correctFirstTry / prog.attempts) * 100)
        : 0;
    const rewindNote =
      prog.rewindsUsed > 0
        ? prog.rewindImprovements > 0
          ? `You used Rewind ${prog.rewindsUsed} ${prog.rewindsUsed === 1 ? "time" : "times"} and improved ${prog.rewindImprovements} ${prog.rewindImprovements === 1 ? "answer" : "answers"} — re-reading really works.`
          : `You used Rewind ${prog.rewindsUsed} ${prog.rewindsUsed === 1 ? "time" : "times"} — going back to re-read is how real detectives work.`
        : null;
    return { clues, accuracy, rewindNote };
  }, [prog]);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-8 sm:px-6">
      {/* ─── CASE SOLVED header ─── */}
      <motion.div {...fadeUp} className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/15 shadow-card">
          <Trophy className="h-8 w-8 text-gold" />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">
          Level {finishedLevel.level} · {finishedCase.location}
        </p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Case Solved
        </h1>
        <p className="mt-2 text-[15px] font-semibold text-foreground/70">
          {finishedCase.icon} {finishedCase.title}
        </p>
      </motion.div>

      {/* ─── Investigation checklist ─── */}
      <motion.div
        {...fadeUp}
        transition={{ delay: 0.08 }}
        className="mb-5 rounded-2xl border border-border/40 bg-card p-5 shadow-card sm:p-6"
      >
        <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          <BadgeCheck className="h-3.5 w-3.5 text-gold" />
          Investigation Summary
        </p>
        <div className="space-y-2">
          <Check label="Investigation complete" />
          <Check label={`Evidence collected — ${summary.clues} of ${finishedCase.totalClues} clues`} />
          <Check
            label={
              prog.readAloudSessions > 0
                ? `Reading challenge completed — ${prog.readAloudSessions} read-aloud ${prog.readAloudSessions === 1 ? "session" : "sessions"}`
                : "Reading challenge completed"
            }
          />
          <Check label="Learning progress updated" />
        </div>
      </motion.div>

      {/* ─── Learning stats ─── */}
      <motion.div
        {...fadeUp}
        transition={{ delay: 0.14 }}
        className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        <Stat
          icon={<Search className="h-3.5 w-3.5" />}
          label="Clues"
          value={`${summary.clues}/${finishedCase.totalClues}`}
        />
        <Stat
          icon={<Brain className="h-3.5 w-3.5" />}
          label="First-try"
          value={prog.attempts > 0 ? `${summary.accuracy}%` : "—"}
        />
        <Stat
          icon={<RotateCcw className="h-3.5 w-3.5" />}
          label="Rewinds"
          value={String(prog.rewindsUsed)}
        />
        <Stat
          icon={<Mic className="h-3.5 w-3.5" />}
          label="Read aloud"
          value={String(prog.readAloudSessions)}
        />
      </motion.div>

      {/* ─── Learning takeaways — honest, real-data only ─── */}
      <motion.div
        {...fadeUp}
        transition={{ delay: 0.2 }}
        className="mb-5 rounded-2xl border border-gold/20 bg-gold/[0.04] p-5 sm:p-6"
      >
        <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
          <Lightbulb className="h-3.5 w-3.5" />
          What this case taught you
        </p>
        <div className="space-y-2.5">
          <p className="flex items-start gap-2.5 text-[13px] leading-relaxed text-foreground/80">
            <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            Focus practiced:{" "}
            <span className="font-semibold">
              {finishedLevel.focus.join(" · ")}
            </span>
          </p>
          {summary.rewindNote && (
            <p className="flex items-start gap-2.5 text-[13px] leading-relaxed text-foreground/80">
              <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              {summary.rewindNote}
            </p>
          )}
          {prog.attempts === 0 && (
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              No question attempts recorded for this case yet — the summary will
              fill in as you investigate.
            </p>
          )}
        </div>
      </motion.div>

      {/* ─── Next level unlock ─── */}
      <motion.div {...fadeUp} transition={{ delay: 0.26 }}>
        {nextLevel ? (
          <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-card sm:p-6">
            <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              Next Case Unlocked
            </p>
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-2xl">
                {nextLevel.caseData.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Level {nextLevel.level} · {nextLevel.focusLabel}
                </p>
                <p className="truncate text-base font-bold tracking-tight text-foreground">
                  {nextLevel.caseData.title}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {nextLevel.caseData.subtitle}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                navigate("/home");
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-md transition-all duration-200 hover:translate-y-[-1px] hover:bg-primary/90 hover:shadow-lg active:translate-y-0"
            >
              <FileSearch className="h-4 w-4" />
              Open Level {nextLevel.level} — {nextLevel.caseData.title}
            </button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Find it on your Home screen under Case Files
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-gold/30 bg-gold/[0.06] p-5 text-center sm:p-6">
            <p className="mb-1 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
              <Trophy className="h-3.5 w-3.5" />
              Journey Complete
            </p>
            <p className="text-sm font-bold text-foreground">
              You've solved every case in the detective academy.
            </p>
            <p className="mt-1 text-[13px] text-foreground/70">
              Revisit any case to sharpen your skills, or review your Tutor
              Insights to see how far your reading has come.
            </p>
          </div>
        )}
      </motion.div>

      {/* ─── Secondary actions ─── */}
      <motion.div
        {...fadeUp}
        transition={{ delay: 0.32 }}
        className="mt-4 flex flex-col gap-2.5 sm:flex-row"
      >
        <button
          onClick={() => navigate("/progress")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl border border-border/60 bg-card py-3 text-[13px] font-bold text-foreground transition-all duration-200",
            "hover:border-primary/20 hover:bg-secondary/50",
          )}
        >
          <Trophy className="h-4 w-4 text-gold" />
          View Full Progress
        </button>
        <button
          onClick={() => navigate("/tutor")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl border border-border/60 bg-card py-3 text-[13px] font-bold text-foreground transition-all duration-200",
            "hover:border-primary/20 hover:bg-secondary/50",
          )}
        >
          <Brain className="h-4 w-4 text-primary" />
          Tutor Insights
        </button>
      </motion.div>

      {/* Completion marker */}
      <motion.p
        {...fadeUp}
        transition={{ delay: 0.4 }}
        className="mt-6 text-center text-[11px] text-muted-foreground/70"
      >
        {isFinalCase
          ? "Detective Legend status achieved."
          : "Progress saved — refreshing won't lose your solved cases."}
      </motion.p>
    </div>
  );
}
