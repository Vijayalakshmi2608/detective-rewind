import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { caseData, type CaseType, type SceneType } from "./gameData";

type GameState = {
  currentCase: CaseType;
  currentSceneIndex: number;
  currentScene: SceneType;
  cluesFound: string[];
  score: number;
  answeredQuestions: Record<string, boolean>;
  totalScenes: number;
  progress: number;
};

type GameContextType = {
  state: GameState;
  answerQuestion: (sceneId: string, optionId: string, correct: boolean) => void;
  advanceScene: () => void;
  goToScene: (index: number) => void;
  isCaseComplete: () => boolean;
};

const defaultState: GameState = {
  currentCase: caseData,
  currentSceneIndex: 0,
  currentScene: caseData.scenes[0],
  cluesFound: [],
  score: 0,
  answeredQuestions: {},
  totalScenes: caseData.scenes.length,
  progress: 0,
};

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [cluesFound, setCluesFound] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<
    Record<string, boolean>
  >({});
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

  const currentScene = caseData.scenes[currentSceneIndex];
  const progress = Math.round(
    ((currentSceneIndex) / caseData.scenes.length) * 100,
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
  };

  const answerQuestion = useCallback(
    (sceneId: string, optionId: string, correct: boolean) => {
      setAnsweredQuestions((prev) => ({ ...prev, [sceneId]: correct }));
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
    },
    [],
  );

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

  return (
    <GameContext.Provider
      value={{
        state,
        answerQuestion,
        advanceScene,
        goToScene,
        isCaseComplete,
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
