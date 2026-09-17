// ─── Centralized AI JSON Pipeline ────────────────────────────────
// PIPELINE: request → clean → parse → validate → retry → fallback
//
// Design rules (enforced here, single source of truth):
//  - Request JSON-only output from the model
//  - Strip <think> blocks and markdown fences before parsing
//  - Safely extract JSON even with surrounding prose / doubled braces
//  - Validate every required field against an expected shape
//  - Retry ONCE with a stricter instruction if parse/validate fails
//  - Deterministic fallback from REAL session data — never fabricated
//  - Fallback results are clearly marked (source: "fallback")
//  - Parsing failures are logged for debugging
//  - Raw model output NEVER reaches the learner

// ─── Result envelope ─────────────────────────────────────────────

export type AIResult<T> = {
  data: T;
  source: "ai" | "ai-retry" | "fallback";
  /** Present when source === "fallback" — why the AI path failed */
  failureReason?: string;
};

// ─── Field validators ────────────────────────────────────────────

type FieldSpec =
  | { type: "string"; required: true; maxLen?: number }
  | { type: "string"; required: false; maxLen?: number }
  | { type: "number"; required: true; min?: number; max?: number }
  | { type: "number"; required: false; min?: number; max?: number }
  | { type: "enum"; required: true; values: string[] }
  | { type: "enum"; required: false; values: string[] };

type Schema = Record<string, FieldSpec>;

/** Normalize camelCase/snake_case keys so both are accepted */
function canonicalKey(key: string): string {
  return key.replace(/[_-]/g, "").toLowerCase();
}

function coerceString(v: unknown): string | null {
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return null;
}

function validateAgainstSchema(
  obj: Record<string, unknown>,
  schema: Schema,
): { ok: true; data: Record<string, unknown> } | { ok: false; missing: string[]; invalid: string[] } {
  const out: Record<string, unknown> = {};
  const missing: string[] = [];
  const invalid: string[] = [];

  // Index object by canonical key for flexible matching
  const byCanonical = new Map<string, unknown>();
  for (const [k, v] of Object.entries(obj)) {
    byCanonical.set(canonicalKey(k), v);
  }

  for (const [field, spec] of Object.entries(schema)) {
    const canon = canonicalKey(field);
    let value = byCanonical.get(canon);

    if (value === undefined || value === null) {
      if (spec.required) missing.push(field);
      continue;
    }

    if (spec.type === "string") {
      const s = coerceString(value);
      if (s === null) {
        invalid.push(field);
        continue;
      }
      out[field] = spec.maxLen ? s.slice(0, spec.maxLen) : s;
    } else if (spec.type === "number") {
      let n: number | null = null;
      if (typeof value === "number" && Number.isFinite(value)) n = value;
      else if (typeof value === "string") {
        const parsed = parseFloat(value);
        if (Number.isFinite(parsed)) n = parsed;
      }
      if (n === null) {
        // Required numeric fields that fail coerce → invalid (caller falls back)
        if (spec.required) invalid.push(field);
        continue;
      }
      if (spec.min !== undefined && n < spec.min) n = spec.min;
      if (spec.max !== undefined && n > spec.max) n = spec.max;
      out[field] = n;
    } else if (spec.type === "enum") {
      const s = coerceString(value)?.toLowerCase() ?? "";
      const match = spec.values.find((v) => v.toLowerCase() === s);
      if (!match) {
        if (spec.required) invalid.push(field);
        continue;
      }
      out[field] = match;
    }
  }

  if (missing.length > 0 || invalid.length > 0) {
    return { ok: false, missing, invalid };
  }
  return { ok: true, data: out };
}

// ─── JSON extraction ─────────────────────────────────────────────

/** Clean model output: strip think-blocks, code fences, stray prose */
export function cleanModelOutput(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<\/?thinking>/gi, "")
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();
}

/**
 * Extract the first VALID JSON object from cleaned text.
 * Handles: leading prose, doubled braces ({\n{...), trailing commentary.
 * Returns the parsed object or null.
 */
export function extractJsonObject(text: string): Record<string, unknown> | null {
  const cleaned = cleanModelOutput(text);
  const open: number[] = [];
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === "{") open.push(i);
  }

  // Try outermost-first, innermost-last — each with brace matching
  for (const start of open) {
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = start; i < cleaned.length; i++) {
      const ch = cleaned[i];
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = !inString;
      } else if (!inString) {
        if (ch === "{") depth++;
        else if (ch === "}") {
          depth--;
          if (depth === 0) {
            const candidate = cleaned.slice(start, i + 1);
            try {
              const parsed = JSON.parse(candidate);
              if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                return parsed as Record<string, unknown>;
              }
            } catch {
              break; // this start position can't yield valid JSON; try next
            }
          }
        }
      }
    }
  }
  return null;
}

// ─── Model calling ───────────────────────────────────────────────

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

export function getApiKey(): string | null {
  const key = process.env.OPENROUTER_API_KEY?.trim().replace(/^["']|["']$/g, "");
  return key || null;
}

async function callModel(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  jsonOnly: boolean,
): Promise<string> {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://detective-rewind.app",
      "X-Title": "Detective Rewind Tutor",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: jsonOnly
            ? `${systemPrompt}\n\nSTRICT OUTPUT RULES: Respond with ONLY a single valid JSON object. No markdown fences. No explanation before or after. No thinking out loud. Start your reply with { and end with }.`
            : systemPrompt,
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      // Nemotron reasoning needs headroom or the completion comes back empty
      max_tokens: 2000,
      ...(jsonOnly ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter API error ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// ─── The pipeline ────────────────────────────────────────────────

export type PipelineOptions<T> = {
  systemPrompt: string;
  userPrompt: string;
  schema: Schema;
  /** Required numeric fields with sane clamp ranges for retry diagnostics */
  label: string;
  /** Build deterministic fallback from real session data */
  fallback: () => T;
};

export async function runAIPipeline<T extends Record<string, unknown>>(
  opts: PipelineOptions<T>,
): Promise<AIResult<T>> {
  const apiKey = getApiKey();

  // No key → immediate deterministic fallback (still real data)
  if (!apiKey) {
    console.log(`[ai-pipeline:${opts.label}] no API key, using fallback`);
    return { data: opts.fallback(), source: "fallback", failureReason: "no-api-key" };
  }

  let lastError = "unknown";

  // Attempt 1: strict JSON mode. Attempt 2 adds a brief pause — free-tier
  // models often return empty completions when called back-to-back.
  for (let attempt = 1; attempt <= 2; attempt++) {
    const jsonOnly = attempt === 1;
    if (attempt === 2) {
      await new Promise((r) => setTimeout(r, 1500));
    }
    try {
      const raw = await callModel(
        opts.systemPrompt,
        attempt === 1
          ? opts.userPrompt
          : `${opts.userPrompt}\n\nREMINDER: Your previous reply was not valid JSON. Reply with ONLY a single valid JSON object matching the requested keys. Start with { and end with }.`,
        apiKey,
        jsonOnly,
      );

      if (!raw.trim()) {
        lastError = "empty-completion";
        console.warn(`[ai-pipeline:${opts.label}] attempt ${attempt}: empty completion`);
        continue;
      }

      const parsed = extractJsonObject(raw);
      if (!parsed) {
        lastError = "json-extraction-failed";
        console.warn(
          `[ai-pipeline:${opts.label}] attempt ${attempt}: JSON extraction failed. Raw (first 300):`,
          raw.slice(0, 300),
        );
        continue;
      }

      const validated = validateAgainstSchema(parsed, opts.schema);
      if (!validated.ok) {
        lastError = `validation-failed (missing: ${validated.missing.join(",")}; invalid: ${validated.invalid.join(",")})`;
        console.warn(`[ai-pipeline:${opts.label}] attempt ${attempt}:`, lastError);
        continue;
      }

      console.log(`[ai-pipeline:${opts.label}] success on attempt ${attempt}`);
      return {
        data: validated.data as T,
        source: attempt === 1 ? "ai" : "ai-retry",
      };
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
      console.warn(`[ai-pipeline:${opts.label}] attempt ${attempt} error:`, lastError);
    }
  }

  // Both attempts failed → deterministic fallback from REAL data
  console.warn(`[ai-pipeline:${opts.label}] falling back after: ${lastError}`);
  return { data: opts.fallback(), source: "fallback", failureReason: lastError };
}

// ─── Shared schemas ──────────────────────────────────────────────

export const TUTOR_CARD_SCHEMA: Schema = {
  strength: { type: "string", required: true, maxLen: 200 },
  primary_skill: { type: "string", required: true, maxLen: 200 },
  observed_difficulty: { type: "string", required: true, maxLen: 200 },
  evidence: { type: "string", required: true, maxLen: 300 },
  intervention: { type: "string", required: true, maxLen: 200 },
  learner_response: { type: "string", required: true, maxLen: 200 },
  recommended_activity: { type: "string", required: true, maxLen: 200 },
  ai_confidence: { type: "number", required: true, min: 0, max: 1 },
  reasoning: { type: "string", required: true, maxLen: 300 },
};

export const REASONING_EVAL_SCHEMA: Schema = {
  understanding: { type: "string", required: true, maxLen: 300 },
  reasoningQuality: { type: "string", required: true, maxLen: 300 },
  nextStep: { type: "string", required: true, maxLen: 250 },
  connectsToReading: { type: "string", required: true, maxLen: 250 },
  confidence: { type: "enum", required: true, values: ["high", "medium", "low"] },
};

/** Map snake_case model keys → internal camelCase with a number-safe confidence */
export function snakeToCamel<T extends Record<string, unknown>>(
  obj: Record<string, unknown>,
  map: Record<string, string>,
): T {
  const out: Record<string, unknown> = {};
  for (const [snake, camel] of Object.entries(map)) {
    if (obj[snake] !== undefined) out[camel] = obj[snake];
  }
  return out as T;
}
