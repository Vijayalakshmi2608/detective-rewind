import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  Search,
  Sparkles,
  Trophy,
  Shield,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      {/* Hero */}
      <section className="relative px-5 pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gold/8 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
          {/* Subtle case-file grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <motion.div
          className="relative mx-auto max-w-lg text-center"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          {/* Badge */}
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/8 px-4 py-1.5 text-xs font-semibold tracking-wide text-gold">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
              </span>
              AI-POWERED READING ADVENTURE
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={fadeUp}
            className="mt-8 text-[2.75rem] font-extrabold tracking-tight text-foreground leading-[1.08] sm:text-6xl"
          >
            Detective
            <br />
            <span className="relative">
              <span className="relative z-10">Rewind</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-gold/20 -rotate-[0.5deg] z-0" />
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 text-base leading-relaxed text-muted-foreground max-w-sm mx-auto sm:text-lg"
          >
            Step into the role of a detective. Read witness statements, gather
            evidence, and solve mysteries — one clue at a time.
          </motion.p>

          {/* CTA */}
          <motion.div variants={fadeUp} className="mt-10 space-y-3">
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="w-full h-14 rounded-2xl text-base font-bold bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-1px]"
            >
              Start Your First Case
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              variant="ghost"
              size="lg"
              className="w-full h-12 rounded-2xl text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Continue as Guest
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="px-5 pb-24 sm:px-8">
        <motion.div
          className="mx-auto max-w-lg space-y-4 sm:space-y-5"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
        >
          <motion.div variants={fadeUp}>
            <h2 className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              How It Works
            </h2>
          </motion.div>

          {[
            {
              icon: <BookOpen className="h-5 w-5" />,
              title: "Read the Story",
              description:
                "Every mystery begins with a reading. Passages contain the clues you need — but you have to pay attention.",
              num: "01",
            },
            {
              icon: <Search className="h-5 w-5" />,
              title: "Investigate & Deduce",
              description:
                "Analyze witness statements, spot contradictions, and answer questions to unlock clues.",
              num: "02",
            },
            {
              icon: <Sparkles className="h-5 w-5" />,
              title: "AI-Powered Feedback",
              description:
                "Get instant, encouraging feedback on your reasoning. Learn vocabulary naturally as you investigate.",
              num: "03",
            },
            {
              icon: <Trophy className="h-5 w-5" />,
              title: "Solve & Rank Up",
              description:
                "Solve the mystery, collect all clues, and earn your detective rank. Each case makes you sharper.",
              num: "04",
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              className="group flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-card transition-shadow duration-300 hover:shadow-card-hover sm:p-6"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                {feature.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-widest text-gold">
                    {feature.num}
                  </span>
                  <p className="text-sm font-bold text-foreground">
                    {feature.title}
                  </p>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* The Core Loop */}
      <section className="px-5 pb-24 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-lg"
        >
          <h2 className="mb-6 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            The Investigation Loop
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
            {[
              "Read",
              "Understand",
              "Struggle",
              "AI Detects Why",
              "Rewind",
              "Retry",
              "Learn",
              "Adapt",
              "Solve",
            ].map((step, i) => (
              <span key={step} className="flex items-center gap-2">
                <span
                  className={`rounded-lg px-3 py-1.5 ${
                    step === "Rewind"
                      ? "bg-gold/15 text-gold border border-gold/20"
                      : step === "Solve"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground border border-border/60"
                  }`}
                >
                  {step}
                </span>
                {i < 8 && (
                  <span className="text-muted-foreground/40 hidden sm:inline">
                    →
                  </span>
                )}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Social Proof */}
      <section className="px-5 pb-24 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-lg rounded-2xl bg-card p-6 text-center shadow-card sm:p-8"
        >
          <div className="flex justify-center gap-0.5 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className="text-lg text-gold">
                ★
              </span>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground italic">
            "My daughter asks to play Detective Rewind every day. She's reading
            more than ever and doesn't even realize she's learning."
          </p>
          <p className="mt-4 text-xs font-bold text-foreground">
            — Parent of an 8-year-old detective
          </p>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="px-5 pb-28 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-lg text-center"
        >
          <div className="mb-5 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10 text-2xl">
              <Shield className="h-6 w-6 text-gold" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            Ready to crack your first case?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Join thousands of young detectives solving mysteries through reading.
          </p>
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="mt-8 w-full h-14 rounded-2xl text-base font-bold bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-1px]"
          >
            Start Investigating
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </section>
    </main>
  );
}
