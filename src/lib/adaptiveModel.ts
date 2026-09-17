// ─── Skill Dimension Types ───────────────────────────────────────

export type SkillDimension =
  | "comprehension"
  | "inference"
  | "vocabulary"
  | "evidenceAnalysis"
  | "deduction";

export type SkillProfile = Record<SkillDimension, SkillLevel>;

export type SkillLevel = {
  score: number; // 0–100
  attempts: number;
  successes: number;
  trend: "improving" | "stable" | "declining";
  lastThree: boolean[]; // last 3 attempt results
};

export type AttemptRecord = {
  sceneId: string;
  questionType: SkillDimension;
  selectedOption: string;
  correct: boolean;
  timestamp: number;
  responseTimeMs: number;
  wasRewindRetry: boolean;
  rewindApplied: boolean;
};

export type LearnerModel = {
  profile: SkillProfile;
  totalAttempts: number;
  overallAccuracy: number;
  rewindEffectiveness: number; // % of rewind retries that improved
  sessionHistory: AttemptRecord[];
  errorPatterns: ErrorPattern[];
};

export type ErrorPattern = {
  type: SkillDimension;
  frequency: number;
  description: string;
};

// ─── Map scenes to skill dimensions ─────────────────────────────

export const SCENE_SKILL_MAP: Record<string, SkillDimension> = {
  "scene-1": "comprehension",
  "scene-2": "inference",
  "scene-3": "evidenceAnalysis",
  "scene-4": "deduction",
};

// ─── Initialize an empty skill profile ───────────────────────────

export function createEmptyProfile(): SkillProfile {
  const dims: SkillDimension[] = [
    "comprehension",
    "inference",
    "vocabulary",
    "evidenceAnalysis",
    "deduction",
  ];
  const profile: SkillProfile = {} as SkillProfile;
  for (const d of dims) {
    profile[d] = {
      score: 50, // start at neutral
      attempts: 0,
      successes: 0,
      trend: "stable",
      lastThree: [],
    };
  }
  return profile;
}

// ─── Update profile with a new attempt ───────────────────────────

export function updateProfile(
  profile: SkillProfile,
  record: AttemptRecord,
): SkillProfile {
  const dim = record.questionType;
  const prev = profile[dim];

  const newLastThree = [...prev.lastThree, record.correct].slice(-3);
  const newAttempts = prev.attempts + 1;
  const newSuccesses = prev.successes + (record.correct ? 1 : 0);
  const newScore = Math.round((newSuccesses / newAttempts) * 100);

  // Trend detection
  let trend: SkillLevel["trend"] = "stable";
  if (newLastThree.length >= 2) {
    const recentCorrect = newLastThree.filter(Boolean).length;
    if (recentCorrect >= 2) trend = "improving";
    else if (recentCorrect === 0) trend = "declining";
  }

  return {
    ...profile,
    [dim]: {
      score: newScore,
      attempts: newAttempts,
      successes: newSuccesses,
      trend,
      lastThree: newLastThree,
    },
  };
}

// ─── Build a full learner model from history ─────────────────────

export function buildLearnerModel(
  history: AttemptRecord[],
): LearnerModel {
  let profile = createEmptyProfile();
  const rewindAttempts = history.filter((r) => r.wasRewindRetry);
  const rewindApplied = history.filter((r) => r.rewindApplied);
  const rewindSuccesses = rewindAttempts.filter((r) => r.correct);

  for (const record of history) {
    profile = updateProfile(profile, record);
  }

  // Detect error patterns
  const errorPatterns: ErrorPattern[] = [];
  const dims: SkillDimension[] = [
    "comprehension",
    "inference",
    "vocabulary",
    "evidenceAnalysis",
    "deduction",
  ];
  for (const d of dims) {
    const dimAttempts = history.filter((r) => r.questionType === d);
    const dimErrors = dimAttempts.filter((r) => !r.correct);
    const freq = dimAttempts.length > 0
      ? dimErrors.length / dimAttempts.length
      : 0;
    if (freq > 0.3 && dimAttempts.length >= 2) {
      errorPatterns.push({
        type: d,
        frequency: freq,
        description: getErrorDescription(d, freq),
      });
    }
  }

  const totalAttempts = history.length;
  const totalCorrect = history.filter((r) => r.correct).length;

  return {
    profile,
    totalAttempts,
    overallAccuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
    rewindEffectiveness:
      rewindApplied.length > 0
        ? Math.round((rewindSuccesses.length / rewindApplied.length) * 100)
        : 0,
    sessionHistory: history,
    errorPatterns,
  };
}

// ─── Adaptive challenge selection ────────────────────────────────

export type AdaptiveRecommendation = {
  focusDimension: SkillDimension;
  difficultyAdjustment: "maintain" | "easier" | "harder";
  reason: string;
  hintMessage: string;
};

export function getAdaptiveRecommendation(
  model: LearnerModel,
): AdaptiveRecommendation {
  const { profile, errorPatterns } = model;

  // Find weakest dimension
  const dims: SkillDimension[] = [
    "comprehension",
    "inference",
    "vocabulary",
    "evidenceAnalysis",
    "deduction",
  ];

  let weakest: SkillDimension = "comprehension";
  let lowestScore = 100;
  for (const d of dims) {
    if (profile[d].attempts > 0 && profile[d].score < lowestScore) {
      lowestScore = profile[d].score;
      weakest = d;
    }
  }

  // Check for declining trends
  const declining = dims.filter((d) => profile[d].trend === "declining");

  // Determine difficulty
  let difficultyAdjustment: AdaptiveRecommendation["difficultyAdjustment"] = "maintain";
  let reason = "";
  let hintMessage = "";

  if (errorPatterns.length > 0) {
    const topError = errorPatterns.sort((a, b) => b.frequency - a.frequency)[0];
    weakest = topError.type;
    difficultyAdjustment = "easier";
    reason = `Detected recurring difficulty with ${skillLabel(weakest)}.`;
    hintMessage = getTargetedHint(weakest);
  } else if (declining.length > 0) {
    difficultyAdjustment = "easier";
    weakest = declining[0];
    reason = `Performance in ${skillLabel(weakest)} has declined recently.`;
    hintMessage = getTargetedHint(weakest);
  } else if (model.overallAccuracy >= 80) {
    difficultyAdjustment = "harder";
    reason = "Strong performance overall. Ready for a greater challenge.";
    hintMessage = "Your next case has been adjusted based on your investigation.";
  } else if (model.overallAccuracy >= 50) {
    difficultyAdjustment = "maintain";
    reason = "Steady progress. Continuing to build skills.";
    hintMessage = "Your next case has been adjusted based on your investigation.";
  } else {
    difficultyAdjustment = "easier";
    reason = "Building foundational skills with additional support.";
    hintMessage = "Your next case has been adjusted with extra support.";
  }

  // Vocabulary is strong but inference is weak → specific recommendation
  if (
    profile.vocabulary.score >= 70 &&
    profile.inference.score < 50 &&
    profile.inference.attempts > 0
  ) {
    return {
      focusDimension: "inference",
      difficultyAdjustment: "maintain",
      reason: "Vocabulary is strong, but causal inference needs practice. Keeping vocabulary appropriate while focusing on inference.",
      hintMessage: "Your next case focuses on connecting clues and reading between the lines.",
    };
  }

  return {
    focusDimension: weakest,
    difficultyAdjustment,
    reason,
    hintMessage,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────

function skillLabel(d: SkillDimension): string {
  const labels: Record<SkillDimension, string> = {
    comprehension: "reading comprehension",
    inference: "making inferences",
    vocabulary: "vocabulary",
    evidenceAnalysis: "evidence analysis",
    deduction: "logical deduction",
  };
  return labels[d];
}

function getErrorDescription(d: SkillDimension, freq: number): string {
  const pct = Math.round(freq * 100);
  if (pct > 60) return `Consistent difficulty with ${skillLabel(d)} (${pct}% error rate)`;
  return `Some challenges with ${skillLabel(d)} (${pct}% error rate)`;
}

function getTargetedHint(d: SkillDimension): string {
  const hints: Record<SkillDimension, string> = {
    comprehension:
      "Take your time re-reading the passage. Look for the specific details the question asks about.",
    inference:
      "Think about what the evidence implies, not just what it says directly. Ask yourself 'why' and 'what does this suggest?'",
    vocabulary:
      "New words often appear near context clues. Look at the sentence around an unfamiliar word to figure out its meaning.",
    evidenceAnalysis:
      "Pay attention to details that seem unusual or out of place. Small details can be the most important clues.",
    deduction:
      "Combine what you know from multiple pieces of evidence. The answer often comes from putting clues together.",
  };
  return hints[d];
}
