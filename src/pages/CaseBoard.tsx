import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useGame } from "@/lib/gameContext";
import type { CaseType } from "@/lib/gameData";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, AlertTriangle } from "lucide-react";

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
      {/* Header */}
      <header className="px-5 pt-8 pb-5 sm:px-8 sm:pt-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
          Case File
        </p>
        <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {currentCase.title}
        </h1>
        <div className="mt-2.5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <MapPin className="h-3 w-3" />
            {currentCase.location}
          </span>
          <span className="inline-flex items-center rounded-lg bg-primary/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
            {currentCase.difficulty}
          </span>
        </div>
      </header>

      <div className="space-y-5 px-5 sm:px-8">
        {/* Case Description */}
        <motion.div {...fadeUp}>
          <Card className="border-0 bg-card shadow-card">
            <CardContent className="p-5 sm:p-6">
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {currentCase.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Investigation Progress — Responsive Grid */}
        <motion.div {...fadeUp} transition={{ delay: 0.06 }}>
          <Card className="border-0 bg-card shadow-card">
            <CardContent className="p-5 sm:p-6">
              <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Investigation Progress
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: `${currentSceneIndex + 1}/${totalScenes}`, label: "Scenes" },
                  { value: `${cluesFound.length}/${currentCase.totalClues}`, label: "Clues" },
                  { value: `${state.score}`, label: "Points" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-secondary/60 p-3.5 text-center">
                    <p className="text-xl font-extrabold text-foreground tracking-tight">
                      {stat.value}
                    </p>
                    <p className="mt-0.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Suspects */}
        <motion.div {...fadeUp} transition={{ delay: 0.12 }}>
          <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Persons of Interest
          </h3>
          <div className="space-y-3">
            {currentCase.suspects.map((suspect: CaseType["suspects"][number], i: number) => (
              <motion.div
                key={suspect.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.06 }}
              >
                <Card className="border-0 bg-card shadow-card">
                  <CardContent className="flex items-start gap-4 p-4 sm:p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-2xl">
                      {suspect.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-foreground">
                        {suspect.name}
                      </p>
                      <p className="text-xs font-semibold text-gold">
                        {suspect.role}
                      </p>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                        {suspect.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Warning */}
        <motion.div {...fadeUp} transition={{ delay: 0.25 }}>
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200/60 bg-amber-50/50 p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-[13px] leading-relaxed text-amber-800">
              Read each scene carefully. The witnesses may know more than they let on —
              or less than they claim.
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
          <Button
            onClick={() => navigate("/reading")}
            size="lg"
            className="w-full h-14 rounded-2xl text-sm font-bold bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-1px]"
          >
            Continue Reading
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
