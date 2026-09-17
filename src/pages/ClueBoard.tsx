import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useGame } from "@/lib/gameContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Lock,
  CheckCircle2,
  BookOpen,
  Search,
} from "lucide-react";
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

  const foundCount = cluesFound.length;
  const totalCount = allClues.length;
  const pct = (foundCount / totalCount) * 100;

  return (
    <main className="min-h-screen bg-background pb-28">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        {/* Header with inline progress */}
        <header className="pt-8 pb-6 sm:pt-12 sm:pb-8">
          <motion.div {...fadeUp} className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gold" />
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">
              Investigation
            </p>
          </motion.div>
          <motion.h1
            {...fadeUp}
            transition={{ delay: 0.05 }}
            className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
          >
            Clue Board
          </motion.h1>

          {/* Progress — compact + meaningful */}
          <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-muted-foreground">
                <span className="font-extrabold text-foreground">
                  {foundCount}
                </span>{" "}
                of {totalCount} clues discovered
              </span>
              {foundCount === totalCount ? (
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  All clues found!
                </span>
              ) : (
                <span className="text-xs font-medium text-muted-foreground">
                  {totalCount - foundCount} to go
                </span>
              )}
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-gold to-gold/70"
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(pct, 3)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        </header>

        {/* Clue Grid — mobile 1col, tablet/laptop adaptive, desktop 2col */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:gap-4">
          {allClues.map(
            (
              clue: NonNullable<
                CaseType["scenes"][number]["clueUnlocked"]
              >,
              i: number,
            ) => {
              const isFound = cluesFound.includes(clue.id);
              return (
                <motion.div
                  key={clue.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 + i * 0.05 }}
                >
                  <Card
                    className={`h-full overflow-hidden rounded-2xl transition-all duration-300 ${
                      isFound
                        ? "border-0 bg-card shadow-card hover:shadow-card-hover"
                        : "border border-dashed border-border bg-secondary/30"
                    }`}
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start gap-3.5">
                        {/* Clue icon — rewarding for found, muted for locked */}
                        <motion.div
                          initial={isFound ? { scale: 0 } : false}
                          animate={isFound ? { scale: 1 } : {}}
                          transition={
                            isFound
                              ? {
                                  delay: 0.15 + i * 0.05,
                                  type: "spring",
                                  stiffness: 300,
                                  damping: 18,
                                }
                              : {}
                          }
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                            isFound
                              ? "bg-gold/10"
                              : "border border-dashed border-border bg-card"
                          }`}
                        >
                          {isFound ? (
                            <span className="text-xl">{clue.icon}</span>
                          ) : (
                            <Lock className="h-4 w-4 text-muted-foreground/30" />
                          )}
                        </motion.div>

                        <div className="min-w-0 flex-1">
                          {isFound ? (
                            <>
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                                <p className="text-sm font-bold text-foreground">
                                  {clue.name}
                                </p>
                              </div>
                              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                                {clue.description}
                              </p>
                              <span className="mt-2 inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                                Evidence collected
                              </span>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-bold text-muted-foreground/50">
                                Clue locked
                              </p>
                              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground/45">
                                Keep investigating — this clue hides in a
                                scene you haven't solved yet.
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            },
          )}
        </div>

        {/* Suspects — improved section */}
        <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="mt-8">
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Under Investigation
          </h3>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {currentCase.suspects.map(
              (suspect: CaseType["suspects"][number], i: number) => (
                <motion.div
                  key={suspect.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                  className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-card"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-xl">
                    {suspect.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground">
                      {suspect.name}
                    </p>
                    <p className="text-[11px] font-medium text-muted-foreground">
                      {suspect.role}
                    </p>
                  </div>
                </motion.div>
              ),
            )}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.3 }}
          className="mt-8 space-y-2.5"
        >
          <Button
            onClick={() => navigate("/reading")}
            className="h-14 w-full rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-md transition-all duration-200 hover:translate-y-[-1px] hover:shadow-lg active:translate-y-0"
          >
            {foundCount === totalCount
              ? "Review the Case"
              : "Keep Investigating"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            onClick={() => navigate("/vocabulary")}
            variant="outline"
            className="h-12 w-full rounded-2xl border-border/60 text-sm font-semibold"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            View Vocabulary Notes
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
