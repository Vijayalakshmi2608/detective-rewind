import type { SpeechError } from "./useSpeechRecognition";

// ─── Reading Metrics — computed ONLY from real captured data ─────

export type ReadingMetrics = {
  wcpm: number; // words correct per minute
  totalWords: number;
  targetWords: number;
  accuracyPct: number; // word-level accuracy from best-effort alignment
  selfCorrections: number; // repeated/repaired fragments detected in transcript
  durationSec: number;
  completionRatio: number; // how much of the target text was captured
  insufficientData: boolean; // true when metrics shouldn't be shown
  insufficientReason?: string;
};

// Strip punctuation & lowercase for comparison
function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s']/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

// Longest-common-subsequence word alignment — honest, no fabrication
function lcsAlignment(target: string[], spoken: string[]) {
  const m = target.length;
  const n = spoken.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0),
  );
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] =
        target[i] === spoken[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  let matches = 0;
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (target[i] === spoken[j]) {
      matches++;
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }
  return matches;
}

// Self-correction heuristic: same word cluster repeated close together
// (child says a word, stops, repeats it correctly — a real fluency signal)
function countSelfCorrections(transcript: string): number {
  const words = normalize(transcript);
  let count = 0;
  const window = 4; // look back up to 4 words
  for (let k = window; k < words.length; k++) {
    for (let back = 1; back <= window; back++) {
      if (words[k] === words[k - back] && words[k].length > 2) {
        count++;
        break;
      }
    }
  }
  return count;
}

export function computeReadingMetrics(
  transcript: string,
  targetText: string,
  durationSec: number,
): ReadingMetrics {
  const target = normalize(targetText);
  const spoken = normalize(transcript);

  const base: ReadingMetrics = {
    wcpm: 0,
    totalWords: spoken.length,
    targetWords: target.length,
    accuracyPct: 0,
    selfCorrections: 0,
    durationSec,
    completionRatio: 0,
    insufficientData: true,
  };

  // Guard: too short to say anything meaningful
  if (spoken.length < 5 || durationSec < 3) {
    return {
      ...base,
      insufficientReason:
        "Very little speech was captured. Try reading the whole statement aloud.",
    };
  }

  const matches = lcsAlignment(target, spoken);
  const accuracyPct = Math.round((matches / target.length) * 100);
  const completionRatio = matches / target.length;

  // Guard: transcript doesn't resemble the target (wrong language, noise)
  if (accuracyPct < 25) {
    return {
      ...base,
      matchesHint: undefined,
      insufficientReason:
        "We couldn't match your reading to the statement. Find a quiet spot and try again.",
    } as ReadingMetrics;
  }

  const minutes = Math.max(durationSec, 1) / 60;
  const wcpm = Math.round(matches / minutes);
  const selfCorrections = countSelfCorrections(transcript);

  return {
    wcpm,
    totalWords: spoken.length,
    targetWords: target.length,
    accuracyPct,
    selfCorrections,
    durationSec: Math.round(durationSec * 10) / 10,
    completionRatio,
    insufficientData: false,
  };
}

export function describeFluency(wcpm: number): {
  label: string;
  tone: "great" | "good" | "practice";
} {
  // Age 7–10 oral reading norms: ~60–120+ WCPM; encouraging bands
  if (wcpm >= 100) return { label: "Great pace!", tone: "great" };
  if (wcpm >= 60) return { label: "Good pace", tone: "good" };
  return { label: "Building pace", tone: "practice" };
}

export function speechErrorMessage(error: SpeechError): string {
  switch (error) {
    case "not-supported":
      return "This browser doesn't support microphone reading. You can still read silently and answer the question.";
    case "permission":
      return "Microphone access was blocked. Enable it in your browser settings to read aloud.";
    case "no-speech":
      return "We didn't hear anything. Make sure your microphone is on and try again.";
    case "network":
      return "Speech recognition needs a connection. Check your network and try again.";
    default:
      return "Something went wrong with listening. Please try again.";
  }
}
