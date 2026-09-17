import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame, type RewindState } from "../lib/gameContext";
import type { SceneType } from "../lib/gameData";

type OptionItem = SceneType["options"][number];

import {
  RotateCcw,
  ArrowRight,
  X,
  CheckCircle2,
  XCircle,
  Sparkles,
  Eye,
  Rewind,
} from "lucide-react";

type Props = {
  rewind: RewindState;
  onRetryComplete: (correct: boolean) => void;
};

export function RewindIntervention({ rewind, onRetryComplete }: Props) {
  const { state, retryQuestion, dismissRewind } = useGame();
  const [phase, setPhase] = useState<"rewind" | "retry" | "result">(
    "rewind",
  );
  const [retryCorrect, setRetryCorrect] = useState<boolean | null>(null);

  const scene = state.currentCase.scenes.find((s) => s.id === rewind.sceneId);
  if (!scene) return null;

  const handleRetry = (option: OptionItem) => {
    setRetryCorrect(option.correct);
    retryQuestion(rewind.sceneId, option.id, option.correct);
    setPhase("result");

    setTimeout(() => {
      onRetryComplete(option.correct);
    }, 2800);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/50 backdrop-blur-md p-0 sm:p-4"
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 40 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="w-full sm:max-w-lg bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
        >
          {/* Header — Gold/Rewind themed */}
          <div className="relative bg-gradient-to-r from-foreground via-foreground to-foreground/90 px-6 py-5 text-primary-foreground overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute right-6 top-1/2 -translate-y-1/2">
                <Rewind className="w-32 h-32 text-white" />
              </div>
            </div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-gold/20 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg font-display tracking-tight">
                    Rewind
                  </h3>
                  <p className="text-white/60 text-[13px]">
                    Let's go back and look closer
                  </p>
                </div>
              </div>
              {phase !== "retry" && (
                <button
                  onClick={() => {
                    dismissRewind();
                    onRetryComplete(false);
                  }}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            <AnimatePresence mode="wait">
              {phase === "rewind" && (
                <motion.div
                  key="rewind"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  className="space-y-3.5"
                >
                  {/* What you chose */}
                  <div className="rounded-xl bg-red-50/80 border border-red-200/60 p-4">
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      What you chose
                    </p>
                    <p className="text-red-900 text-[13px] leading-relaxed">
                      "{rewind.originalOption}"
                    </p>
                  </div>

                  {/* Re-read — Gold themed */}
                  <div className="rounded-xl bg-gold/5 border border-gold/20 p-4">
                    <p className="text-[10px] font-bold text-gold uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Re-read this part carefully
                    </p>
                    <p className="text-foreground/80 text-[13px] leading-relaxed italic">
                      {rewind.passageExcerpt}
                    </p>
                  </div>

                  {/* Detective Hint */}
                  <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.15em] mb-2">
                      🔍 Detective Hint
                    </p>
                    <p className="text-foreground/80 text-[13px] leading-relaxed">
                      {rewind.hint}
                    </p>
                  </div>

                  <button
                    onClick={() => setPhase("retry")}
                    className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all duration-200 flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg hover:translate-y-[-1px] active:translate-y-0"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {phase === "retry" && (
                <motion.div
                  key="retry"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  className="space-y-2.5"
                >
                  <p className="text-[13px] text-muted-foreground text-center mb-1 font-medium">
                    Take another look at the passage and choose:
                  </p>
                  {scene.options.map((option, i) => (
                    <motion.button
                      key={option.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => handleRetry(option)}
                      className="w-full p-4 text-left rounded-xl border-2 border-border/60 hover:border-primary/20 hover:bg-secondary/50 transition-all duration-200 text-[13px]"
                    >
                      <span className="font-semibold text-foreground/80">
                        {option.text}
                      </span>
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {phase === "result" && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  {/* Before / After — Premium Comparison */}
                  <div className="flex items-stretch gap-3">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex-1 rounded-xl bg-red-50/80 border border-red-200/60 p-4 text-center"
                    >
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-[0.15em] mb-2">
                        Before Rewind
                      </p>
                      <XCircle className="w-10 h-10 text-red-300 mx-auto my-1" />
                      <p className="text-[11px] text-red-600 font-semibold mt-1">Incorrect</p>
                    </motion.div>

                    <div className="flex items-center text-gold">
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 400, damping: 20 }}
                      >
                        <RotateCcw className="w-6 h-6" />
                      </motion.div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className={`flex-1 rounded-xl p-4 text-center ${
                        retryCorrect
                          ? "bg-emerald-50 border border-emerald-200/60"
                          : "bg-amber-50/80 border border-amber-200/60"
                      }`}
                    >
                      <p className={`text-[10px] font-bold uppercase tracking-[0.15em] mb-2 ${
                        retryCorrect ? "text-emerald-500" : "text-amber-500"
                      }`}>
                        After Rewind
                      </p>
                      {retryCorrect ? (
                        <>
                          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto my-1" />
                          <p className="text-[11px] text-emerald-700 font-bold mt-1">
                            Correct!
                          </p>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-10 h-10 text-amber-300 mx-auto my-1" />
                          <p className="text-[11px] text-amber-600 font-semibold mt-1">
                            Keep trying
                          </p>
                        </>
                      )}
                    </motion.div>
                  </div>

                  {retryCorrect && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="rounded-xl bg-gold/8 border border-gold/20 p-4 text-center"
                    >
                      <p className="text-foreground font-bold text-sm">
                        🎉 You rewound and found the right answer!
                      </p>
                      <p className="text-foreground/60 text-[13px] mt-1">
                        Re-reading carefully helped you solve this part of the
                        mystery.
                      </p>
                    </motion.div>
                  )}

                  {!retryCorrect && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="rounded-xl bg-secondary/50 border border-border/40 p-4 text-center"
                    >
                      <p className="text-foreground/70 text-[13px]">
                        💡 That's okay — great detectives keep investigating.
                        Check the clue board for more context.
                      </p>
                    </motion.div>
                  )}

                  <button
                    onClick={() => {
                      dismissRewind();
                      onRetryComplete(retryCorrect ?? false);
                    }}
                    className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all duration-200 shadow-md"
                  >
                    Continue Investigation
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
