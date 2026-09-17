import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../lib/gameContext";
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import {
  Brain,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Loader2,
  BookOpen,
  Target,
  Lightbulb,
  TrendingUp,
} from "lucide-react";

type TutorCard = {
  strength: string;
  primarySkillToPractice: string;
  observedDifficulty: string;
  evidence: string;
  interventionUsed: string;
  learnerResponse: string;
  recommendedNextActivity: string;
  confidence: "high" | "medium" | "low";
  reasoning: string;
};

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
};

export default function TutorInsights() {
  const { state } = useGame();
  const { attemptHistory, retryResults, currentCase } = state;

  const generateCard = useAction(api.tutorInsights.generateTutorCard);
  const [card, setCard] = useState<TutorCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasData = attemptHistory.length > 0;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateCard({
        attempts: attemptHistory.map((a) => ({
          sceneId: a.sceneId,
          questionType: a.questionType,
          correct: a.correct,
          wasRewindRetry: a.wasRewindRetry,
          rewindApplied: a.rewindApplied,
        })),
        retryResults: retryResults.map((r) => ({
          originalCorrect: r.originalCorrect,
          retryCorrect: r.retryCorrect,
          improvement: r.improvement,
        })),
        caseName: currentCase.title,
        totalScenes: currentCase.scenes.length,
        cluesFound: state.cluesFound.length,
        readAloudCount: state.readAloudCount,
      });
      setCard(result as unknown as TutorCard);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate tutor card",
      );
    } finally {
      setLoading(false);
    }
  };

  const confidenceColors = {
    high: "bg-emerald-100 text-emerald-700 border-emerald-200/60",
    medium: "bg-gold/10 text-gold border-gold/20",
    low: "bg-secondary text-muted-foreground border-border/60",
  };

  const totalAttempts = attemptHistory.length;
  const correctCount = attemptHistory.filter((a) => a.correct).length;
  const rewindCount = retryResults.length;
  const improvementCount = retryResults.filter((r) => r.improvement).length;
  const accuracy =
    totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;

  return (
    <main className="min-h-screen bg-background pb-28">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-8 sm:pt-10">
        {/* Header */}
        <motion.div {...fadeUp}>
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-foreground flex items-center justify-center shadow-elevated">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-foreground tracking-tight font-display">
                Tutor Insights
              </h1>
              <p className="text-[13px] text-muted-foreground">
                AI-powered analysis of this investigation session
              </p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-5">
          {/* Session Summary */}
          <motion.div {...fadeUp} transition={{ delay: 0.06 }}>
            <div className="rounded-2xl bg-card shadow-card border border-border/40 p-5 sm:p-6">
              <h2 className="text-[10px] font-bold text-muted-foreground mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-gold" />
                Session Summary
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                  label="Accuracy"
                  value={`${accuracy}%`}
                  icon={<Target className="w-4 h-4" />}
                />
                <StatCard
                  label="Attempts"
                  value={`${totalAttempts}`}
                  icon={<BookOpen className="w-4 h-4" />}
                />
                <StatCard
                  label="Rewinds"
                  value={`${rewindCount}`}
                  icon={<Lightbulb className="w-4 h-4" />}
                />
                <StatCard
                  label="Improved"
                  value={`${improvementCount}/${rewindCount}`}
                  icon={<TrendingUp className="w-4 h-4" />}
                />
              </div>
            </div>
          </motion.div>

          {/* Generate Button */}
          {!card && (
            <motion.div {...fadeUp} transition={{ delay: 0.12 }}>
              <motion.button
                onClick={handleGenerate}
                disabled={loading || !hasData}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-foreground text-primary-foreground font-bold text-sm hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-3 shadow-elevated disabled:opacity-40 disabled:cursor-not-allowed hover:translate-y-[-1px] active:translate-y-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing session data...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-gold" />
                    Generate Tutor Action Card
                  </>
                )}
              </motion.button>
            </motion.div>
          )}

          {!hasData && (
            <div className="rounded-2xl bg-amber-50/50 border border-amber-200/60 p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-800">
                  No session data yet
                </p>
                <p className="text-[13px] text-amber-600/80 mt-1">
                  Complete at least one reading scene to generate tutor insights.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-2xl bg-red-50/50 border border-red-200/60 p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-800">
                  Generation failed
                </p>
                <p className="text-[13px] text-red-600/80 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* AI Tutor Action Card */}
          <AnimatePresence>
            {card && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16 }}
                className="rounded-2xl bg-card shadow-elevated border border-border/40 overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-primary to-foreground px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-primary-foreground">
                      <Brain className="w-5 h-5" />
                      <h3 className="font-extrabold font-display tracking-tight">
                        AI Tutor Action Card
                      </h3>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${confidenceColors[card.confidence]}`}
                    >
                      {card.confidence} confidence
                    </span>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  <CardSection
                    title="Strength"
                    icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    content={card.strength}
                    bgColor="bg-emerald-50/50"
                    borderColor="border-emerald-200/40"
                  />

                  <CardSection
                    title="Primary Skill Needing Practice"
                    icon={<Target className="w-4 h-4 text-gold" />}
                    content={card.primarySkillToPractice}
                    bgColor="bg-gold/5"
                    borderColor="border-gold/15"
                  />

                  <CardSection
                    title="Observed Difficulty"
                    icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
                    content={card.observedDifficulty}
                    bgColor="bg-amber-50/50"
                    borderColor="border-amber-200/40"
                  />

                  <CardSection
                    title="Evidence from Session"
                    icon={<BookOpen className="w-4 h-4 text-primary" />}
                    content={card.evidence}
                    bgColor="bg-primary/5"
                    borderColor="border-primary/10"
                  />

                  <CardSection
                    title="Intervention Applied"
                    icon={<Lightbulb className="w-4 h-4 text-violet-500" />}
                    content={card.interventionUsed}
                    bgColor="bg-violet-50/50"
                    borderColor="border-violet-200/40"
                  />

                  <CardSection
                    title="Learner's Response"
                    icon={<TrendingUp className="w-4 h-4 text-blue-500" />}
                    content={card.learnerResponse}
                    bgColor="bg-blue-50/50"
                    borderColor="border-blue-200/40"
                  />

                  {/* Recommended Next Activity */}
                  <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowRight className="w-4 h-4 text-primary" />
                      <p className="text-[10px] font-bold text-primary uppercase tracking-[0.15em]">
                        Recommended Next Activity
                      </p>
                    </div>
                    <p className="text-[13px] text-foreground/80 leading-relaxed font-semibold">
                      {card.recommendedNextActivity}
                    </p>
                  </div>

                  {/* Reasoning */}
                  <div className="rounded-xl bg-secondary/50 border border-border/40 p-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-1">
                      AI Reasoning
                    </p>
                    <p className="text-[12px] text-muted-foreground leading-relaxed italic">
                      {card.reasoning}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Regenerate */}
          {card && (
            <motion.button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl border-2 border-border/60 text-foreground font-semibold text-sm hover:bg-secondary transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-gold" />
              )}
              Regenerate with latest data
            </motion.button>
          )}
        </div>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-secondary/50 border border-border/40 p-3.5 text-center">
      <div className="w-8 h-8 rounded-lg bg-card border border-border/40 flex items-center justify-center mx-auto mb-1.5 text-primary">
        {icon}
      </div>
      <p className="text-lg font-extrabold text-foreground tracking-tight">{value}</p>
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
  );
}

function CardSection({
  title,
  icon,
  content,
  bgColor,
  borderColor,
}: {
  title: string;
  icon: React.ReactNode;
  content: string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <div className={`rounded-xl ${bgColor} border ${borderColor} p-4`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-[10px] font-bold text-foreground/70 uppercase tracking-[0.15em]">
          {title}
        </p>
      </div>
      <p className="text-[13px] text-foreground/80 leading-relaxed">{content}</p>
    </div>
  );
}
