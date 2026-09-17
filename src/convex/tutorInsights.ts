import { v } from "convex/values";
import { action } from "./_generated/server";

// ─── AI Reading Feedback — real reasoning evaluation via Nemotron ────

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
};

type ReasoningEval = {
  understanding: string; // what the learner's answer shows they understood
  reasoningQuality: string; // quality of the reasoning path
  nextStep: string; // concrete next step
  connectsToReading: string; // how reading/fluency relates to comprehension
  confidence: "high" | "medium" | "low";
};

const SYSTEM_PROMPT = `You are a warm, expert reading tutor inside "Detective Rewind", a reading-mystery game for children ages 7-10. You receive a child's REAL session data (their answer, whether it was correct, optionally oral-reading fluency metrics from speech recognition).

Analyze ONLY what the data shows. Never invent abilities or scores. If data is thin, lower your confidence and say what's uncertain. Encourage a young reader honestly.

Return ONLY valid JSON with keys: understanding, reasoningQuality, nextStep, connectsToReading, confidence ("high"|"medium"|"low"). Keep each string under 30 words, warm and specific to the data.`;

async function callNemotron(
  prompt: string,
  apiKey: string,
): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://detective-rewind.app",
      "X-Title": "Detective Rewind Tutor",
    },
    body: JSON.stringify({
      model: "nvidia/nemotron-3-super-120b-a12b:free",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      // Nemotron reasoning models spend tokens thinking before answering;
      // too small a budget yields an empty completion
      max_tokens: 2000,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

function buildPrompt(input: ReasoningEvalInput): string {
  const { readingMetrics } = input;
  const readingLine = readingMetrics
    ? `\nOral reading (from speech recognition): ${readingMetrics.wcpm ?? "?"} words-correct per minute, ${readingMetrics.accuracyPct ?? "?"}% word accuracy, ${readingMetrics.selfCorrections ?? 0} self-corrections, read for ${readingMetrics.durationSec ?? "?"} seconds.`
    : "\nOral reading: not captured for this scene.";

  return `Analyze this learner's detective investigation step.

Case: "${input.caseTitle}" — Scene: ${input.sceneLocation}

Witness statement (what they read aloud):
"${input.witnessStatement}"

Question asked: "${input.question}"
Their answer: "${input.chosenAnswer}"
Correct answer: "${input.correctAnswer}"
Was correct: ${input.wasCorrect}${readingLine}

Evaluate their REASONING based on what their answer reveals. If they were wrong, identify the likely misunderstanding WITHOUT giving away the answer. If reading metrics exist, connect fluency to comprehension where the data supports it.

Return JSON: { "understanding": string, "reasoningQuality": string, "nextStep": string, "connectsToReading": string, "confidence": "high"|"medium"|"low" }`;
}

// Robust JSON extraction for reasoning models (<think> blocks, prose,
// doubled braces — all observed with Nemotron)
function parseModelJson<T>(text: string): T | null {
  const cleaned = text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();

  const matchBraces = (start: number): string | null => {
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = start; i < cleaned.length; i++) {
      const ch = cleaned[i];
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = !inString;
      } else if (!inString) {
        if (ch === "{") depth++;
        else if (ch === "}") {
          depth--;
          if (depth === 0) return cleaned.slice(start, i + 1);
        }
      }
    }
    return null;
  };

  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === "{") {
      const candidate = matchBraces(i);
      if (candidate) {
        try {
          return JSON.parse(candidate) as T;
        } catch {
          // scan next '{'
        }
      }
    }
  }
  return null;
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
  },
  handler: async (_ctx, args): Promise<ReasoningEval> => {
    const apiKey = process.env.OPENROUTER_API_KEY?.trim().replace(
      /^["']|["']$/g,
      "",
    );

    if (!apiKey) {
      // Honest fallback — clearly labeled as non-AI, stats-based
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

    try {
      const raw = await callNemotron(buildPrompt(args), apiKey);
      console.log(
        "[evaluateReasoning] raw output (first 400):",
        raw.slice(0, 400),
      );
      const parsed = parseModelJson<ReasoningEval>(raw);

      if (parsed) {
        return {
          understanding:
            parsed.understanding || "Unable to assess understanding.",
          reasoningQuality:
            parsed.reasoningQuality || "Unable to assess reasoning.",
          nextStep: parsed.nextStep || "Continue to the next scene.",
          connectsToReading:
            parsed.connectsToReading || "Keep reading aloud to build fluency.",
          confidence: parsed.confidence || "low",
        };
      }

      // Model returned unparseable output — say so honestly
      return {
        understanding:
          args.wasCorrect
            ? "Your answer shows you understood the statement."
            : "The key detail was missed this time — re-reading will help.",
        reasoningQuality: "AI analysis was unavailable for this answer.",
        nextStep: args.wasCorrect
          ? "Continue investigating the next scene."
          : "Use Rewind to try again with support.",
        connectsToReading: readingMetricsFallbackLine(args.readingMetrics),
        confidence: "low",
      };
    } catch {
      return {
        understanding: "AI feedback is temporarily unavailable.",
        reasoningQuality: "Your answer was recorded and scored normally.",
        nextStep: args.wasCorrect
          ? "Continue to the next scene."
          : "Use Rewind to try again with support.",
        connectsToReading: readingMetricsFallbackLine(args.readingMetrics),
        confidence: "low",
      };
    }
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
        const skill = a.questionType;
        if (!acc[skill]) acc[skill] = { total: 0, correct: 0 };
        acc[skill].total++;
        if (a.correct) acc[skill].correct++;
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
Total attempts: ${totalAttempts}
First-try correct: ${correctCount}/${totalAttempts} (${Math.round((correctCount / totalAttempts) * 100)}%)
Rewind interventions applied: ${rewindCount}
Retry attempts: ${retryAttempts.length}
Retry correct: ${retryCorrect}/${retryAttempts.length}
Improvements after Rewind: ${improvements}/${retryResults.length}

Skill Breakdown:
${skillReport}

Session Sequence (chronological):
${attempts.map((a, i) => `${i + 1}. [${a.questionType}] Scene ${a.sceneId} — ${a.correct ? "✓ correct" : "✗ incorrect"}${a.wasRewindRetry ? " (rewind retry)" : ""}${a.rewindApplied ? " (rewind applied)" : ""}`).join("\n")}

Return JSON with these fields:
{
  "strength": "The child's strongest demonstrated reading skill, based on data",
  "primarySkillToPractice": "The skill area with lowest performance that needs focused practice",
  "observedDifficulty": "A specific difficulty pattern observed (e.g., causal inference, vocabulary in context)",
  "evidence": "Direct evidence from the session data supporting the assessment",
  "interventionUsed": "Summary of what intervention was applied (e.g., 'Rewind with targeted hint on scene-2')",
  "learnerResponse": "How the learner responded to the intervention (e.g., 'Corrected on 1/2 retry attempts')",
  "recommendedNextActivity": "A specific recommended activity based on the weakness pattern",
  "confidence": "high | medium | low — based on how much data is available",
  "reasoning": "Brief explanation of how the recommendation was derived"
}`;
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
  },
  handler: async (_ctx, args): Promise<TutorCard> => {
    const apiKey = process.env.OPENROUTER_API_KEY?.trim().replace(
      /^["']|["']$/g,
      "",
    );

    if (!apiKey) {
      const totalAttempts = args.attempts.length;
      const correctCount = args.attempts.filter((a) => a.correct).length;
      const accuracy =
        totalAttempts > 0
          ? Math.round((correctCount / totalAttempts) * 100)
          : 0;
      const improvements = args.retryResults.filter((r) => r.improvement).length;

      return {
        strength:
          accuracy >= 60
            ? "Demonstrated solid comprehension when given sufficient reading time"
            : "Showed persistence through multiple attempts at understanding the material",
        primarySkillToPractice: "Inference-based reasoning from textual evidence",
        observedDifficulty:
          "Distinguishing between directly stated information and inferred conclusions",
        evidence: `${correctCount}/${totalAttempts} first-try correct (${accuracy}%). ${improvements} improvement${improvements !== 1 ? "s" : ""} after Rewind intervention.`,
        interventionUsed: `${args.retryResults.length} Rewind intervention(s) applied with targeted hints`,
        learnerResponse:
          improvements > 0
            ? `Improved on ${improvements}/${args.retryResults.length} retry attempt(s), showing the ability to benefit from guided re-reading`
            : `Retry attempts did not show improvement — may need different scaffolding strategy`,
        recommendedNextActivity:
          "A carefully controlled inference task with visual text highlighting and a simpler evidence set to build confidence",
        confidence: totalAttempts >= 4 ? "medium" : "low",
        reasoning: `Generated from ${totalAttempts} attempt(s). ${totalAttempts < 4 ? "Limited data — this assessment is provisional." : "Moderate data available."} Skill breakdown suggests comprehension is ${accuracy >= 70 ? "developing well" : "still emerging"}.`,
      };
    }

    const raw = await callNemotron(buildTutorPrompt(args), apiKey);
    const parsed = parseModelJson<TutorCard>(raw);

    if (parsed) {
      return {
        strength: parsed.strength || "Insufficient data to determine",
        primarySkillToPractice:
          parsed.primarySkillToPractice || "Insufficient data",
        observedDifficulty: parsed.observedDifficulty || "Insufficient data",
        evidence: parsed.evidence || "No evidence available",
        interventionUsed: parsed.interventionUsed || "No interventions applied",
        learnerResponse: parsed.learnerResponse || "No retry data available",
        recommendedNextActivity:
          parsed.recommendedNextActivity ||
          "Continue with standard reading practice",
        confidence: parsed.confidence || "low",
        reasoning: parsed.reasoning || "AI-generated assessment",
      };
    }

    return {
      strength: "AI response could not be parsed",
      primarySkillToPractice: "Unable to determine — review session manually",
      observedDifficulty: "AI analysis unavailable",
      evidence: `Session stats: ${args.attempts.length} attempts, ${args.retryResults.length} retries`,
      interventionUsed: `${args.retryResults.length} Rewind(s) applied`,
      learnerResponse: "Could not parse AI analysis",
      recommendedNextActivity:
        "Review the session manually to determine next steps",
      confidence: "low",
      reasoning: "OpenRouter response was not valid JSON",
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
