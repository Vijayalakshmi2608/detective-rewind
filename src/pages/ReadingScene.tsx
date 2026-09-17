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

    // If wrong, offer rewind after showing feedback
    if (!option.correct) {
      // Don't trigger rewind immediately — let user see why they were wrong first
    }
  };

  const handleRetry = () => {
    setFeedbackPhase("rewind");
    triggerRewind(currentScene.id, selectedOption!);
  };

  const handleRewindComplete = (retryCorrect: boolean) => {
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-2xl mx-auto"
      >
        {/* Adapted challenge indicator */}
        {adaptedMsg && !isAnswered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4 rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-3 flex items-center gap-2"
          >
            <Lightbulb className="w-4 h-4 text-indigo-500 shrink-0" />
            <p className="text-xs text-indigo-700 leading-relaxed">
              {adaptedMsg}
            </p>
          </motion.div>
        )}

        {/* Scene Header */}
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 font-display text-lg">
                {currentScene.title}
              </h2>
              <p className="text-xs text-slate-500">
                {currentScene.location} — Scene {currentSceneIndex + 1} of{" "}
                {caseData.scenes.length}
              </p>
            </div>
          </div>

          {/* Witness Card */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-700">
                {currentScene.witnessName ? currentScene.witnessName[0] : "?"}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {currentScene.witnessName}
                </p>
                <p className="text-xs text-slate-500">
                  {currentScene.witnessRole}
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed italic">
              "{currentScene.witnessStatement}"
            </p>
          </div>

          {/* Passage */}
          <div className="rounded-xl bg-indigo-50/50 border border-indigo-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                Case Evidence
              </p>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
              {currentScene.passage}
            </p>
          </div>
        </div>

        {/* Question */}
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-5 mb-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center text-xs text-indigo-700">
              ?
            </span>
            {currentScene.question}
          </h3>

          <div className="space-y-2">
            {currentScene.options.map((option, i) => {
              const letters = ["A", "B", "C", "D"];
              const isCorrect = option.correct;
              const isSelected = selectedOption === option.id;
              const showCorrectHighlight =
                showResult && isCorrect;
              const showWrongHighlight =
                showResult && isSelected && !isCorrect;

              return (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleAnswer(option)}
                  disabled={showResult}
                  className={`w-full p-3.5 text-left rounded-xl border-2 transition-all text-sm flex items-center gap-3 ${
                    showCorrectHighlight
                      ? "border-emerald-400 bg-emerald-50"
                      : showWrongHighlight
                        ? "border-red-300 bg-red-50"
                        : isSelected
                          ? "border-indigo-400 bg-indigo-50"
                          : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 ${
                      showCorrectHighlight
                        ? "bg-emerald-100 text-emerald-700"
                        : showWrongHighlight
                          ? "bg-red-100 text-red-600"
                          : "bg-slate-100 text-slate-600"
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
                  <span className="text-slate-700">{option.text}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

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
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {selected.correct ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-amber-600" />
                  )}
                  <p
                    className={`font-semibold text-sm ${
                      selected.correct ? "text-emerald-800" : "text-amber-800"
                    }`}
                  >
                    {selected.correct
                      ? "Correct! You found a key piece of evidence."
                      : "Not quite — but a good detective never gives up."}
                  </p>
                </div>
                <p
                  className={`text-sm leading-relaxed ${
                    selected.correct ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  {selected.feedback}
                </p>

                {/* Rewind option for wrong answers */}
                {!selected.correct && feedbackPhase === "feedback" && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    onClick={handleRetry}
                    className="mt-3 px-4 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Rewind & Try Again
                  </motion.button>
                )}

                {selected.correct && (
                  <div className="mt-3 rounded-xl bg-white/60 border border-emerald-200 p-3">
                    <p className="text-xs font-semibold text-emerald-700 mb-1 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5" />
                      Clue Unlocked
                    </p>
                    <p className="text-sm text-emerald-800">
                      {currentScene.clueUnlocked?.description}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue Button */}
        {showResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
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
              className="w-full py-3.5 rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
            >
              {isCaseComplete() ? (
                <>
                  View Investigation Results
                  <CheckCircle2 className="w-5 h-5" />
                </>
              ) : (
                <>
                  Continue Investigation
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </motion.div>
        )}
      </motion.div>
    </>
  );
}
