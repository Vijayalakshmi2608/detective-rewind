import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import { useGame } from "@/lib/gameContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Lock,
  MapPin,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function ReadingScene() {
  const navigate = useNavigate();
  const { state, answerQuestion, advanceScene } = useGame();
  const { currentScene, currentSceneIndex, totalScenes, answeredQuestions } =
    state;

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const alreadyAnswered = answeredQuestions[currentScene.id];

  const handleAnswer = (optionId: string, correct: boolean) => {
    if (alreadyAnswered || selectedOption) return;
    setSelectedOption(optionId);
    setIsCorrect(correct);
    setShowFeedback(true);
    answerQuestion(currentScene.id, optionId, correct);
  };

  const handleContinue = () => {
    if (currentSceneIndex < totalScenes - 1) {
      advanceScene();
      navigate("/reading");
    } else {
      navigate("/clues");
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f7f4] pb-24">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScene.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <header className="px-5 pt-6 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Scene {currentSceneIndex + 1} of {totalScenes}
                </p>
                <h1 className="mt-1 text-xl font-bold tracking-tight text-foreground">
                  {currentScene.title}
                </h1>
              </div>
              <Badge
                variant="secondary"
                className="gap-1 text-xs font-semibold"
              >
                <MapPin className="h-3 w-3" />
                {currentScene.location}
              </Badge>
            </div>
          </header>

          <div className="space-y-4 px-5">
            {/* Scene Illustration Card */}
            <motion.div {...fadeUp}>
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-lg">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute left-4 top-4 text-6xl">
                    {currentScene.locationIcon}
                  </div>
                  <div className="absolute bottom-4 right-4 text-4xl rotate-12">
                    🔎
                  </div>
                </div>
                <div className="relative z-10">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
                      Investigation Report
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-white/90">
                    {currentScene.passage}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Witness Card */}
            {currentScene.witnessName && currentScene.witnessName !== "Detective" && (
              <motion.div
                {...fadeUp}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-0 bg-white shadow-sm">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                        {currentScene.witnessName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {currentScene.witnessName}
                        </p>
                        <p className="text-xs font-medium text-primary">
                          {currentScene.witnessRole}
                        </p>
                      </div>
                    </div>
                    <div className="relative rounded-xl bg-muted/50 p-4">
                      <div className="absolute -left-1 -top-1 text-2xl text-muted-foreground/30">
                        "
                      </div>
                      <p className="pl-3 text-sm italic leading-relaxed text-muted-foreground">
                        {currentScene.witnessStatement}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Question */}
            <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
              <Card className="border-0 bg-white shadow-sm">
                <CardContent className="p-5">
                  <div className="mb-4 flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <p className="text-sm font-bold leading-snug text-foreground">
                      {currentScene.question}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {currentScene.options.map((option: { id: string; text: string; correct: boolean; feedback: string }) => {
                      const isSelected = selectedOption === option.id;
                      const showResult =
                        alreadyAnswered || (showFeedback && isSelected);

                      return (
                        <button
                          key={option.id}
                          onClick={() =>
                            handleAnswer(option.id, option.correct)
                          }
                          disabled={!!alreadyAnswered || (!!selectedOption && !isSelected)}
                          className={cn(
                            "w-full rounded-xl border-2 p-4 text-left text-sm font-medium transition-all duration-200",
                            !showResult && !alreadyAnswered &&
                              "border-border/60 bg-white hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98]",
                            showResult && option.correct &&
                              "border-emerald-300 bg-emerald-50 text-emerald-800",
                            showResult && !option.correct && isSelected &&
                              "border-red-200 bg-red-50 text-red-800",
                            showResult && !option.correct && !isSelected &&
                              "border-border/30 bg-muted/30 opacity-50",
                            alreadyAnswered && !isSelected && "opacity-50",
                          )}
                        >
                          <span className="flex items-center gap-3">
                            <span
                              className={cn(
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                                showResult && option.correct
                                  ? "bg-emerald-500 text-white"
                                  : showResult && isSelected
                                    ? "bg-red-500 text-white"
                                    : "bg-muted text-muted-foreground",
                              )}
                            >
                              {showResult && option.correct ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : showResult && isSelected ? (
                                "✕"
                              ) : (
                                option.id.toUpperCase()
                              )}
                            </span>
                            <span>{option.text}</span>
                          </span>
                          {showResult && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="mt-2 pl-10 text-xs leading-relaxed text-muted-foreground"
                            >
                              {option.feedback}
                            </motion.p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Clue Unlocked */}
            {showFeedback && isCorrect && currentScene.clueUnlocked && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 p-5">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">
                      {currentScene.clueUnlocked.icon}
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-primary">
                        Clue Unlocked!
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {currentScene.clueUnlocked.name}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        {currentScene.clueUnlocked.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Continue Button */}
            {(showFeedback || alreadyAnswered) && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {currentSceneIndex < totalScenes - 1 ? (
                  <Button
                    onClick={handleContinue}
                    size="lg"
                    className="w-full h-13 rounded-2xl text-sm font-semibold"
                  >
                    Next Scene
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => navigate("/clues")}
                    size="lg"
                    className="w-full h-13 rounded-2xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Review Clue Board
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </motion.div>
            )}

            {/* Locked Scenes Preview */}
            {currentSceneIndex < totalScenes - 1 && !showFeedback && !alreadyAnswered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  <span>Answer to unlock the next scene</span>
                </div>
              </motion.div>
            )}

            {/* Vocabulary */}
            {currentScene.vocabulary.length > 0 && (
              <motion.div
                {...fadeUp}
                transition={{ delay: 0.25 }}
              >
                <Card className="border-0 bg-white shadow-sm">
                  <CardContent className="p-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      📖 New Words
                    </p>
                    <div className="space-y-2">
                      {currentScene.vocabulary.map((v: { word: string; definition: string }) => (
                        <div
                          key={v.word}
                          className="rounded-lg bg-muted/40 px-3 py-2"
                        >
                          <p className="text-sm font-semibold text-foreground">
                            {v.word}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {v.definition}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
