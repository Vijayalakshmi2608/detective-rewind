import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";
import { CASE_LEVELS, type CaseLevel } from "./cases";
import type { CaseType, SceneType } from "./gameData";
import {
  type SkillDimension,
  type AttemptRecord,
  type LearnerModel,
  type AdaptiveRecommendation,
  type SkillProfile,
  createEmptyProfile,
  updateProfile,
  buildLearnerModel,
  getAdaptiveRecommendation,
} from "./adaptiveModel";
import {
  type ProgressionState,
  type CaseProgress,
  emptyCaseProgress,
  loadProgression,
  saveProgression,
  isLevelUnlocked,
  highestUnlockedLevel,
  isCaseComplete as isCaseCompleteInStore,
  upsertCaseProgress,
  mergeSceneProgress,
  markCaseCompleted,
} from "./progression";

// ─── Rewind Intervention Types ───────────────────────────────────

export type RewindState = {
  active: boolean;
  sceneId: string;
  originalOption: string;
  correctOption: string;
  hint: string;
  passageExcerpt: string;
};

export type RetryResult = {
  sceneId: string;
  originalCorrect: boolean;
  retryCorrect: boolean;
  improvement: boolean;
};

// ─── Session attempt (global across levels) ──────────────────────

export type SessionAttempt = {
  caseId: string;
  sceneId: string;
  questionType: SkillDimension;
  selectedOption: string;
  correct: boolean;
  wasRewindRetry: boolean;
  rewindApplied: boolean;
  timestamp: number;
};

// ─── State ───────────────────────────────────────────────────────

type GameState = {
  // Level journey
  currentLevel: number;
  currentCaseLevel: CaseLevel;
  currentCase: CaseType;
  currentSceneIndex: number;
  currentScene: SceneType;
  totalScenes: number;
  progress: number;
  // Case-scoped session state (resets per level entry)
  cluesFound: string[];
  score: number;
  answeredQuestions: Record<string, boolean>;
  readAloudCount: number;
  // Proof of Learning
  rewind: RewindState | null;
  retryResults: RetryResult[];
  attemptHistory: SessionAttempt[];
  // Adaptive Model
  learnerModel: LearnerModel;
  adaptiveRecommendation: AdaptiveRecommendation | null;
  // Progression
  progression: ProgressionState;
  unlockedThroughLevel: number;
  // Tutor
  showTutorCard: boolean;
};

type GameContextType = {
  state: GameState;
  selectLevel: (level: number) => boolean;
  answerQuestion: (sceneId: string, optionId: string, correct: boolean) => void;
  recordReadAloud: () => void;
  advanceScene: () => void;
  goToScene: (index: number) => void;
  isCaseComplete: () => boolean;
  completeCase: () => void;
  caseProgress: (caseId: string) => CaseProgress;
  isLevelUnlocked: (level: number) => boolean;
  // Rewind
  triggerRewind: (sceneId: string, wrongOption: string) => void;
  retryQuestion: (sceneId: string, optionId: string, correct: boolean) => void;
  dismissRewind: () => void;
  // Adaptive
  getAdaptedMessage: () => string;
};

const GameContext = createContext<GameContextType | null>(null);

const SESSION_KEY = "detective-rewind-session-v1";

// Session state survives GameProvider remounts (route changes + refreshes).
type PersistedSession = {
  currentLevel: number;
  currentSceneIndex: number;
  cluesFound: string[];
  score: number;
  readAloudCount: number;
  attemptHistory: SessionAttempt[];
  retryResults: RetryResult[];
  answeredQuestions: Record<string, boolean>;
};

function loadSession(): PersistedSession | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedSession;
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !Array.isArray(parsed.attemptHistory) ||
      !Array.isArray(parsed.cluesFound)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveSession(s: PersistedSession) {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  } catch {
    // storage unavailable — session-only progress
  }
}

// Level-scoped hint + excerpt banks (generic-safe across all 5 cases)
const HINTS_BY_LEVEL: Record<number, Record<string, string>> = {
  1: {
    "scene-1":
      "Re-read what Ms. Finch said carefully. She didn't say two people — she named three specific people who have keys. Count them again.",
    "scene-2":
      "Think about this: why would a security guard who already knows the library need to ask about the layout? What reason could he have?",
    "scene-3":
      "Look at the numbers again. If the camera says 11:47 PM but the clock in the video shows 3:15, those times are very different. Someone may have changed the recording.",
    "scene-4":
      "Connect the clues: who had a key, who asked about the layout, and whose uniform was found next to the books? Look at the note found with the books.",
  },
};

const GENERIC_HINTS: Record<number, string> = {
  1: "Look again at exactly what the witness said. The answer is in the words themselves — count or list the details.",
  2: "Ask 'why did this happen?' and 'what does it cause?' One detail should lead you to the next.",
  3: "Think about what each person WANTS. The clue chain connects motives to actions.",
  4: "Some clues disagree on purpose. Trust actions over words — and follow the physical evidence.",
  5: "Combine everything: the timing, the letter, the watch, and the vault. Which single story explains them all?",
};

function getSceneHint(level: number, sceneId: string, caseId: string): string {
  // Midnight Library keeps its original scene-specific hints
  if (caseId === "midnight-library" && HINTS_BY_LEVEL[1]?.[sceneId]) {
    return HINTS_BY_LEVEL[1][sceneId];
  }
  return GENERIC_HINTS[level] ?? GENERIC_HINTS[1];
}

export function GameProvider({ children }: { children: ReactNode }) {
  // ─── Progression (persisted) ──────────────────────────────────
  const [progression, setProgression] = useState<ProgressionState>(() =>
    loadProgression(),
  );

  useEffect(() => {
    saveProgression(progression);
  }, [progression]);

  // ─── Current level session state (hydrated from storage) ──────
  const saved = useMemo(() => loadSession(), []);
  const [currentLevel, setCurrentLevel] = useState(saved?.currentLevel ?? 1);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(
    saved?.currentSceneIndex ?? 0,
  );
  const [cluesFound, setCluesFound] = useState<string[]>(saved?.cluesFound ?? []);
  const [score, setScore] = useState(saved?.score ?? 0);
  const [answeredQuestions, setAnsweredQuestions] = useState<
    Record<string, boolean>
  >(saved?.answeredQuestions ?? {});
  const [readAloudCount, setReadAloudCount] = useState(saved?.readAloudCount ?? 0);
  const [rewind, setRewind] = useState<RewindState | null>(null);
  const [retryResults, setRetryResults] = useState<RetryResult[]>(
    saved?.retryResults ?? [],
  );
  const [attemptHistory, setAttemptHistory] = useState<SessionAttempt[]>(
    saved?.attemptHistory ?? [],
  );

  // Persist session whenever it changes
  useEffect(() => {
    saveSession({
      currentLevel,
      currentSceneIndex,
      cluesFound,
      score,
      readAloudCount,
      attemptHistory,
      retryResults,
      answeredQuestions,
    });
  }, [
    currentLevel,
    currentSceneIndex,
    cluesFound,
    score,
    readAloudCount,
    attemptHistory,
    retryResults,
    answeredQuestions,
  ]);

  const currentCaseLevel = useMemo(
    () => CASE_LEVELS.find((l) => l.level === currentLevel) ?? CASE_LEVELS[0],
    [currentLevel],
  );
  const currentCase = currentCaseLevel.caseData;
  const currentScene = currentCase.scenes[currentSceneIndex];
  const progress = Math.round(
    (currentSceneIndex / currentCase.scenes.length) * 100,
  );

  // Restore saved position when entering a level
  const selectLevel = useCallback(
    (level: number): boolean => {
      if (!isLevelUnlocked(progression, level)) return false;
      const lvl = CASE_LEVELS.find((l) => l.level === level);
      if (!lvl) return false;

      setCurrentLevel(level);
      const saved = progression.cases[lvl.caseData.id];
      const savedScene = saved
        ? Math.min(saved.scenesCompleted, lvl.caseData.scenes.length - 1)
        : 0;
      setCurrentSceneIndex(savedScene);
      setCluesFound(saved?.cluesFound ?? []);
      setScore(saved?.score ?? 0);
      setAnsweredQuestions({});
      setReadAloudCount(0);
      setRewind(null);
      setRetryResults([]);
      setAttemptHistory([]);
      return true;
    },
    [progression],
  );

  // Build learner model from history
  const learnerModel = useMemo(() => {
    const adapted: AttemptRecord[] = attemptHistory.map((a) => ({
      sceneId: a.sceneId,
      questionType: a.questionType,
      selectedOption: a.selectedOption,
      correct: a.correct,
      timestamp: a.timestamp,
      responseTimeMs: 0,
      wasRewindRetry: a.wasRewindRetry,
      rewindApplied: a.rewindApplied,
    }));
    return buildLearnerModel(adapted);
  }, [attemptHistory]);

  const adaptiveRecommendation = useMemo(
    () =>
      learnerModel.totalAttempts > 0
        ? getAdaptiveRecommendation(learnerModel)
        : null,
    [learnerModel],
  );

  const state: GameState = {
    currentLevel,
    currentCaseLevel,
    currentCase,
    currentSceneIndex,
    currentScene,
    totalScenes: currentCase.scenes.length,
    progress,
    cluesFound,
    score,
    answeredQuestions,
    readAloudCount,
    rewind,
    retryResults,
    attemptHistory,
    learnerModel,
    adaptiveRecommendation,
    progression,
    unlockedThroughLevel: highestUnlockedLevel(progression),
    showTutorCard: false,
  };

  // ─── Progress sync helper ─────────────────────────────────────

  const syncCaseProgress = useCallback(
    (
      caseId: string,
      update: {
        cluesFound?: string[];
        score?: number;
        scenesCompleted?: number;
        rewindsUsed?: number;
        rewindImprovements?: number;
        attempts?: number;
        correctFirstTry?: number;
      },
    ) => {
      setProgression((prev) => mergeSceneProgress(prev, caseId, update));
    },
    [],
  );

  // ─── Answer Question ──────────────────────────────────────────

  const answerQuestion = useCallback(
    (sceneId: string, optionId: string, correct: boolean) => {
      setAnsweredQuestions((prev) => ({ ...prev, [sceneId]: correct }));

      const skillDim: SkillDimension =
        SCENE_SKILL_FALLBACK[sceneId] ||
        skillFromLevel(currentCaseLevel.level, sceneId);
      const record: SessionAttempt = {
        caseId: currentCase.id,
        sceneId,
        questionType: skillDim,
        selectedOption: optionId,
        correct,
        wasRewindRetry: false,
        rewindApplied: false,
        timestamp: Date.now(),
      };
      setAttemptHistory((prev) => [...prev, record]);

      if (correct) {
        setScore((prev) => prev + 20);
        const scene = currentCase.scenes.find((s) => s.id === sceneId);
        if (scene?.clueUnlocked) {
          setCluesFound((prev) =>
            prev.includes(scene.clueUnlocked!.id)
              ? prev
              : [...prev, scene.clueUnlocked!.id],
          );
        }
      }

      syncCaseProgress(currentCase.id, {
        attempts: 1,
        correctFirstTry: correct ? 1 : 0,
        score: correct ? score + 20 : score,
      });
    },
    [currentCase, currentCaseLevel.level, score, syncCaseProgress],
  );

  const recordReadAloud = useCallback(() => {
    setReadAloudCount((prev) => {
      const next = prev + 1;
      setProgression((p) =>
        mergeSceneProgress(p, currentCase.id, { readAloudSessions: next }),
      );
      return next;
    });
  }, [currentCase.id]);

  // ─── Rewind Intervention ──────────────────────────────────────

  const triggerRewind = useCallback(
    (sceneId: string, wrongOption: string) => {
      const scene = currentCase.scenes.find((s) => s.id === sceneId);
      if (!scene) return;

      const correctOpt = scene.options.find((o) => o.correct);
      const wrongOpt = scene.options.find((o) => o.id === wrongOption);

      syncCaseProgress(currentCase.id, { rewindsUsed: 1 });

      setRewind({
        active: true,
        sceneId,
        originalOption: wrongOpt?.text || "",
        correctOption: correctOpt?.text || "",
        hint: getSceneHint(currentCaseLevel.level, sceneId, currentCase.id),
        passageExcerpt: getPassageExcerpt(scene.passage, sceneId, currentCase.id),
      });
    },
    [currentCase, currentCaseLevel.level, syncCaseProgress],
  );

  const retryQuestion = useCallback(
    (sceneId: string, optionId: string, correct: boolean) => {
      const skillDim: SkillDimension =
        SCENE_SKILL_FALLBACK[sceneId] ||
        skillFromLevel(currentCaseLevel.level, sceneId);
      const record: SessionAttempt = {
        caseId: currentCase.id,
        sceneId,
        questionType: skillDim,
        selectedOption: optionId,
        correct,
        wasRewindRetry: true,
        rewindApplied: true,
        timestamp: Date.now(),
      };
      setAttemptHistory((prev) => [...prev, record]);

      const originalRecord = attemptHistory.find(
        (r) => r.sceneId === sceneId && !r.wasRewindRetry,
      );
      const originalCorrect = originalRecord?.correct ?? false;

      const result: RetryResult = {
        sceneId,
        originalCorrect,
        retryCorrect: correct,
        improvement: !originalCorrect && correct,
      };
      setRetryResults((prev) => [...prev, result]);

      if (correct) {
        setScore((prev) => prev + 15);
        const scene = currentCase.scenes.find((s) => s.id === sceneId);
        if (scene?.clueUnlocked) {
          setCluesFound((prev) =>
            prev.includes(scene.clueUnlocked!.id)
              ? prev
              : [...prev, scene.clueUnlocked!.id],
          );
        }
        setAnsweredQuestions((prev) => ({ ...prev, [sceneId]: true }));
      }

      syncCaseProgress(currentCase.id, {
        score: correct ? score + 15 : score,
        rewindImprovements: result.improvement ? 1 : 0,
      });
    },
    [attemptHistory, currentCase, currentCaseLevel.level, score, syncCaseProgress],
  );

  const dismissRewind = useCallback(() => {
    setRewind(null);
  }, []);

  // ─── Navigation ───────────────────────────────────────────────

  const advanceScene = useCallback(() => {
    const next = Math.min(currentSceneIndex + 1, currentCase.scenes.length - 1);
    setCurrentSceneIndex(next);
    // Persist scene advancement (next scenes now done)
    syncCaseProgress(currentCase.id, { scenesCompleted: next });
  }, [currentCase, currentSceneIndex, syncCaseProgress]);

  const goToScene = useCallback((index: number) => {
    setCurrentSceneIndex(index);
  }, []);

  const isCaseComplete = useCallback(() => {
    return (
      currentSceneIndex >= currentCase.scenes.length - 1 &&
      answeredQuestions[currentCase.scenes[currentCase.scenes.length - 1].id] ===
        true
    );
  }, [currentCase, currentSceneIndex, answeredQuestions]);

  const completeCase = useCallback(() => {
    setProgression((prev) => markCaseCompleted(prev, currentCase.id));
  }, [currentCase.id]);

  const caseProgress = useCallback(
    (caseId: string) => progression.cases[caseId] ?? emptyCaseProgress(),
    [progression],
  );

  const isLevelUnlockedFn = useCallback(
    (level: number) => isLevelUnlocked(progression, level),
    [progression],
  );

  // ─── Adaptive Message ─────────────────────────────────────────

  const getAdaptedMessage = useCallback(() => {
    if (!adaptiveRecommendation) return "";
    return adaptiveRecommendation.hintMessage;
  }, [adaptiveRecommendation]);

  return (
    <GameContext.Provider
      value={{
        state,
        selectLevel,
        answerQuestion,
        recordReadAloud,
        advanceScene,
        goToScene,
        isCaseComplete,
        completeCase,
        caseProgress,
        isLevelUnlocked: isLevelUnlockedFn,
        triggerRewind,
        retryQuestion,
        dismissRewind,
        getAdaptedMessage,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}

// ─── Skill mapping per level (fallback for unknown scene ids) ────

const SCENE_SKILL_FALLBACK: Record<string, SkillDimension> = {
  "scene-1": "comprehension",
  "scene-2": "inference",
  "scene-3": "evidenceAnalysis",
  "scene-4": "deduction",
};

function skillFromLevel(level: number, sceneId: string): SkillDimension {
  const num = parseInt(sceneId.replace(/[^0-9]/g, ""), 10);
  const base = SCENE_SKILL_FALLBACK;
  if (level <= 1) return base[sceneId] ?? "comprehension";
  if (num === 1) return "comprehension";
  if (num === 2) return level >= 4 ? "evidenceAnalysis" : "inference";
  if (num === 3) return "evidenceAnalysis";
  return "deduction";
}

// ─── Excerpt extraction (case-aware) ─────────────────────────────

function getPassageExcerpt(
  passage: string,
  sceneId: string,
  caseId: string,
): string {
  if (caseId === "midnight-library") {
    const excerpts: Record<string, string> = {
      "scene-1":
        "\"I locked this room myself at 6 PM. Only three people have keys: me, Theo the volunteer, and Mr. Dalton.\"",
      "scene-2":
        "\"Mr. Dalton asked me where the atlas was, though — he seemed really interested in the library layout.\"",
      "scene-3":
        "\"The timestamp read 11:47 PM... the clock on the wall in the footage showed 3:15, and the timestamp didn't match.\"",
      "scene-4":
        "\"Behind a stack of cleaning supplies, you found it — three rare books... right next to Mr. Dalton's extra uniform.\"",
    };
    return excerpts[sceneId] || passage.slice(0, 200);
  }
  // Generic: pull the most quotable sentence (contains dialogue or key phrase)
  const sentences = passage.split(/(?<=[.!?])\s+/);
  const dialogue = sentences.find((s) => s.includes('"'));
  return (dialogue ?? sentences[0] ?? passage).slice(0, 240);
}
