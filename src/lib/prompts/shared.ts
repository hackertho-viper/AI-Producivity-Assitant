/**
 * Shared prompt scaffolding.
 *
 * Every AI module owns its own prompt file so it can be tested, compared and
 * refined independently. This file only holds the small pieces that are
 * genuinely common to all of them: the JSON output contract and the
 * Responsible-AI constraints that apply platform-wide.
 */

export type ModulePrompt = {
  /** Stable id used for logging and prompt comparison. */
  id: string;
  system: string;
  user: string;
};

export const RESPONSIBLE_AI_RULES = `RESPONSIBLE AI CONSTRAINTS (apply to every response):
- Never invent names, dates, numbers, statistics, quotations, sources, commitments, qualifications or responsibilities.
- Use only information the user supplied. If something required is missing, say it was not provided.
- Never present a guess as a fact. State uncertainty plainly.
- Do not claim to have performed an action outside of producing text.`;

export function jsonContract(shape: string) {
  return `OUTPUT FORMAT:
Return raw JSON only — no markdown fences, no commentary before or after.
The JSON must match this shape exactly:
${shape}
Use an empty string or empty array where you have nothing truthful to put.`;
}

/** Tolerant JSON extraction for model output that may wrap JSON in prose or fences. */
export function parseModelJson<T>(raw: string): T {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) text = fence[1].trim();
  try {
    return JSON.parse(text) as T;
  } catch {
    const start = text.search(/[[{]/);
    const end = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));
    if (start !== -1 && end > start) {
      return JSON.parse(text.slice(start, end + 1)) as T;
    }
    throw new Error("The AI response could not be read as structured data.");
  }
}
