import { useCallback, useEffect, useRef, useState } from "react";

// ─── Minimal Web Speech API typings (browser-native, no deps) ────

interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence: number;
}
interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike;
  isFinal: boolean;
  length: number;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: { length: number } & Record<number, SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

export type SpeechError =
  | "not-supported"
  | "permission"
  | "no-speech"
  | "network"
  | "unknown";

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  const c = (w.SpeechRecognition ?? w.webkitSpeechRecognition) as
    | SpeechRecognitionCtor
    | undefined;
  return typeof c === "function" ? c : null;
}

/**
 * Real on-device speech recognition (Web Speech API).
 * Transcripts never leave the browser — metrics are computed locally.
 */
export function useSpeechRecognition(lang = "en-US") {
  const [supported] = useState<boolean>(() => getCtor() !== null);
  const [listening, setListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<SpeechError | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const startRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* already stopped */
    }
    clearTimer();
    setListening(false);
    if (startRef.current) setElapsedMs(Date.now() - startRef.current);
  }, [clearTimer]);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) {
      setError("not-supported");
      return;
    }
    setError(null);
    setFinalTranscript("");
    setInterim("");
    setElapsedMs(0);

    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e) => {
      let fin = "";
      let inter = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) fin += r[0].transcript + " ";
        else inter += r[0].transcript + " ";
      }
      if (fin) {
        setFinalTranscript((prev) =>
          (prev + " " + fin).replace(/\s+/g, " ").trim(),
        );
      }
      setInterim(inter.trim());
    };

    rec.onerror = (e) => {
      const map: Record<string, SpeechError> = {
        "not-allowed": "permission",
        "service-not-allowed": "permission",
        "no-speech": "no-speech",
        network: "network",
        aborted: "unknown",
      };
      setError(map[e.error] ?? "unknown");
    };

    rec.onend = () => {
      setListening(false);
      clearTimer();
      if (startRef.current) setElapsedMs(Date.now() - startRef.current);
    };

    recRef.current = rec;
    startRef.current = Date.now();
    try {
      rec.start();
      setListening(true);
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startRef.current);
      }, 250);
    } catch {
      setError("unknown");
      setListening(false);
    }
  }, [lang, clearTimer]);

  const reset = useCallback(() => {
    setFinalTranscript("");
    setInterim("");
    setError(null);
    setElapsedMs(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        recRef.current?.abort();
      } catch {
        /* noop */
      }
      clearTimer();
    };
  }, [clearTimer]);

  const fullTranscript = (finalTranscript + " " + interim)
    .replace(/\s+/g, " ")
    .trim();

  return {
    supported,
    listening,
    finalTranscript,
    interim,
    fullTranscript,
    error,
    elapsedMs,
    start,
    stop,
    reset,
  };
}
