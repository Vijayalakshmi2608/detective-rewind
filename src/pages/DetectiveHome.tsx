import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useGame } from "@/lib/gameContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  ChevronRight,
  Search,
  BookOpen,
  Brain,
  MapPin,
  FileText,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
};

export default function DetectiveHome() {
  const navigate = useNavigate();
  const { state } = useGame();
  const { currentCase, cluesFound, currentSceneIndex, totalScenes, score } = state;

  const scenesRead = currentSceneIndex;

  return (
    <main className="min-h-screen bg-background pb-28">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        {/* Welcome Hero — engaging, compact */}
        <header className="pt-8 pb-6 sm:pt-12 sm:pb-8">
          <motion.p
            {...fadeUp}
            className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold"
          >
            Case Notebook
          </motion.p>
          <motion.h1
            {...fadeUp}
            transition={{ delay: 0.05 }}
            className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
          >
            Welcome back, Detective
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ delay: 0.1 }}
            className="mt-2 text-[15px] leading-relaxed text-muted-foreground sm:text-base"
          >
            There's a mystery waiting for you. Keep reading to crack the case.
          </motion.p>
        </header>

        <div className="grid gap-5 lg:grid-cols-5 lg:gap-6">
          {/* Left column — case file + CTA */}
          <div className="space-y-5 lg:col-span-3">
            {/* Active Case — Case File look */}
            <motion.div {...fadeUp} transition={{ delay: 0.12 }}>
              <Card className="group relative overflow-hidden rounded-2xl border-0 bg-card shadow-card transition-shadow duration-300 hover:shadow-card-hover">
                {/* Case-file top tab strip */}
                <div className="flex items-center justify-between border-b border-dashed border-border/70 bg-secondary/50 px-5 py-2.5">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      Case File · Open
                    </span>
                  </div>
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-40" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                </div>

                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary text-3xl">
                      {currentCase.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl font-extrabold leading-tight tracking-tight text-foreground sm:text-2xl">
                        {currentCase.title}
                      </h2>
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {currentCase.location}
                      </p>
                      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground line-clamp-2 sm:text-sm">
                        {currentCase.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Scene progress — meaningful, compact */}
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-muted-foreground">
                        Scene {currentSceneIndex + 1} of {totalScenes}
                      </span>
                      <span className="font-bold text-foreground">
                        {currentCase.totalClues - cluesFound.length}{" "}
                        {currentCase.totalClues - cluesFound.length === 1
                          ? "clue"
                          : "clues"}{" "}
                        left to find
                      </span>
                    </div>
                    {/* Scene dots */}
                    <div className="mt-2.5 flex gap-1.5">
                      {Array.from({ length: totalScenes }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 0.3 + i * 0.06, duration: 0.3 }}
                          className={`h-1.5 flex-1 origin-left rounded-full ${
                            i < currentSceneIndex
                              ? "bg-primary"
                              : i === currentSceneIndex
                                ? "bg-gold"
                                : "bg-secondary"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Strongest CTA */}
                  <Button
                    onClick={() => navigate("/reading")}
                    className="mt-5 h-14 w-full rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-md transition-all duration-200 hover:translate-y-[-1px] hover:shadow-lg active:translate-y-0"
                  >
                    Continue Investigation
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right column — learning progress + quick links */}
          <div className="space-y-5 lg:col-span-2">
            {/* Learning progress — replaces rank emphasis */}
            <motion.div {...fadeUp} transition={{ delay: 0.18 }}>
              <Card className="rounded-2xl border-0 bg-card shadow-card">
                <CardContent className="p-5 sm:p-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    Reading Progress
                  </h3>

                  {/* Clue collection as learning measure */}
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-extrabold tracking-tight text-foreground">
                        {cluesFound.length}
                        <span className="text-lg text-muted-foreground">
                          /{currentCase.totalClues}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                        clues discovered
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-extrabold tracking-tight text-foreground">
                        {scenesRead}
                        <span className="text-lg text-muted-foreground">
                          /{totalScenes}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                        scenes read
                      </p>
                    </div>
                  </div>

                  {/* Clue progress bar with gold accent */}
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-gold to-gold/70"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(cluesFound.length / currentCase.totalClues) * 100}%`,
                      }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick links */}
            <motion.div {...fadeUp} transition={{ delay: 0.24 }}>
              <div className="space-y-2.5">
                {[
                  {
                    label: "Clue Board",
                    desc: `${cluesFound.length} clues collected`,
                    path: "/clues",
                    icon: <Search className="h-4 w-4" />,
                  },
                  {
                    label: "Tutor Insights",
                    desc: "See what AI learned about your reading",
                    path: "/tutor",
                    icon: <Brain className="h-4 w-4" />,
                  },
                  {
                    label: "Vocabulary Notes",
                    desc: "Words you've discovered",
                    path: "/vocabulary",
                    icon: <BookOpen className="h-4 w-4" />,
                  },
                ].map((link) => (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className="group flex w-full items-center gap-3.5 rounded-2xl border border-border/60 bg-card px-4 py-3.5 text-left shadow-card transition-all duration-200 hover:border-primary/15 hover:shadow-card-hover active:scale-[0.99]"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-colors duration-200 group-hover:bg-primary/8 group-hover:text-primary">
                      {link.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        {link.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{link.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground/40" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
