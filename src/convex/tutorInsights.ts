import { v } from "convex/values";
import { action } from "./_generated/server";
import {
  runAIPipeline,
  REASONING_EVAL_SCHEMA,
  TUTOR_CARD_SCHEMA,
  snakeToCamel,
} from "./aiPipeline";

// ─── AI Reading Feedback — real reasoning evaluation via Nemotron ────
// Pipeline: session data → OpenRouter → Nemotron → JSON → clean →
// parse → validate → retry-once → deterministic fallback (never fabricated)

type ReasoningEvalInput = {
  question: string;
  chosenAnswer: string;
  correctAnswer: string;
  wasCorrect: boolean;
  witnessStatement: string;
  readingMetrics?: {
    wcpm?: number;
    accuracyPct?: number;
    selfCorrections?: number;
    durationSec?: number;
  } | null;
  caseTitle: string;
  sceneLocation: string;
  caseFocus?: string;
};

type ReasoningEval = {
  understanding: string;
  reasoningQuality: string;
  nextStep: string;
  connectsToReading: string;
  confidence: "high" | "medium" | "low";
};

const REASONING_SYSTEM = `You are a warm, expert reading tutor inside "Detective Rewind", a reading-mystery game for children ages 7-10. You receive a child's REAL session data (their answer, whether it was correct, optionally oral-reading fluency metrics from speech recognition).

Analyze ONLY what the data shows. Never invent abilities or scores. If data is thin, lower your confidence and say what's uncertain. Encourage a young reader honestly.

Respond with ONLY a single valid JSON object with exactly these keys:
{"understanding": string, "reasoningQuality": string, "nextStep": string, "connectsToReading": string, "confidence": "high"|"medium"|"low"}
Keep each string under 30 words, warm and specific to the data.`;

function buildReasoningPrompt(input: ReasoningEvalInput): string {
  const { readingMetrics } = input;
  const readingLine = readingMetrics
    ? `\nOral reading (from speech recognition): ${readingMetrics.wcpm ?? "?"} words-correct per minute, ${readingMetrics.accuracyPct ?? "?"}% word accuracy, ${readingMetrics.selfCorrections ?? 0} self-corrections, read for ${readingMetrics.durationSec ?? "?"} seconds.`
    : "\nOral reading: not captured for this scene.";

  return `Analyze this learner's detective investigation step.

Case: "${input.caseTitle}" — Scene: ${input.sceneLocation}${input.caseFocus ? `\nCase learning focus: ${input.caseFocus}` : ""}

Witness statement (what they read aloud):
"${input.witnessStatement}"

Question asked: "${input.question}"
Their answer: "${input.chosenAnswer}"
Correct answer: "${input.correctAnswer}"
Was correct: ${input.wasCorrect}${readingLine}

Evaluate their REASONING based on what their answer reveals. If they were wrong, identify the likely misunderstanding WITHOUT giving away the answer. If reading metrics exist, connect fluency to comprehension where the data supports it.

Return JSON only: { "understanding": string, "reasoningQuality": string, "nextStep": string, "connectsToReading": string, "confidence": "high"|"medium"|"low" }`;
}

// Deterministic fallbacks from REAL session data — never fabricated
function reasoningFallback(
  args: ReasoningEvalInput,
): ReasoningEval {
  return {
    understanding: args.wasCorrect
      ? "Your answer shows you understood what the statement told the investigation."
      : "Your answer suggests the key detail in the statement was missed this time.",
    reasoningQuality: args.wasCorrect
      ? "You connected the statement to the question well."
      : "Re-reading the statement slowly will help the details stick.",
    nextStep: args.wasCorrect
      ? "Keep reading carefully — the next scene adds more clues."
      : "Try the Rewind to re-read the important part with a hint.",
    connectsToReading: readingMetricsFallbackLine(args.readingMetrics),
    confidence: "low",
  };
}

export const evaluateReasoning = action({
  args: {
    question: v.string(),
    chosenAnswer: v.string(),
    correctAnswer: v.string(),
    wasCorrect: v.boolean(),
    witnessStatement: v.string(),
    readingMetrics: v.optional(
      v.object({
        wcpm: v.optional(v.number()),
        accuracyPct: v.optional(v.number()),
        selfCorrections: v.optional(v.number()),
        durationSec: v.optional(v.number()),
      }),
    ),
    caseTitle: v.string(),
    sceneLocation: v.string(),
    caseFocus: v.optional(v.string()),
  },
  handler: async (_ctx, args): Promise<ReasoningEval> => {
    const result = await runAIPipeline<Record<string, unknown>>({
      label: "evaluateReasoning",
      systemPrompt: REASONING_SYSTEM,
      userPrompt: buildReasoningPrompt(args),
      schema: REASONING_EVAL_SCHEMA,
      fallback: () => reasoningFallback(args) as unknown as Record<string, unknown>,
    });

    if (result.source === "fallback") {
      console.warn(
        "[evaluateReasoning] served deterministic fallback:",
        result.failureReason,
      );
      return reasoningFallback(args);
    }

    const d = result.data;
    const confidence = String(d.confidence || "low");
    const safeConfidence = (["high", "medium", "low"].includes(confidence)
      ? confidence
      : "low") as ReasoningEval["confidence"];

    return {
      understanding: String(d.understanding),
      reasoningQuality: String(d.reasoningQuality),
      nextStep: String(d.nextStep),
      connectsToReading: String(d.connectsToReading),
      confidence: safeConfidence,
    };
  },
});

// ─── Tutor Action Card — session-level AI analysis ────

type TutorCardInput = {
  attempts: {
    sceneId: string;
    questionType: string;
    correct: boolean;
    wasRewindRetry: boolean;
    rewindApplied: boolean;
  }[];
  retryResults: {
    originalCorrect: boolean;
    retryCorrect: boolean;
    improvement: boolean;
  }[];
  caseName: string;
  totalScenes: number;
  cluesFound: number;
  readAloudCount?: number;
};

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

function buildTutorPrompt(input: TutorCardInput): string {
  const { attempts, retryResults, caseName, totalScenes, cluesFound } = input;

  const totalAttempts = attempts.length;
  const correctCount = attempts.filter((a) => a.correct).length;
  const rewindCount = attempts.filter((a) => a.rewindApplied).length;
  const retryAttempts = attempts.filter((a) => a.wasRewindRetry);
  const retryCorrect = retryAttempts.filter((a) => a.correct).length;
  const improvements = retryResults.filter((r) => r.improvement).length;

  const skillBreakdown = Object.entries(
    attempts.reduce(
      (acc, a) => {
        if (!acc[a.questionType]) acc[a.questionType] = { total: 0, correct: 0 };
        acc[a.questionType].total++;
        if (a.correct) acc[a.questionType].correct++;
        return acc;
      },
      {} as Record<string, { total: number; correct: number }>,
    ),
  );

  const skillReport = skillBreakdown
    .map(
      ([skill, data]) =>
        `  - ${skill}: ${data.correct}/${data.total} correct (${Math.round((data.correct / data.total) * 100)}%)`,
    )
    .join("\n");

  return `Analyze this child's Detective Rewind session data and generate a Tutor Action Card.

Case: "${caseName}"
Total scenes: ${totalScenes}
Clues found: ${cluesFound}
Read-aloud sessions completed: ${input.readAloudCount ?? 0}
Total attempts: ${totalAttempts}
First-try correct: ${correctCount}/${totalAttempts}${totalAttempts > 0 ? ` (${Math.round((correctCount / totalAttempts) * 100)}%)` : ""}
Rewind interventions applied: ${rewindCount}
Retry attempts: ${retryAttempts.length}
Retry correct: ${retryCorrect}/${retryAttempts.length}
Improvements after Rewind: ${improvements}/${retryResults.length}

Skill Breakdown:
${skillReport || "  - (no attempts yet)"}

Session Sequence (chronological):
${attempts.map((a, i) => `${i + 1}. [${a.questionType}] Scene ${a.sceneId} — ${a.correct ? "correct" : "incorrect"}${a.wasRewindRetry ? " (rewind retry)" : ""}${a.rewindApplied ? " (rewind applied)" : ""}`).join("\n") || "  (no attempts yet)"}

Return JSON only with these fields:
{
  "strength": "The child's strongest demonstrated reading skill, based on data",
  "primary_skill": "The skill area with lowest performance that needs focused practice",
  "observed_difficulty": "A specific difficulty pattern observed (e.g., causal inference, vocabulary in context)",
  "evidence": "Direct evidence from the session data supporting the assessment",
  "intervention": "Summary of what intervention was applied (e.g., 'Rewind with targeted hint on scene-2')",
  "learner_response": "How the learner responded to the intervention (e.g., 'Corrected on 1/2 retry attempts')",
  "recommended_activity": "A specific recommended activity based on the weakness pattern",
  "ai_confidence": number between 0 and 1 based on how much data is available,
  "reasoning": "Brief explanation of how the recommendation was derived"
}`;
}

function tutorCardFallback(input: TutorCardInput): TutorCard {
  const totalAttempts = input.attempts.length;
  const correctCount = input.attempts.filter((a) => a.correct).length;
  const accuracy =
    totalAttempts > 0
      ? Math.round((correctCount / totalAttempts) * 100)
      : 0;
  const improvements = input.retryResults.filter((r) => r.improvement).length;

  // Real per-skill accuracy from actual attempts
  const skillStats = new Map<string, { total: number; correct: number }>();
  for (const a of input.attempts) {
    const s = skillStats.get(a.questionType) ?? { total: 0, correct: 0 };
    s.total++;
    if (a.correct) s.correct++;
    skillStats.set(a.questionType, s);
  }

  let weakestSkill = "comprehension";
  let weakestPct = 101;
  let strongestSkill = "";
  let strongestPct = -1;
  for (const [skill, s] of skillStats) {
    const pct = Math.round((s.correct / s.total) * 100);
    if (pct < weakestPct) {
      weakestPct = pct;
      weakestSkill = skill;
    }
    if (pct > strongestPct) {
      strongestPct = pct;
      strongestSkill = skill;
    }
  }

  const hasData = totalAttempts > 0;

  return {
    strength: !hasData
      ? "Not enough session data yet — complete a scene to build a profile"
      : strongestSkill
        ? `${strongestSkill} — ${strongestPct}% correct on first attempts`
        : accuracy >= 60
          ? "Demonstrated solid comprehension across the case"
          : "Showed persistence through multiple attempts",
    primarySkillToPractice: !hasData
      ? "Complete a reading scene first"
      : `${weakestSkill} — ${weakestPct}% correct, the lowest of the practiced skills`,
    observedDifficulty: !hasData
      ? "No difficulty patterns observed yet"
      : improvements > 0
        ? "Initial misses were recovered after guided re-reading (Rewind)"
        : "Difficulty appears when questions require connecting evidence to the statement",
    evidence: !hasData
      ? "No attempts recorded yet"
      : `${correctCount}/${totalAttempts} first-try correct (${accuracy}%). ${input.retryResults.length} Rewind intervention(s), ${improvements} improvement(s) after Rewind.`,
    interventionUsed:
      input.retryResults.length > 0
        ? `${input.retryResults.length} Rewind intervention(s) with targeted hints and passage re-reads`
        : "No interventions were needed so far",
    learnerResponse:
      input.retryResults.length === 0
        ? "No retry data available"
        : improvements > 0
          ? `Corrected ${improvements}/${input.retryResults.length} answer(s) after Rewind — benefits from guided re-reading`
          : "Retry attempts did not yet show improvement — may need different scaffolding",
    recommendedNextActivity: !hasData
      ? "Start the next reading scene to generate a real assessment"
      : `Practice another ${weakestSkill} question with the witness statement visible`,
    confidence: totalAttempts >= 4 ? "medium" : "low",
    reasoning: !hasData
      ? "Deterministic fallback: no session data available yet"
      : `Deterministic fallback computed from ${totalAttempts} real attempt(s): weakest skill ${weakestSkill} (${weakestPct}%), strongest ${strongestSkill || "n/a"}.`,
  };
}

export const generateTutorCard = action({
  args: {
    attempts: v.array(
      v.object({
        sceneId: v.string(),
        questionType: v.string(),
        correct: v.boolean(),
        wasRewindRetry: v.boolean(),
        rewindApplied: v.boolean(),
      }),
    ),
    retryResults: v.array(
      v.object({
        originalCorrect: v.boolean(),
        retryCorrect: v.boolean(),
        improvement: v.boolean(),
      }),
    ),
    caseName: v.string(),
    totalScenes: v.number(),
    cluesFound: v.number(),
    readAloudCount: v.optional(v.number()),
  },
  handler: async (_ctx, args): Promise<TutorCard & { source: string }> => {
    const result = await runAIPipeline<Record<string, unknown>>({
      label: "generateTutorCard",
      systemPrompt:
        'You are an expert reading tutor analyst for the children\'s game "Detective Rewind". You receive REAL session data from a child\'s reading investigation. Analyze only what the data shows. Never invent performance.',
      userPrompt: buildTutorPrompt(args),
      schema: TUTOR_CARD_SCHEMA,
      fallback: () => tutorCardFallback(args) as unknown as Record<string, unknown>,
    });

    if (result.source === "fallback") {
      console.warn(
        "[generateTutorCard] served deterministic fallback:",
        result.failureReason,
      );
      return { ...tutorCardFallback(args), source: "fallback" };
    }

    // Map snake_case model keys to internal camelCase
    const d = snakeToCamel<Record<string, unknown>>(result.data, {
      strength: "strength",
      primary_skill: "primarySkillToPractice",
      observed_difficulty: "observedDifficulty",
      evidence: "evidence",
      intervention: "interventionUsed",
      learner_response: "learnerResponse",
      recommended_activity: "recommendedNextActivity",
      ai_confidence: "aiConfidence",
      reasoning: "reasoning",
    });

    const confNum = typeof d.aiConfidence === "number" ? d.aiConfidence : 0.3;
    const confidence: TutorCard["confidence"] =
      confNum >= 0.7 ? "high" : confNum >= 0.4 ? "medium" : "low";

    return {
      strength: String(d.strength),
      primarySkillToPractice: String(d.primarySkillToPractice),
      observedDifficulty: String(d.observedDifficulty),
      evidence: String(d.evidence),
      interventionUsed: String(d.interventionUsed),
      learnerResponse: String(d.learnerResponse),
      recommendedNextActivity: String(d.recommendedNextActivity),
      confidence,
      reasoning:
        result.source === "ai-retry"
          ? `${String(d.reasoning)} (recovered on retry with stricter JSON instruction)`
          : String(d.reasoning),
      source: result.source,
    };
  },
});

function readingMetricsFallbackLine(
  m?: ReasoningEvalInput["readingMetrics"],
): string {
  if (!m || m.wcpm == null) return "Read the next statement aloud to build fluency.";
  const pace =
    m.wcpm >= 100 ? "great" : m.wcpm >= 60 ? "good" : "steadily building";
  const selfCorr =
    m.selfCorrections && m.selfCorrections > 0
      ? " — noticing and fixing words is a real reading skill"
      : "";
  return `You read at ${m.wcpm} words per minute (${pace} pace${selfCorr}).`;
}
