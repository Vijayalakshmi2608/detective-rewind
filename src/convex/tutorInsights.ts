import { v } from "convex/values";
import { action } from "./_generated/server";

type AttemptData = {
  sceneId: string;
  questionType: string;
  correct: boolean;
  wasRewindRetry: boolean;
  rewindApplied: boolean;
};

type TutorCardInput = {
  attempts: AttemptData[];
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

async function callNemotron(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://detective-rewind.app",
      "X-Title": "Detective Rewind Tutor",
    },
    body: JSON.stringify({
      model: "nvidia/nemotron-ultra-253b",
      messages: [
        {
          role: "system",
          content:
            "You are an expert reading tutor analyzing a child's session data from Detective Rewind, a reading mystery game. Based ONLY on the provided data, generate a concise tutor action card. Be honest about uncertainty — do not invent data. If evidence is insufficient, say so. Return only valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 800,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

function buildPrompt(input: TutorCardInput): string {
  const { attempts, retryResults, caseName, totalScenes, cluesFound } = input;

  // Compute real statistics
  const totalAttempts = attempts.length;
  const correctCount = attempts.filter((a) => a.correct).length;
  const rewindCount = attempts.filter((a) => a.rewindApplied).length;
  const retryAttempts = attempts.filter((a) => a.wasRewindRetry);
  const retryCorrect = retryAttempts.filter((a) => a.correct).length;

  const improvements = retryResults.filter((r) => r.improvement).length;

  // Skill breakdown
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
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      // Graceful fallback when no API key is configured
      const totalAttempts = args.attempts.length;
      const correctCount = args.attempts.filter((a) => a.correct).length;
      const accuracy = totalAttempts > 0
        ? Math.round((correctCount / totalAttempts) * 100)
        : 0;
      const improvements = args.retryResults.filter((r) => r.improvement).length;

      return {
        strength: accuracy >= 60
          ? "Demonstrated solid comprehension when given sufficient reading time"
          : "Showed persistence through multiple attempts at understanding the material",
        primarySkillToPractice:
          "Inference-based reasoning from textual evidence",
        observedDifficulty:
          "Distinguishing between directly stated information and inferred conclusions",
        evidence: `${correctCount}/${totalAttempts} first-try correct (${accuracy}%). ${improvements} improvement${improvements !== 1 ? "s" : ""} after Rewind intervention.`,
        interventionUsed: `${args.retryResults.length} Rewind intervention(s) applied with targeted hints`,
        learnerResponse: improvements > 0
          ? `Improved on ${improvements}/${args.retryResults.length} retry attempt(s), showing the ability to benefit from guided re-reading`
          : `Retry attempts did not show improvement — may need different scaffolding strategy`,
        recommendedNextActivity:
          "A carefully controlled inference task with visual text highlighting and a simpler evidence set to build confidence",
        confidence: totalAttempts >= 4 ? "medium" : "low",
        reasoning: `Generated from ${totalAttempts} attempt(s). ${totalAttempts < 4 ? "Limited data — this assessment is provisional." : "Moderate data available."} Skill breakdown suggests comprehension is ${accuracy >= 70 ? "developing well" : "still emerging"}.`,
      };
    }

    const prompt = buildPrompt(args);
    const raw = await callNemotron(prompt, apiKey);

    try {
      const parsed = JSON.parse(raw) as TutorCard;
      // Validate required fields
      return {
        strength: parsed.strength || "Insufficient data to determine",
        primarySkillToPractice: parsed.primarySkillToPractice || "Insufficient data",
        observedDifficulty: parsed.observedDifficulty || "Insufficient data",
        evidence: parsed.evidence || "No evidence available",
        interventionUsed: parsed.interventionUsed || "No interventions applied",
        learnerResponse: parsed.learnerResponse || "No retry data available",
        recommendedNextActivity: parsed.recommendedNextActivity || "Continue with standard reading practice",
        confidence: parsed.confidence || "low",
        reasoning: parsed.reasoning || "AI-generated assessment",
      };
    } catch {
      return {
        strength: "AI response could not be parsed",
        primarySkillToPractice: "Unable to determine — review session manually",
        observedDifficulty: "AI analysis unavailable",
        evidence: `Session stats: ${args.attempts.length} attempts, ${args.retryResults.length} retries`,
        interventionUsed: `${args.retryResults.length} Rewind(s) applied`,
        learnerResponse: "Could not parse AI analysis",
        recommendedNextActivity: "Review the session manually to determine next steps",
        confidence: "low",
        reasoning: "OpenRouter response was not valid JSON",
      };
    }
  },
});
