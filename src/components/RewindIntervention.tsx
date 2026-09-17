import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame, type RewindState } from "../lib/gameContext";
import { caseData } from "../lib/gameData";
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
} from "lucide-react";

type Props = {
  rewind: RewindState;
  onRetryComplete: (correct: boolean) => void;
};

export function RewindIntervention({ rewind, onRetryComplete }: Props) {
  const { retryQuestion, dismissRewind, state } = useGame();
  const [phase, setPhase] = useState<"rewind" | "retry" | "result">(
    "rewind",
  );
  const [retryAnswer, setRetryAnswer] = useState<string | null>(null);
  const [retryCorrect, setRetryCorrect] = useState<boolean | null>(null);

  const scene = caseData.scenes.find((s) => s.id === rewind.sceneId);
  if (!scene) return null;

  const handleRetry = (option: OptionItem) => {
    setRetryAnswer(option.id);
    setRetryCorrect(option.correct);
    retryQuestion(rewind.sceneId, option.id, option.correct);
    setPhase("result");

    setTimeout(() => {
      onRetryComplete(option.correct);
    }, 2500);
  };

  // Find the original attempt result
  const originalResult = state.retryResults.find(
    (r) => r.sceneId === rewind.sceneId,
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg font-display">
                    Rewind
                  </h3>
                  <p className="text-white/80 text-sm">
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
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="p-6 space-y-4">
            <AnimatePresence mode="wait">
              {phase === "rewind" && (
                <motion.div
                  key="rewind"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  {/* What you said */}
                  <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                    <p className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      What you chose
                    </p>
                    <p className="text-red-900 text-sm leading-relaxed">
                      "{rewind.originalOption}"
                    </p>
                  </div>

                  {/* Passage re-read */}
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Re-read this part carefully
                    </p>
                    <p className="text-amber-900 text-sm leading-relaxed italic">
                      {rewind.passageExcerpt}
                    </p>
                  </div>

                  {/* Hint */}
                  <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-4">
                    <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-2">
                      🔍 Detective Hint
                    </p>
                    <p className="text-indigo-900 text-sm leading-relaxed">
                      {rewind.hint}
                    </p>
                  </div>

                  <button
                    onClick={() => setPhase("retry")}
                    className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
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
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-3"
                >
                  <p className="text-sm text-slate-600 text-center mb-1">
                    Take another look at the passage and choose:
                  </p>
                  {scene.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleRetry(option)}
                      className="w-full p-3.5 text-left rounded-xl border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-sm"
                    >
                      <span className="font-medium text-slate-800">
                        {option.text}
                      </span>
                    </button>
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
                  {/* Before / After comparison */}
                  <div className="flex items-stretch gap-3">
                    <div className="flex-1 rounded-xl bg-red-50 border border-red-200 p-3 text-center">
                      <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">
                        Before Rewind
                      </p>
                      <XCircle className="w-8 h-8 text-red-400 mx-auto my-1" />
                      <p className="text-xs text-red-700">Incorrect</p>
                    </div>

                    <div className="flex items-center text-slate-300">
                      <ArrowRight className="w-5 h-5" />
                    </div>

                    <div className="flex-1 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center">
                      <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
                        After Rewind
                      </p>
                      {retryCorrect ? (
                        <>
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto my-1" />
                          <p className="text-xs text-emerald-700 font-semibold">
                            Correct!
                          </p>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-8 h-8 text-amber-400 mx-auto my-1" />
                          <p className="text-xs text-amber-700">
                            Keep trying
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {retryCorrect && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 p-4 text-center"
                    >
                      <p className="text-indigo-800 text-sm font-medium">
                        🎉 You rewound and found the right answer!
                      </p>
                      <p className="text-indigo-600 text-xs mt-1">
                        Re-reading carefully helped you solve this part of the
                        mystery.
                      </p>
                    </motion.div>
                  )}

                  {!retryCorrect && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center">
                      <p className="text-amber-800 text-sm">
                        💡 That's okay — great detectives keep investigating.
                        Check the clue board for more context.
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      dismissRewind();
                      onRetryComplete(retryCorrect ?? false);
                    }}
                    className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
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
