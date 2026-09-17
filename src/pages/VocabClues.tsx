import { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useGame } from "@/lib/gameContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, CheckCircle2, Star } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
};

export default function VocabClues() {
  const navigate = useNavigate();
  const { state } = useGame();

  const vocabWords = useMemo(() => {
    const seen = new Set<string>();
    const words: { word: string; definition: string; scene: string }[] = [];

    state.currentCase.scenes.forEach(
      (scene: { vocabulary: { word: string; definition: string }[] }, i: number) => {
        scene.vocabulary.forEach((v: { word: string; definition: string }) => {
          if (!seen.has(v.word)) {
            seen.add(v.word);
            words.push({
              ...v,
              scene: `Scene ${i + 1}`,
            });
          }
        });
      },
    );

    return words;
  }, [state.currentCase]);

  const totalWords = vocabWords.length;

  return (
    <main className="min-h-screen bg-background pb-28">
      <header className="px-5 pt-8 pb-5 sm:px-8 sm:pt-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
          Case Vocabulary
        </p>
        <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Vocabulary Notes
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground font-medium">
          {totalWords} words discovered while investigating
        </p>
      </header>

      <div className="space-y-5 px-5 sm:px-8">
        {/* Stats */}
        <motion.div {...fadeUp}>
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-0 bg-card shadow-card">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-foreground tracking-tight">{totalWords}</p>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Total Words</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-card shadow-card">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10">
                  <Star className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-foreground tracking-tight">{totalWords}</p>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Words Learned</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Word List */}
        <motion.div {...fadeUp} transition={{ delay: 0.08 }}>
          <div className="space-y-2.5">
            {vocabWords.map((word, i) => (
              <motion.div
                key={word.word}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * i }}
              >
                <Card className="border-0 bg-card shadow-card">
                  <CardContent className="flex items-start gap-3 p-4 sm:p-5">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gold/10">
                      <CheckCircle2 className="h-3.5 w-3.5 text-gold" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground">
                          {word.word}
                        </p>
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-2 py-0 font-semibold"
                        >
                          {word.scene}
                        </Badge>
                      </div>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                        {word.definition}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {totalWords === 0 && (
          <motion.div {...fadeUp} className="py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-3xl mb-4">
              📖
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              No vocabulary words yet. Start reading to discover new words!
            </p>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
          <Button
            onClick={() => navigate("/reading")}
            size="lg"
            className="w-full h-14 rounded-2xl text-sm font-bold bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-1px]"
          >
            Continue Investigation
            <ArrowRight className="ml-2 h-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
