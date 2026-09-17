import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useGame } from "@/lib/gameContext";
import type { CaseType } from "@/lib/gameData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  MapPin,
  AlertTriangle,
  FileText,
  UserSearch,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
};

export default function CaseBoard() {
  const navigate = useNavigate();
  const { state } = useGame();
  const { currentCase, cluesFound, currentSceneIndex, totalScenes } = state;

  return (
    <main className="min-h-screen bg-background pb-28">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        {/* Case File Header — briefing style */}
        <header className="pt-8 pb-6 sm:pt-12 sm:pb-8">
          <motion.div {...fadeUp} className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gold" />
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">
              Case File · {currentCase.difficulty}
            </p>
          </motion.div>
          <motion.h1
            {...fadeUp}
            transition={{ delay: 0.05 }}
            className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
          >
            {currentCase.title}
          </motion.h1>
          <motion.div
            {...fadeUp}
            transition={{ delay: 0.1 }}
            className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm"
          >
            <span className="inline-flex items-center gap-1.5 font-medium text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {currentCase.location}
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-muted-foreground">
              <UserSearch className="h-3.5 w-3.5" />
              {currentCase.suspectCount} suspects
            </span>
          </motion.div>
        </header>

        <div className="grid gap-5 lg:grid-cols-5 lg:gap-6">
          {/* Left — briefing + suspects */}
          <div className="space-y-5 lg:col-span-3">
            {/* Investigation Briefing */}
            <motion.div {...fadeUp} transition={{ delay: 0.12 }}>
              <Card className="overflow-hidden rounded-2xl border-0 bg-card shadow-card">
                <div className="flex items-center gap-2 border-b border-dashed border-border/70 bg-secondary/50 px-5 py-2.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-gold" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Investigation Briefing
                  </span>
                </div>
                <CardContent className="p-5 sm:p-6">
                  <p className="text-[15px] leading-[1.7] text-foreground/80 sm:text-base">
                    {currentCase.description}
                  </p>
                  <div className="mt-4 rounded-xl bg-gold/5 border border-gold/15 p-3.5">
                    <p className="text-[13px] leading-relaxed text-foreground/70">
                      <span className="font-bold text-foreground">
                        Detective tip:
                      </span>{" "}
                      Witnesses may know more than they let on — or less than
                      they claim. Read every statement twice.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Persons of Interest — distinctive cards */}
            <motion.div {...fadeUp} transition={{ delay: 0.18 }}>
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Persons of Interest
              </h3>
              <div className="space-y-3">
                {currentCase.suspects.map(
                  (suspect: CaseType["suspects"][number], i: number) => (
                    <motion.div
                      key={suspect.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.22 + i * 0.06 }}
                    >
                      <Card className="group rounded-2xl border-0 bg-card shadow-card transition-all duration-200 hover:shadow-card-hover">
                        <CardContent className="flex items-start gap-4 p-4 sm:p-5">
                          {/* Suspect photo frame — case-file style */}
                          <div className="relative shrink-0">
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-secondary bg-secondary/60 text-2xl transition-colors duration-200 group-hover:border-gold/30">
                              {suspect.icon}
                            </div>
                            <span className="absolute -bottom-1 -right-1 rounded-md bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">
                              #{i + 1}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[15px] font-bold text-foreground">
                              {suspect.name}
                            </p>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gold">
                              {suspect.role}
                            </p>
                            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                              {suspect.description}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ),
                )}
              </div>
            </motion.div>
          </div>

          {/* Right — progress + CTA */}
          <div className="space-y-5 lg:col-span-2">
            <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
              <Card className="rounded-2xl border-0 bg-card shadow-card">
                <CardContent className="p-5 sm:p-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    Investigation Progress
                  </h3>
                  <div className="mt-4 space-y-3.5">
                    {[
                      {
                        label: "Scenes explored",
                        value: `${currentSceneIndex + 1}/${totalScenes}`,
                        pct: ((currentSceneIndex + 1) / totalScenes) * 100,
                      },
                      {
                        label: "Clues discovered",
                        value: `${cluesFound.length}/${currentCase.totalClues}`,
                        pct:
                          (cluesFound.length / currentCase.totalClues) * 100,
                      },
                    ].map((row) => (
                      <div key={row.label}>
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="text-muted-foreground">
                            {row.label}
                          </span>
                          <span className="font-bold text-foreground">
                            {row.value}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                          <motion.div
                            className={`h-full rounded-full ${
                              row.label.startsWith("Clues")
                                ? "bg-gradient-to-r from-gold to-gold/70"
                                : "bg-primary"
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(row.pct, 4)}%` }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    ))}

                    {/* Reading points */}
                    <div className="flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-3">
                      <span className="text-xs font-medium text-muted-foreground">
                        Reading points
                      </span>
                      <span className="text-lg font-extrabold tracking-tight text-foreground">
                        {state.score}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeUp} transition={{ delay: 0.22 }}>
              <Button
                onClick={() => navigate("/reading")}
                className="h-14 w-full rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-md transition-all duration-200 hover:translate-y-[-1px] hover:shadow-lg active:translate-y-0"
              >
                Continue Reading
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
