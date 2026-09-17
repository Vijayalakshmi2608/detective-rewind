import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { caseData, type CaseType, type SceneType } from "./gameData";
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
  SCENE_SKILL_MAP,
} from "./adaptiveModel";

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

// ─── State ───────────────────────────────────────────────────────

type GameState = {
  currentCase: CaseType;
  currentSceneIndex: number;
  currentScene: SceneType;
  cluesFound: string[];
  score: number;
  answeredQuestions: Record<string, boolean>;
  totalScenes: number;
  progress: number;
  // Proof of Learning
  rewind: RewindState | null;
  retryResults: RetryResult[];
  attemptHistory: AttemptRecord[];
  // Adaptive Model
  learnerModel: LearnerModel;
  adaptiveRecommendation: AdaptiveRecommendation | null;
  // Tutor
  showTutorCard: boolean;
};

type GameContextType = {
  state: GameState;
  answerQuestion: (sceneId: string, optionId: string, correct: boolean) => void;
  advanceScene: () => void;
  goToScene: (index: number) => void;
  isCaseComplete: () => boolean;
  // Rewind
  triggerRewind: (sceneId: string, wrongOption: string) => void;
  retryQuestion: (sceneId: string, optionId: string, correct: boolean) => void;
  dismissRewind: () => void;
  // Adaptive
  getAdaptedMessage: () => string;
};

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [cluesFound, setCluesFound] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<
    Record<string, boolean>
  >({});
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [rewind, setRewind] = useState<RewindState | null>(null);
  const [retryResults, setRetryResults] = useState<RetryResult[]>([]);
  const [attemptHistory, setAttemptHistory] = useState<AttemptRecord[]>([]);
  const [showTutorCard, setShowTutorCard] = useState(false);

  const currentScene = caseData.scenes[currentSceneIndex];
  const progress = Math.round(
    (currentSceneIndex / caseData.scenes.length) * 100,
  );

  // Build learner model from history
  const learnerModel = useMemo(
    () => buildLearnerModel(attemptHistory),
    [attemptHistory],
  );

  // Get adaptive recommendation
  const adaptiveRecommendation = useMemo(
    () =>
      learnerModel.totalAttempts > 0
        ? getAdaptiveRecommendation(learnerModel)
        : null,
    [learnerModel],
  );

  const state: GameState = {
    currentCase: caseData,
    currentSceneIndex,
    currentScene,
    cluesFound,
    score,
    answeredQuestions,
    totalScenes: caseData.scenes.length,
    progress,
    rewind,
    retryResults,
    attemptHistory,
    learnerModel,
    adaptiveRecommendation,
    showTutorCard,
  };

  // ─── Answer Question ───────────────────────────────────────────

  const answerQuestion = useCallback(
    (sceneId: string, optionId: string, correct: boolean) => {
      setAnsweredQuestions((prev) => ({ ...prev, [sceneId]: correct }));

      // Record attempt
      const skillDim: SkillDimension = SCENE_SKILL_MAP[sceneId] || "comprehension";
      const record: AttemptRecord = {
        sceneId,
        questionType: skillDim,
        selectedOption: optionId,
        correct,
        timestamp: Date.now(),
        responseTimeMs: 0,
        wasRewindRetry: false,
        rewindApplied: false,
      };
      setAttemptHistory((prev) => [...prev, record]);

      if (correct) {
        setScore((prev) => prev + 20);
        const scene = caseData.scenes.find((s) => s.id === sceneId);
        if (scene?.clueUnlocked) {
          setCluesFound((prev) =>
            prev.includes(scene.clueUnlocked!.id)
              ? prev
              : [...prev, scene.clueUnlocked!.id],
          );
        }
      }
      // Don't auto-trigger rewind — ReadingScene will call triggerRewind after showing feedback
    },
    [],
  );

  // ─── Rewind Intervention ───────────────────────────────────────

  const triggerRewind = useCallback(
    (sceneId: string, wrongOption: string) => {
      const scene = caseData.scenes.find((s) => s.id === sceneId);
      if (!scene) return;

      const correctOpt = scene.options.find((o) => o.correct);
      const wrongOpt = scene.options.find((o) => o.id === wrongOption);

      // Build targeted passage excerpt
      const passageExcerpt = getPassageExcerpt(scene.passage, sceneId);

      setRewind({
        active: true,
        sceneId,
        originalOption: wrongOpt?.text || "",
        correctOption: correctOpt?.text || "",
        hint: generateHint(sceneId, wrongOption),
        passageExcerpt,
      });
    },
    [],
  );

  const retryQuestion = useCallback(
    (sceneId: string, optionId: string, correct: boolean) => {
      // Record retry
      const skillDim: SkillDimension = SCENE_SKILL_MAP[sceneId] || "comprehension";
      const record: AttemptRecord = {
        sceneId,
        questionType: skillDim,
        selectedOption: optionId,
        correct,
        timestamp: Date.now(),
        responseTimeMs: 0,
        wasRewindRetry: true,
        rewindApplied: true,
      };
      setAttemptHistory((prev) => [...prev, record]);

      // Find original attempt
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
        setScore((prev) => prev + 15); // Slightly less than first-try
        const scene = caseData.scenes.find((s) => s.id === sceneId);
        if (scene?.clueUnlocked) {
          setCluesFound((prev) =>
            prev.includes(scene.clueUnlocked!.id)
              ? prev
              : [...prev, scene.clueUnlocked!.id],
          );
        }
        setAnsweredQuestions((prev) => ({ ...prev, [sceneId]: true }));
      }
    },
    [attemptHistory],
  );

  const dismissRewind = useCallback(() => {
    setRewind(null);
  }, []);

  // ─── Navigation ────────────────────────────────────────────────

  const advanceScene = useCallback(() => {
    setCurrentSceneIndex((prev) =>
      Math.min(prev + 1, caseData.scenes.length - 1),
    );
  }, []);

  const goToScene = useCallback((index: number) => {
    setCurrentSceneIndex(index);
  }, []);

  const isCaseComplete = useCallback(() => {
    return currentSceneIndex >= caseData.scenes.length - 1;
  }, [currentSceneIndex]);

  // ─── Adaptive Message ──────────────────────────────────────────

  const getAdaptedMessage = useCallback(() => {
    if (!adaptiveRecommendation) return "";
    return adaptiveRecommendation.hintMessage;
  }, [adaptiveRecommendation]);

  return (
    <GameContext.Provider
      value={{
        state,
        answerQuestion,
        advanceScene,
        goToScene,
        isCaseComplete,
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

// ─── Hint Generation ─────────────────────────────────────────────

function generateHint(sceneId: string, _wrongOption: string): string {
  const hints: Record<string, string> = {
    "scene-1":
      "Re-read what Ms. Finch said carefully. She didn't say two people — she named three specific people who have keys. Count them again.",
    "scene-2":
      "Think about this: why would a security guard who already knows the library need to ask about the layout? What reason could he have?",
    "scene-3":
      "Look at the numbers again. If the camera says 11:47 PM but the clock in the video shows 3:15, those times are very different. Someone may have changed the recording.",
    "scene-4":
      "Connect the clues: who had a key, who asked about the layout, and whose uniform was found next to the books? Look at the note found with the books.",
  };
  return hints[sceneId] || "Look more carefully at what the witness said and what the evidence shows.";
}

function getPassageExcerpt(passage: string, sceneId: string): string {
  // Return a relevant excerpt based on the scene
  const excerpts: Record<string, string> = {
    "scene-1":
      '"I locked this room myself at 6 PM. Only three people have keys: me, Theo the volunteer, and Mr. Dalton."',
    "scene-2":
      '"Mr. Dalton asked me where the atlas was, though — he seemed really interested in the library layout."',
    "scene-3":
      '"The timestamp read 11:47 PM... the clock on the wall in the footage showed 3:15, and the timestamp didn\'t match."',
    "scene-4":
      '"Behind a stack of cleaning supplies, you found it — three rare books... right next to Mr. Dalton\'s extra uniform."',
  };
  return excerpts[sceneId] || passage.slice(0, 200);
}
