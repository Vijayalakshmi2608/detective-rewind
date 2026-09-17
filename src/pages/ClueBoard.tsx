import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useGame } from "@/lib/gameContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, CheckCircle2 } from "lucide-react";
import type { CaseType } from "@/lib/gameData";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
};

export default function ClueBoard() {
  const navigate = useNavigate();
  const { state } = useGame();
  const { cluesFound, currentCase } = state;

  const allClues = currentCase.scenes
    .filter((s: CaseType["scenes"][number]) => s.clueUnlocked)
    .map((s: CaseType["scenes"][number]) => s.clueUnlocked!);

  return (
    <main className="min-h-screen bg-background pb-28">
      <header className="px-5 pt-8 pb-5 sm:px-8 sm:pt-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
          Investigation
        </p>
        <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Clue Board
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground font-medium">
          {cluesFound.length} of {allClues.length} clues discovered
        </p>
      </header>

      <div className="space-y-6 px-5 sm:px-8">
        {/* Clue Grid */}
        <motion.div {...fadeUp}>
          <div className="grid gap-3 sm:grid-cols-2">
            {allClues.map((clue: NonNullable<CaseType["scenes"][number]["clueUnlocked"]>, i: number) => {
              const isFound = cluesFound.includes(clue.id);
              return (
                <motion.div
                  key={clue.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i }}
                >
                  <Card
                    className={`border-0 shadow-card transition-all duration-300 overflow-hidden ${
                      isFound
                        ? "bg-card"
                        : "bg-secondary/40 border border-dashed border-border"
                    }`}
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
                            isFound ? "bg-gold/10" : "bg-secondary"
                          }`}
                        >
                          {isFound ? clue.icon : <Lock className="h-4 w-4 text-muted-foreground/40" />}
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
                              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                                {clue.description}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-bold text-muted-foreground/60">
                                Undiscovered Clue
                              </p>
                              <p className="mt-1 text-[13px] text-muted-foreground/40">
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
        <motion.div {...fadeUp} transition={{ delay: 0.12 }}>
          <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Suspects
          </h3>
          <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-5 px-5 sm:mx-0 sm:px-0">
            {currentCase.suspects.map((suspect: CaseType["suspects"][number]) => (
              <div
                key={suspect.name}
                className="flex shrink-0 items-center gap-2.5 rounded-xl border border-border/60 bg-card px-3.5 py-2.5 shadow-card"
              >
                <span className="text-lg">{suspect.icon}</span>
                <div>
                  <p className="text-xs font-bold text-foreground">{suspect.name}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">{suspect.role}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="space-y-2.5">
          <Button
            onClick={() => navigate("/reading")}
            size="lg"
            className="w-full h-14 rounded-2xl text-sm font-bold bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-1px]"
          >
            Continue Reading
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            onClick={() => navigate("/vocabulary")}
            variant="outline"
            size="lg"
            className="w-full h-12 rounded-2xl text-sm font-semibold border-border/60"
          >
            View Vocabulary Notes
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
