import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../lib/gameContext";
import { RewindIntervention } from "../components/RewindIntervention";
import { caseData } from "../lib/gameData";
import type { SceneType } from "../lib/gameData";
import {
  BookOpen,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Lightbulb,
  MapPin,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
};

export default function ReadingScene() {
  const {
    state,
    answerQuestion,
    advanceScene,
    isCaseComplete,
    triggerRewind,
    dismissRewind,
  } = useGame();

  const currentSceneIndex = state.currentSceneIndex;
  const { currentScene, answeredQuestions, rewind } = state;
  const isAnswered = answeredQuestions[currentScene.id];
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [feedbackPhase, setFeedbackPhase] = useState<
    "answer" | "feedback" | "rewind" | null
  >(null);

  const handleAnswer = (option: SceneType["options"][number]) => {
    if (showResult) return;
    setSelectedOption(option.id);
    answerQuestion(currentScene.id, option.id, option.correct);
    setShowResult(true);
    setFeedbackPhase("feedback");
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
        className="max-w-2xl mx-auto px-4 py-6 pb-28 sm:px-6"
      >
        {/* Adapted challenge indicator */}
        {adaptedMsg && !isAnswered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4 rounded-2xl bg-gold/8 border border-gold/15 px-4 py-3 flex items-center gap-2.5"
          >
            <Lightbulb className="w-4 h-4 text-gold shrink-0" />
            <p className="text-[13px] text-foreground/70 leading-relaxed">
              {adaptedMsg}
            </p>
          </motion.div>
        )}

        {/* Scene Header */}
        <motion.div {...fadeUp}>
          <div className="rounded-2xl bg-card shadow-card border border-border/40 p-5 sm:p-6 mb-4">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-foreground font-display text-lg tracking-tight">
                  {currentScene.title}
                </h2>
                <p className="text-xs text-muted-foreground font-medium">
                  {currentScene.location}
                  <span className="mx-1.5 text-border">·</span>
                  Scene {currentSceneIndex + 1} of {caseData.scenes.length}
                </p>
              </div>
            </div>

            {/* Witness Card — Premium */}
            <div className="rounded-xl bg-secondary/50 border border-border/40 p-4 mb-4">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center text-sm font-bold text-primary">
                  {currentScene.witnessName ? currentScene.witnessName[0] : "?"}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {currentScene.witnessName}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    {currentScene.witnessRole}
                  </p>
                </div>
              </div>
              <p className="text-[13px] text-foreground/75 leading-relaxed italic pl-[46px]">
                "{currentScene.witnessStatement}"
              </p>
            </div>

            {/* Passage — Evidence File */}
            <div className="rounded-xl bg-gold/5 border border-gold/15 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-gold" />
                <p className="text-[10px] font-bold text-gold uppercase tracking-[0.15em]">
                  Case Evidence
                </p>
              </div>
              <p className="text-[13px] text-foreground/80 leading-[1.75] whitespace-pre-line">
                {currentScene.passage}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Question */}
        <motion.div {...fadeUp} transition={{ delay: 0.06 }}>
          <div className="rounded-2xl bg-card shadow-card border border-border/40 p-5 sm:p-6 mb-4">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-start gap-2.5">
              <span className="w-6 h-6 shrink-0 rounded-lg bg-primary/8 flex items-center justify-center text-xs font-bold text-primary mt-0.5">
                ?
              </span>
              <span className="leading-relaxed">{currentScene.question}</span>
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
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 text-[13px] flex items-center gap-3 ${
                      showCorrectHighlight
                        ? "border-emerald-400 bg-emerald-50"
                        : showWrongHighlight
                          ? "border-red-300 bg-red-50"
                          : isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border/60 hover:border-primary/20 hover:bg-secondary/50"
                    } ${showResult ? "cursor-default" : ""}`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        showCorrectHighlight
                          ? "bg-emerald-100 text-emerald-700"
                          : showWrongHighlight
                            ? "bg-red-100 text-red-600"
                            : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {showCorrectHighlight ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : showWrongHighlight ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        letters[i]
                      )}
                    </span>
                    <span className="text-foreground/80">{option.text}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Feedback Panel */}
        <AnimatePresence>
          {showResult && selected && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mb-4"
            >
              <div
                className={`rounded-2xl p-5 border ${
                  selected.correct
                    ? "bg-emerald-50/50 border-emerald-200/60"
                    : "bg-amber-50/50 border-amber-200/60"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  {selected.correct ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-amber-600" />
                  )}
                  <p
                    className={`font-bold text-sm ${
                      selected.correct ? "text-emerald-800" : "text-amber-800"
                    }`}
                  >
                    {selected.correct
                      ? "Correct! You found a key piece of evidence."
                      : "Not quite — but a good detective never gives up."}
                  </p>
                </div>
                <p
                  className={`text-[13px] leading-relaxed ${
                    selected.correct ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  {selected.feedback}
                </p>

                {/* REWIND BUTTON — The Premium Moment */}
                {!selected.correct && feedbackPhase === "feedback" && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 25 }}
                    onClick={handleRetry}
                    className="mt-4 px-5 py-3 rounded-xl bg-gradient-to-r from-gold to-amber-500 text-white text-sm font-bold hover:from-amber-600 hover:to-amber-600 transition-all duration-300 flex items-center gap-2.5 shadow-md hover:shadow-lg hover:translate-y-[-1px] active:translate-y-0"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Rewind & Try Again
                  </motion.button>
                )}

                {selected.correct && currentScene.clueUnlocked && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ delay: 0.3 }}
                    className="mt-3 rounded-xl bg-card/60 border border-emerald-200/40 p-3.5"
                  >
                    <p className="text-[10px] font-bold text-emerald-700 mb-1 flex items-center gap-1.5 uppercase tracking-[0.1em]">
                      <Lightbulb className="w-3.5 h-3.5" />
                      Clue Unlocked
                    </p>
                    <p className="text-[13px] text-emerald-800 font-medium">
                      {currentScene.clueUnlocked.description}
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue Button */}
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={() => {
                setShowResult(false);
                setSelectedOption(null);
                setFeedbackPhase(null);
                if (isCaseComplete()) {
                  window.location.href = "/progress";
                } else {
                  advanceScene();
                }
              }}
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:translate-y-[-1px] active:translate-y-0"
            >
              {isCaseComplete() ? (
                <>
                  View Investigation Results
                  <CheckCircle2 className="w-4 h-4" />
                </>
              ) : (
                <>
                  Continue Investigation
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.div>
        )}
      </motion.div>
    </>
  );
}
