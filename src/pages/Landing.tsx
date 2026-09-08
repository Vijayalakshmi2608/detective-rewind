import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  Search,
  Shield,
  Sparkles,
  Trophy,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#f8f7f4] overflow-hidden">
      {/* Hero */}
      <section className="relative px-5 pt-16 pb-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-primary/3 blur-3xl" />
        </div>

        <motion.div
          className="relative mx-auto max-w-lg text-center"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          {/* Badge */}
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              AI-Powered Reading Adventure
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={fadeUp}
            className="mt-6 text-5xl font-extrabold tracking-tight text-foreground leading-[1.1]"
          >
            Detective
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              Rewind
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-5 text-base leading-relaxed text-muted-foreground max-w-sm mx-auto"
          >
            Step into the role of a detective. Read witness statements, gather
            evidence, and solve mysteries — one clue at a time.
          </motion.p>

          {/* CTA */}
          <motion.div variants={fadeUp} className="mt-8 space-y-3">
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="w-full h-14 rounded-2xl text-base font-semibold bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Start Your First Case
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              variant="ghost"
              size="lg"
              className="w-full h-12 rounded-2xl text-sm font-medium text-muted-foreground"
            >
              Continue as Guest
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-5 pb-20">
        <motion.div
          className="mx-auto max-w-lg space-y-4"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
        >
          <motion.div variants={fadeUp}>
            <h2 className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
              How It Works
            </h2>
          </motion.div>

          {[
            {
              icon: <BookOpen className="h-5 w-5" />,
              title: "Read the Story",
              description:
                "Every mystery begins with a reading. Passages contain the clues you need — but you have to pay attention.",
              emoji: "📖",
            },
            {
              icon: <Search className="h-5 w-5" />,
              title: "Investigate & Deduce",
              description:
                "Analyze witness statements, spot contradictions, and answer questions to unlock clues.",
              emoji: "🔍",
            },
            {
              icon: <Sparkles className="h-5 w-5" />,
              title: "AI-Powered Feedback",
              description:
                "Get instant, encouraging feedback on your reasoning. Learn vocabulary naturally as you investigate.",
              emoji: "✨",
            },
            {
              icon: <Trophy className="h-5 w-5" />,
              title: "Solve & Rank Up",
              description:
                "Solve the mystery, collect all clues, and earn your detective rank. Each case makes you sharper.",
              emoji: "🏆",
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              className="flex items-start gap-4 rounded-2xl border border-border/60 bg-white p-5 shadow-sm"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl">
                {feature.emoji}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  {feature.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Social Proof / Trust */}
      <section className="px-5 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-lg rounded-2xl bg-white p-6 text-center shadow-sm"
        >
          <div className="flex justify-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className="text-lg text-amber-400">
                ★
              </span>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground italic">
            "My daughter asks to play Detective Rewind every day. She's reading
            more than ever and doesn't even realize she's learning."
          </p>
          <p className="mt-3 text-xs font-semibold text-foreground">
            — Parent of a 8-year-old detective
          </p>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="px-5 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-lg text-center"
        >
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
              🕵️
            </div>
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Ready to crack your first case?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Join thousands of young detectives solving mysteries through reading.
          </p>
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="mt-6 w-full h-14 rounded-2xl text-base font-semibold bg-primary text-primary-foreground shadow-lg"
          >
            Start Investigating
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </section>
    </main>
  );
}
