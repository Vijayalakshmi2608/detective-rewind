import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import { useGame } from "../lib/gameContext";
import { RewindIntervention } from "../components/RewindIntervention";
import { ReadAloudPanel } from "../components/ReadAloudPanel";
import type { SceneType } from "../lib/gameData";
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import type { ReadingMetrics } from "@/lib/readingMetrics";
import {
  BookOpen,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Lightbulb,
  MapPin,
  Mic,
  Search,
  Brain,
  Unlock,
  Loader2,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
};

type AIEval = {
  understanding: string;
  reasoningQuality: string;
  nextStep: string;
  connectsToReading: string;
  confidence: "high" | "medium" | "low";
};

// ─── Step indicator: READ → INVESTIGATE → SOLVE ────
function StepTracker({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: "Read Aloud", icon: Mic },
    { n: 2, label: "Investigate", icon: Search },
    { n: 3, label: "Solve", icon: Unlock },
  ];
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {steps.map((s, i) => {
        const active = s.n === current;
        const done = s.n < current;
        return (
          <div key={s.n} className="flex items-center gap-1.5 sm:gap-2">
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors duration-300 sm:px-3",
                active && "bg-primary text-primary-foreground",
                done && "bg-gold/15 text-gold",
                !active && !done && "bg-secondary text-muted-foreground",
              )}
            >
              {done ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <s.icon className="h-3.5 w-3.5" />
              )}
              <span className="hidden text-[11px] font-bold sm:inline">
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ReadingScene() {
  const navigate = useNavigate();
  const {
    state,
    answerQuestion,
    recordReadAloud,
    advanceScene,
    completeCase,
    isCaseComplete,
    triggerRewind,
    dismissRewind,
  } = useGame();

  const evaluateReasoning = useAction(api.tutorInsights.evaluateReasoning);

  const currentCase = state.currentCase;
  const currentSceneIndex = state.currentSceneIndex;
  const { currentScene, answeredQuestions, rewind } = state;
  const isAnswered = answeredQuestions[currentScene.id];

  // Reading phase gates the question — reading aloud powers the investigation
  const [hasRead, setHasRead] = useState(false);
  const [readingMetrics, setReadingMetrics] = useState<ReadingMetrics | null>(
    null,
  );

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [feedbackPhase, setFeedbackPhase] = useState<
    "answer" | "feedback" | "rewind" | null
  >(null);

  // AI reasoning evaluation state
  const [aiEval, setAiEval] = useState<AIEval | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAnswer = async (option: SceneType["options"][number]) => {
    if (showResult) return;
    setSelectedOption(option.id);
    answerQuestion(currentScene.id, option.id, option.correct);
    setShowResult(true);
    setFeedbackPhase("feedback");
    setAiLoading(true);

    // Fire AI reasoning evaluation with real answer + real reading metrics
    try {
      const evalResult = (await evaluateReasoning({
        question: currentScene.question,
        chosenAnswer: option.text,
        correctAnswer:
          currentScene.options.find((o) => o.correct)?.text ?? "",
        wasCorrect: option.correct,
        witnessStatement: currentScene.witnessStatement,
        readingMetrics: readingMetrics
          ? {
              wcpm: readingMetrics.wcpm,
              accuracyPct: readingMetrics.accuracyPct,
              selfCorrections: readingMetrics.selfCorrections,
              durationSec: readingMetrics.durationSec,
            }
          : undefined,
        caseTitle: currentCase.title,
        sceneLocation: currentScene.location,
        caseFocus: state.currentCaseLevel.focus.join(" · "),
      })) as unknown as AIEval;
      setAiEval(evalResult);
    } catch {
      setAiEval(null);
    } finally {
      setAiLoading(false);
    }
  };

  const handleRetry = () => {
    setFeedbackPhase("rewind");
    triggerRewind(currentScene.id, selectedOption!);
  };

  const handleRewindComplete = (_retryCorrect: boolean) => {
    setFeedbackPhase(null);
    setShowResult(true);
  };

  const selected = currentScene.options.find((o) => o.id === selectedOption);
  const adaptedMsg = state.adaptiveRecommendation?.hintMessage;
  const currentStep: 1 | 2 | 3 = !hasRead ? 1 : !showResult ? 2 : 3;

  return (
    <>
      {rewind?.active && (
        <RewindIntervention
          rewind={rewind}
          onRetryComplete={handleRewindComplete}
        />
      )}

      <motion.div
        key={currentScene.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        className="mx-auto max-w-3xl px-4 pb-28 pt-6 sm:px-6 lg:max-w-4xl"
      >
        {/* Step tracker — the loop made visible */}
        <motion.div {...fadeUp} className="mb-5 flex justify-center">
          <StepTracker current={currentStep} />
        </motion.div>

        {/* Adapted challenge indicator */}
        {adaptedMsg && !isAnswered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4 flex items-center gap-2.5 rounded-2xl border border-gold/15 bg-gold/8 px-4 py-3"
          >
            <Lightbulb className="h-4 w-4 shrink-0 text-gold" />
            <p className="text-[13px] leading-relaxed text-foreground/70">
              {adaptedMsg}
            </p>
          </motion.div>
        )}

        {/* ─── STEP 1+2: Scene file — statement, read-aloud, evidence ─── */}
        <motion.div {...fadeUp} transition={{ delay: 0.05 }}>
          <div className="mb-4 overflow-hidden rounded-2xl border border-border/40 bg-card shadow-card">
            {/* Scene header */}
            <div className="flex items-center gap-3 border-b border-border/50 px-5 py-4 sm:px-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
                  {currentScene.title}
                </h2>
                <p className="text-xs font-medium text-muted-foreground">
                  {currentScene.location}
                  <span className="mx-1.5 text-border">·</span>
                  Scene {currentSceneIndex + 1} of {currentCase.scenes.length}
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {/* Witness statement — prominent, larger type for oral reading */}
              <div className="rounded-xl border border-border/40 bg-secondary/50 p-4 sm:p-5">
                <div className="mb-3 flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/8 text-sm font-bold text-primary">
                    {currentScene.witnessName
                      ? currentScene.witnessName[0]
                      : "?"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {currentScene.witnessName}
                    </p>
                    <p className="text-[11px] font-medium text-muted-foreground">
                      {currentScene.witnessRole}
                    </p>
                  </div>
                </div>
                <p className="text-[15px] leading-[1.8] text-foreground/85 sm:text-base sm:leading-[1.85]">
                  "{currentScene.witnessStatement}"
                </p>
              </div>

              {/* READ ALOUD — primary interaction */}
              <div className="mt-4">
                <ReadAloudPanel
                  targetText={currentScene.witnessStatement}
                  onComplete={(m) => {
                    setReadingMetrics(m);
                    setHasRead(true);
                    recordReadAloud();
                  }}
                />
              </div>

              {/* Case evidence — visually connected to the statement */}
              <div className="mt-4">
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em]">
                    <BookOpen className="h-3.5 w-3.5 text-gold" />
                    Case Evidence
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <div className="rounded-xl border border-gold/15 bg-gold/5 p-4 sm:p-5">
                  <p className="text-[13px] leading-[1.75] text-foreground/80 sm:text-sm sm:leading-[1.8]">
                    {currentScene.passage}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── STEP 2: Comprehension — gated after reading ─── */}
        <AnimatePresence>
          {hasRead && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Transition line */}
              <div className="mb-4 flex items-center justify-center gap-2 text-center">
                <Search className="h-4 w-4 text-gold" />
                <p className="text-sm font-bold text-foreground">
                  Now investigate the evidence.
                </p>
              </div>

              <div className="mb-4 rounded-2xl border border-border/40 bg-card p-5 shadow-card sm:p-6">
                <h3 className="mb-4 flex items-start gap-2.5 text-sm font-bold text-foreground">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-xs font-bold text-primary">
                    ?
                  </span>
                  <span className="leading-relaxed">
                    {currentScene.question}
                  </span>
                </h3>

                <div className="space-y-2.5">
                  {currentScene.options.map((option, i) => {
                    const letters = ["A", "B", "C", "D"];
                    const isCorrect = option.correct;
                    const isSelected = selectedOption === option.id;
                    const showCorrectHighlight = showResult && isCorrect;
                    const showWrongHighlight =
                      showResult && isSelected && !isCorrect;

                    return (
                      <motion.button
                        key={option.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.08 + i * 0.04 }}
                        onClick={() => handleAnswer(option)}
                        disabled={showResult}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left text-[13px] transition-all duration-200",
                          showCorrectHighlight
                            ? "border-emerald-400 bg-emerald-50"
                            : showWrongHighlight
                              ? "border-red-300 bg-red-50"
                              : isSelected
                                ? "border-primary bg-primary/5"
                                : "border-border/60 hover:border-primary/20 hover:bg-secondary/50",
                          showResult && "cursor-default",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors",
                            showCorrectHighlight
                              ? "bg-emerald-100 text-emerald-700"
                              : showWrongHighlight
                                ? "bg-red-100 text-red-600"
                                : "bg-secondary text-muted-foreground",
                          )}
                        >
                          {showCorrectHighlight ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : showWrongHighlight ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            letters[i]
                          )}
                        </span>
                        <span className="text-foreground/80">
                          {option.text}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* ─── STEP 3: AI feedback + result ─── */}
              <AnimatePresence>
                {showResult && selected && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="mb-4"
                  >
                    <div
                      className={cn(
                        "rounded-2xl border p-5",
                        selected.correct
                          ? "border-emerald-200/60 bg-emerald-50/50"
                          : "border-amber-200/60 bg-amber-50/50",
                      )}
                    >
                      <div className="mb-2 flex items-center gap-2.5">
                        {selected.correct ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-amber-600" />
                        )}
                        <p
                          className={cn(
                            "text-sm font-bold",
                            selected.correct
                              ? "text-emerald-800"
                              : "text-amber-800",
                          )}
                        >
                          {selected.correct
                            ? "Correct! You found a key piece of evidence."
                            : "Not quite — but a good detective never gives up."}
                        </p>
                      </div>
                      <p
                        className={cn(
                          "text-[13px] leading-relaxed",
                          selected.correct
                            ? "text-emerald-700"
                            : "text-amber-700",
                        )}
                      >
                        {selected.feedback}
                      </p>

                      {/* AI reasoning evaluation — from real answer + reading */}
                      <div className="mt-3.5 rounded-xl border border-border/50 bg-card p-4">
                        <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
                          <Brain className="h-3.5 w-3.5" />
                          AI Detective Notes
                          {aiLoading && (
                            <Loader2 className="h-3 w-3 animate-spin text-gold" />
                          )}
                        </p>
                        {aiLoading && !aiEval ? (
                          <div className="space-y-2">
                            <div className="h-3 w-3/4 animate-pulse rounded bg-secondary" />
                            <div className="h-3 w-2/3 animate-pulse rounded bg-secondary" />
                          </div>
                        ) : aiEval ? (
                          <div className="space-y-2">
                            <p className="text-[13px] leading-relaxed text-foreground/80">
                              {aiEval.understanding}
                            </p>
                            <p className="text-[13px] leading-relaxed text-foreground/80">
                              {aiEval.reasoningQuality}
                            </p>
                            <p className="rounded-lg bg-gold/8 px-3 py-2 text-[13px] font-medium leading-relaxed text-foreground/80">
                              {aiEval.nextStep}
                            </p>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                              {aiEval.connectsToReading}
                            </p>
                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                              {aiEval.confidence} confidence
                            </p>
                          </div>
                        ) : (
                          <p className="text-[13px] text-muted-foreground">
                            AI feedback is unavailable right now — your answer
                            was still scored.
                          </p>
                        )}
                      </div>

                      {/* REWIND — the distinctive moment */}
                      {!selected.correct && feedbackPhase === "feedback" && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            delay: 0.4,
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                          }}
                          onClick={handleRetry}
                          className="mt-4 flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-gold to-amber-500 px-5 py-3 text-sm font-bold text-white shadow-md transition-all duration-300 hover:translate-y-[-1px] hover:shadow-lg active:translate-y-0"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Rewind & Try Again
                        </motion.button>
                      )}

                      {selected.correct && currentScene.clueUnlocked && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ delay: 0.3 }}
                          className="mt-3 rounded-xl border border-emerald-200/40 bg-card/60 p-3.5"
                        >
                          <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-700">
                            <Unlock className="h-3.5 w-3.5" />
                            Clue Unlocked
                          </p>
                          <p className="text-[13px] font-medium text-emerald-800">
                            {currentScene.clueUnlocked.description}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Continue */}
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <button
                    onClick={() => {
                      if (isCaseComplete()) {
                        completeCase();
                        navigate("/complete");
                      } else {
                        setShowResult(false);
                        setSelectedOption(null);
                        setFeedbackPhase(null);
                        setAiEval(null);
                        setHasRead(false);
                        setReadingMetrics(null);
                        advanceScene();
                      }
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground shadow-md transition-all duration-200 hover:translate-y-[-1px] hover:bg-primary/90 hover:shadow-lg active:translate-y-0"
                  >
                    {isCaseComplete() ? (
                      <>
                        View Case Summary
                        <Trophy className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Continue Investigation
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pre-reading nudge — reading is the game */}
        {!hasRead && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-1 text-center text-xs text-muted-foreground"
          >
            Read the witness statement aloud to unlock the investigation.
          </motion.p>
        )}
      </motion.div>
    </>
  );
}
