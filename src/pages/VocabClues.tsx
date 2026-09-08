import { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useGame } from "@/lib/gameContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, CheckCircle2, Star } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45 },
};

export default function VocabClues() {
  const navigate = useNavigate();
  const { state } = useGame();

  const vocabWords = useMemo(() => {
    const seen = new Set<string>();
    const words: { word: string; definition: string; scene: string }[] = [];

    state.currentCase.scenes.forEach((scene: { vocabulary: { word: string; definition: string }[] }, i: number) => {
      scene.vocabulary.forEach((v: { word: string; definition: string }) => {
        if (!seen.has(v.word)) {
          seen.add(v.word);
          words.push({
            ...v,
            scene: `Scene ${i + 1}`,
          });
        }
      });
    });

    return words;
  }, [state.currentCase]);

  const totalWords = vocabWords.length;

  return (
    <main className="min-h-screen bg-[#f8f7f4] pb-24">
      <header className="px-5 pt-6 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Case Vocabulary
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
          Vocabulary Notes
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {totalWords} words discovered while investigating
        </p>
      </header>

      <div className="space-y-4 px-5">
        {/* Stats */}
        <motion.div {...fadeUp}>
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-0 bg-white shadow-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{totalWords}</p>
                  <p className="text-xs text-muted-foreground">Total Words</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white shadow-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                  <Star className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{totalWords}</p>
                  <p className="text-xs text-muted-foreground">Words Learned</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Word List */}
        <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
          <div className="space-y-2">
            {vocabWords.map((word, i) => (
              <motion.div
                key={word.word}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <Card className="border-0 bg-white shadow-sm">
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground">
                          {word.word}
                        </p>
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {word.scene}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
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
          <motion.div {...fadeUp} className="py-12 text-center">
            <p className="text-4xl mb-3">📖</p>
            <p className="text-sm font-medium text-muted-foreground">
              No vocabulary words yet. Start reading to discover new words!
            </p>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
          <Button
            onClick={() => navigate("/reading")}
            size="lg"
            className="w-full h-13 rounded-2xl text-sm font-semibold"
          >
            Continue Investigation
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
