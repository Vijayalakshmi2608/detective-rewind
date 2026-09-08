import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useGame } from "@/lib/gameContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, CheckCircle2 } from "lucide-react";
import type { CaseType } from "@/lib/gameData";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45 },
};

export default function ClueBoard() {
  const navigate = useNavigate();
  const { state } = useGame();
  const { cluesFound, currentCase } = state;

  const allClues = currentCase.scenes
    .filter((s: CaseType["scenes"][number]) => s.clueUnlocked)
    .map((s: CaseType["scenes"][number]) => s.clueUnlocked!);

  return (
    <main className="min-h-screen bg-[#f8f7f4] pb-24">
      <header className="px-5 pt-6 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Investigation
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
          Clue Board
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {cluesFound.length} of {allClues.length} clues discovered
        </p>
      </header>

      <div className="space-y-4 px-5">
        {/* Clue Grid */}
        <motion.div {...fadeUp}>
          <div className="grid gap-3 sm:grid-cols-2">
            {allClues.map((clue: NonNullable<CaseType["scenes"][number]["clueUnlocked"]>, i: number) => {
              const isFound = cluesFound.includes(clue.id);
              return (
                <motion.div
                  key={clue.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <Card
                    className={`border-0 shadow-sm transition-all duration-300 ${
                      isFound
                        ? "bg-white"
                        : "bg-muted/40 border border-dashed border-border"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl ${
                            isFound ? "bg-primary/10" : "bg-muted"
                          }`}
                        >
                          {isFound ? clue.icon : <Lock className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          {isFound ? (
                            <>
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                <p className="text-sm font-bold text-foreground">
                                  {clue.name}
                                </p>
                              </div>
                              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                {clue.description}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-bold text-muted-foreground">
                                Undiscovered Clue
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground/70">
                                Keep reading to find this clue
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Suspects Quick View */}
        <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-foreground">
            Suspects
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {currentCase.suspects.map((suspect: CaseType["suspects"][number]) => (
              <div
                key={suspect.name}
                className="flex shrink-0 items-center gap-2 rounded-xl border border-border/60 bg-white px-3 py-2"
              >
                <span className="text-lg">{suspect.icon}</span>
                <div>
                  <p className="text-xs font-bold text-foreground">{suspect.name}</p>
                  <p className="text-[10px] text-muted-foreground">{suspect.role}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div {...fadeUp} transition={{ delay: 0.25 }} className="space-y-2">
          <Button
            onClick={() => navigate("/reading")}
            size="lg"
            className="w-full h-13 rounded-2xl text-sm font-semibold"
          >
            Continue Reading
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            onClick={() => navigate("/vocabulary")}
            variant="outline"
            size="lg"
            className="w-full h-12 rounded-2xl text-sm font-semibold"
          >
            View Vocabulary Notes
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
