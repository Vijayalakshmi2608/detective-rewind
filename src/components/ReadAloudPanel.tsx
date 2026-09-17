import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Square,
  Loader2,
  AlertCircle,
  Gauge,
  Target,
  Repeat2,
} from "lucide-react";
import { useSpeechRecognition } from "@/lib/useSpeechRecognition";
import {
  computeReadingMetrics,
  describeFluency,
  speechErrorMessage,
  type ReadingMetrics,
} from "@/lib/readingMetrics";

type Props = {
  /** The witness statement the child reads aloud */
  targetText: string;
  /** Called once when the child finishes a valid reading attempt */
  onComplete?: (m: ReadingMetrics | null) => void;
};

type Phase = "idle" | "listening" | "processing" | "done";

export function ReadAloudPanel({ targetText, onComplete }: Props) {
  const {
    supported,
    listening,
    interim,
    finalTranscript,
    error,
    elapsedMs,
    start,
    stop,
    reset,
  } = useSpeechRecognition("en-US");

  const [phase, setPhase] = useState<Phase>("idle");
  const [metrics, setMetrics] = useState<ReadingMetrics | null>(null);

  const targetWordCount = useMemo(
    () => targetText.split(/\s+/).filter(Boolean).length,
    [targetText],
  );

  const handleStart = () => {
    reset();
    setMetrics(null);
    start();
    setPhase("listening");
  };

  const handleStop = () => {
    stop();
    setPhase("processing");
    // Capture the final transcript now — it won't change after stop
    const transcript = finalTranscript;
    const sec = elapsedMs > 0 ? elapsedMs / 1000 : 0;
    // Brief processing beat so the state transition is visible, then score
    setTimeout(() => {
      const m = computeReadingMetrics(transcript, targetText, sec);
      setMetrics(m);
      setPhase("done");
      onComplete?.(m.insufficientData ? null : m);
    }, 600);
  };

  return (
    <div className="rounded-2xl border border-gold/20 bg-gold/[0.04] p-5 sm:p-6">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-gold">
          <Mic className="h-4 w-4" />
          Read this statement aloud
        </p>
        {supported && (
          <span className="text-[11px] font-medium text-muted-foreground">
            {targetWordCount} words
          </span>
        )}
      </div>

      {/* Idle / unsupported */}
      {phase === "idle" && (
        <div className="mt-4">
          {supported ? (
            <>
              <button
                onClick={handleStart}
                className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-md transition-all duration-200 hover:translate-y-[-1px] hover:shadow-lg active:translate-y-0 sm:w-auto sm:px-10"
              >
                <Mic className="h-5 w-5" />
                🎙️ Start Reading
              </button>
              <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
                Your voice stays on this device — it powers your fluency
                feedback.
              </p>
            </>
          ) : (
            <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-secondary/50 p-3.5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {speechErrorMessage("not-supported")}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Listening */}
      {phase === "listening" && (
        <div className="mt-4">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-primary/15 bg-card p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Live mic with pulse rings */}
                <span className="relative flex h-10 w-10 items-center justify-center">
                  <motion.span
                    className="absolute inline-flex h-full w-full rounded-full bg-gold/30"
                    animate={{ scale: [1, 1.5], opacity: [0.7, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                  />
                  <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gold/15">
                    <Mic className="h-4 w-4 text-gold" />
                  </span>
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    AI is listening…
                  </p>
                  <p className="text-xs tabular-nums text-muted-foreground">
                    {(elapsedMs / 1000).toFixed(1)}s
                  </p>
                </div>
              </div>
              <button
                onClick={handleStop}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-all duration-200 hover:bg-primary/90 active:scale-95"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
                Done
              </button>
            </div>

            {/* Live words appearing — real transcript only */}
            <div
              data-transcript
              className="mt-3 min-h-[2.5rem] rounded-xl bg-secondary/50 px-3.5 py-2.5"
            >
              {interim ? (
                <p className="text-[13px] italic leading-relaxed text-foreground/60">
                  "{interim}"
                </p>
              ) : (
                <p className="text-[13px] text-muted-foreground/50">
                  Start reading — your words appear here…
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Processing */}
      {phase === "processing" && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4">
          <Loader2 className="h-4 w-4 animate-spin text-gold" />
          <p className="text-sm font-medium text-muted-foreground">
            Checking your reading…
          </p>
        </div>
      )}

      {/* Error */}
      {error && phase !== "listening" && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200/60 bg-amber-50/60 p-3.5">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-[13px] leading-relaxed text-amber-800">
            {speechErrorMessage(error)}
          </p>
        </div>
      )}

      {/* Results — ONLY metrics computed from real data */}
      <AnimatePresence>
        {phase === "done" && metrics && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            {metrics.insufficientData ? (
              <div className="rounded-xl border border-border/60 bg-secondary/50 p-3.5">
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  {metrics.insufficientReason}
                </p>
                <button
                  onClick={handleStart}
                  className="mt-2.5 text-[13px] font-bold text-gold hover:underline"
                >
                  Try reading again
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2.5">
                  {/* Fluency */}
                  <div className="rounded-xl border border-border/50 bg-card p-3 text-center">
                    <Gauge className="mx-auto h-4 w-4 text-gold" />
                    <p className="mt-1 text-xl font-extrabold tabular-nums tracking-tight text-foreground">
                      {metrics.wcpm}
                    </p>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      words/min
                    </p>
                    <p className="mt-0.5 text-[10px] font-bold text-foreground/70">
                      {
                        describeFluency(metrics.wcpm).label
                      }
                    </p>
                  </div>
                  {/* Accuracy */}
                  <div className="rounded-xl border border-border/50 bg-card p-3 text-center">
                    <Target className="mx-auto h-4 w-4 text-gold" />
                    <p className="mt-1 text-xl font-extrabold tabular-nums tracking-tight text-foreground">
                      {metrics.accuracyPct}%
                    </p>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      word accuracy
                    </p>
                  </div>
                  {/* Self-correction */}
                  <div className="rounded-xl border border-border/50 bg-card p-3 text-center">
                    <Repeat2 className="mx-auto h-4 w-4 text-gold" />
                    <p className="mt-1 text-xl font-extrabold tabular-nums tracking-tight text-foreground">
                      {metrics.selfCorrections}
                    </p>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      self-fixes
                    </p>
                  </div>
                </div>
                <p className="mt-2.5 text-center text-xs text-muted-foreground">
                  Self-fixing words is a real detective reading skill 👏
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
