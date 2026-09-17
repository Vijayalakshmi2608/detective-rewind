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

export default function TutorInsights() {
  const { state } = useGame();
  const { attemptHistory, retryResults, learnerModel, currentCase } = state;

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
    high: "bg-emerald-100 text-emerald-700 border-emerald-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    low: "bg-slate-100 text-slate-600 border-slate-200",
  };

  // Quick stats from real data
  const totalAttempts = attemptHistory.length;
  const correctCount = attemptHistory.filter((a) => a.correct).length;
  const rewindCount = retryResults.length;
  const improvementCount = retryResults.filter((r) => r.improvement).length;
  const accuracy =
    totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 font-display">
            Tutor Insights
          </h1>
          <p className="text-sm text-slate-500">
            AI-powered analysis of this investigation session
          </p>
        </div>
      </div>

      {/* Session Summary from real data */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-500" />
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

      {/* Generate Button */}
      {!card && (
        <motion.button
          onClick={handleGenerate}
          disabled={loading || !hasData}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold hover:from-indigo-700 hover:to-violet-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing session data...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Tutor Action Card
            </>
          )}
        </motion.button>
      )}

      {!hasData && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              No session data yet
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Complete at least one reading scene to generate tutor insights.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">
              Generation failed
            </p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* AI Tutor Action Card */}
      <AnimatePresence>
        {card && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-2xl bg-white shadow-lg border border-slate-200 overflow-hidden"
          >
            {/* Card Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <Brain className="w-5 h-5" />
                  <h3 className="font-semibold font-display">
                    AI Tutor Action Card
                  </h3>
                </div>
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border ${confidenceColors[card.confidence]}`}
                >
                  {card.confidence} confidence
                </span>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Strength */}
              <CardSection
                title="Strength"
                icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                content={card.strength}
                bgColor="bg-emerald-50"
              />

              {/* Primary Skill to Practice */}
              <CardSection
                title="Primary Skill Needing Practice"
                icon={<Target className="w-4 h-4 text-amber-500" />}
                content={card.primarySkillToPractice}
                bgColor="bg-amber-50"
              />

              {/* Observed Difficulty */}
              <CardSection
                title="Observed Difficulty"
                icon={<AlertTriangle className="w-4 h-4 text-orange-500" />}
                content={card.observedDifficulty}
                bgColor="bg-orange-50"
              />

              {/* Evidence */}
              <CardSection
                title="Evidence from Session"
                icon={<BookOpen className="w-4 h-4 text-indigo-500" />}
                content={card.evidence}
                bgColor="bg-indigo-50"
              />

              {/* Intervention Used */}
              <CardSection
                title="Intervention Applied"
                icon={<Lightbulb className="w-4 h-4 text-violet-500" />}
                content={card.interventionUsed}
                bgColor="bg-violet-50"
              />

              {/* Learner Response */}
              <CardSection
                title="Learner's Response"
                icon={<TrendingUp className="w-4 h-4 text-blue-500" />}
                content={card.learnerResponse}
                bgColor="bg-blue-50"
              />

              {/* Recommended Next Activity */}
              <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowRight className="w-4 h-4 text-indigo-600" />
                  <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                    Recommended Next Activity
                  </p>
                </div>
                <p className="text-sm text-indigo-900 leading-relaxed font-medium">
                  {card.recommendedNextActivity}
                </p>
              </div>

              {/* Reasoning */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  AI Reasoning
                </p>
                <p className="text-xs text-slate-600 leading-relaxed italic">
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
          className="w-full py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Regenerate with latest data
        </motion.button>
      )}
    </motion.div>
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
    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center">
      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center mx-auto mb-1.5 text-indigo-500">
        {icon}
      </div>
      <p className="text-lg font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function CardSection({
  title,
  icon,
  content,
  bgColor,
}: {
  title: string;
  icon: React.ReactNode;
  content: string;
  bgColor: string;
}) {
  return (
    <div className={`rounded-xl ${bgColor} border border-slate-200/50 p-4`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {title}
        </p>
      </div>
      <p className="text-sm text-slate-800 leading-relaxed">{content}</p>
    </div>
  );
}
