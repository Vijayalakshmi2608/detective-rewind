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
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45 },
};

export default function CaseBoard() {
  const navigate = useNavigate();
  const { state } = useGame();
  const { currentCase, cluesFound, currentSceneIndex, totalScenes } = state;

  return (
    <main className="min-h-screen bg-[#f8f7f4] pb-24">
      <header className="px-5 pt-6 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Case File
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
          {currentCase.title}
        </h1>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {currentCase.location}
          </span>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">
            {currentCase.difficulty}
          </span>
        </div>
      </header>

      <div className="space-y-5 px-5">
        {/* Case Description */}
        <motion.div {...fadeUp}>
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {currentCase.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Investigation Progress */}
        <motion.div {...fadeUp} transition={{ delay: 0.08 }}>
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="p-5">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-foreground">
                Investigation Progress
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-muted/60 p-3 text-center">
                  <p className="text-xl font-bold text-foreground">
                    {currentSceneIndex + 1}/{totalScenes}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Scenes</p>
                </div>
                <div className="rounded-xl bg-muted/60 p-3 text-center">
                  <p className="text-xl font-bold text-foreground">
                    {cluesFound.length}/{currentCase.totalClues}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Clues</p>
                </div>
                <div className="rounded-xl bg-muted/60 p-3 text-center">
                  <p className="text-xl font-bold text-foreground">
                    {state.score}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Suspects */}
        <motion.div {...fadeUp} transition={{ delay: 0.16 }}>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-foreground">
            Persons of Interest
          </h3>
          <div className="space-y-3">
            {currentCase.suspects.map((suspect: CaseType["suspects"][number], i: number) => (
              <motion.div
                key={suspect.name}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
              >
                <Card className="border-0 bg-white shadow-sm">
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl">
                      {suspect.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-foreground">
                        {suspect.name}
                      </p>
                      <p className="text-xs font-medium text-primary">
                        {suspect.role}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
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
        <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-xs leading-relaxed text-amber-800">
              Read each scene carefully. The witnesses may know more than they let on —
              or less than they claim.
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div {...fadeUp} transition={{ delay: 0.35 }}>
          <Button
            onClick={() => navigate("/reading")}
            size="lg"
            className="w-full h-13 rounded-2xl text-sm font-semibold"
          >
            Continue Reading
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
