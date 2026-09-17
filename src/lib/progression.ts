// ─── Progression: real completion gating + localStorage persistence ───
// A case unlocks ONLY when the previous case was actually completed
// (all scenes investigated through the full read→answer loop).
// Refreshing the page never resets progress.

import { CASE_LEVELS, type CaseLevel } from "./cases";

const STORAGE_KEY = "detective-rewind-progress-v1";

export type CaseProgress = {
  /** True when the learner finished the full investigation flow */
  completed: boolean;
  /** Highest scene index the learner advanced past (0-based) */
  scenesCompleted: number;
  cluesFound: string[];
  score: number;
  rewindsUsed: number;
  /** Rewind retries that turned a wrong answer into a right one */
  rewindImprovements: number;
  readAloudSessions: number;
  attempts: number;
  correctFirstTry: number;
  completedAt: number | null;
};

export type ProgressionState = {
  cases: Record<string, CaseProgress>;
  totalScore: number;
};

export function emptyCaseProgress(): CaseProgress {
  return {
    completed: false,
    scenesCompleted: 0,
    cluesFound: [],
    score: 0,
    rewindsUsed: 0,
    rewindImprovements: 0,
    readAloudSessions: 0,
    attempts: 0,
    correctFirstTry: 0,
    completedAt: null,
  };
}

function emptyState(): ProgressionState {
  return { cases: {}, totalScore: 0 };
}

// ─── Persistence ─────────────────────────────────────────────────

export function loadProgression(): ProgressionState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as ProgressionState;
    if (!parsed || typeof parsed !== "object" || !parsed.cases) return emptyState();
    return parsed;
  } catch {
    return emptyState();
  }
}

export function saveProgression(state: ProgressionState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable (private mode) — session-only progress
  }
}

// ─── Unlock gating ───────────────────────────────────────────────

export function isLevelUnlocked(state: ProgressionState, level: number): boolean {
  if (level <= 1) return true;
  const prev = CASE_LEVELS.find((l) => l.level === level - 1);
  if (!prev) return false;
  return state.cases[prev.caseData.id]?.completed === true;
}

/** Highest unlocked level — used to steer navigation away from locked cases */
export function highestUnlockedLevel(state: ProgressionState): number {
  let highest = 1;
  for (const l of CASE_LEVELS) {
    if (isLevelUnlocked(state, l.level)) highest = l.level;
    else break;
  }
  return highest;
}

export function isCaseComplete(
  state: ProgressionState,
  caseId: string,
  totalScenes: number,
): boolean {
  const p = state.cases[caseId];
  if (!p) return false;
  return p.completed || p.scenesCompleted >= totalScenes;
}

// ─── Mutators (pure — return new state) ──────────────────────────

export function upsertCaseProgress(
  state: ProgressionState,
  caseId: string,
  update: Partial<CaseProgress>,
): ProgressionState {
  const prev = state.cases[caseId] ?? emptyCaseProgress();
  return {
    ...state,
    cases: {
      ...state.cases,
      [caseId]: { ...prev, ...update },
    },
  };
}

export function mergeSceneProgress(
  state: ProgressionState,
  caseId: string,
  update: Partial<CaseProgress>,
): ProgressionState {
  const prev = state.cases[caseId] ?? emptyCaseProgress();
  const merged: CaseProgress = {
    ...prev,
    cluesFound: update.cluesFound
      ? Array.from(new Set([...prev.cluesFound, ...update.cluesFound]))
      : prev.cluesFound,
    score: Math.max(prev.score, update.score ?? prev.score),
    scenesCompleted: Math.max(prev.scenesCompleted, update.scenesCompleted ?? prev.scenesCompleted),
    rewindsUsed: prev.rewindsUsed + (update.rewindsUsed ?? 0),
    rewindImprovements: prev.rewindImprovements + (update.rewindImprovements ?? 0),
    readAloudSessions: Math.max(
      prev.readAloudSessions,
      update.readAloudSessions ?? prev.readAloudSessions,
    ),
    attempts: prev.attempts + (update.attempts ?? 0),
    correctFirstTry: prev.correctFirstTry + (update.correctFirstTry ?? 0),
  };
  return upsertCaseProgress(state, caseId, merged);
}

export function markCaseCompleted(
  state: ProgressionState,
  caseId: string,
): ProgressionState {
  const prev = state.cases[caseId] ?? emptyCaseProgress();
  return {
    ...state,
    cases: {
      ...state.cases,
      [caseId]: {
        ...prev,
        completed: true,
        completedAt: prev.completedAt ?? Date.now(),
      },
    },
  };
}
