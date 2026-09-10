import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const LOVABLE_AIG_RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";

function createRunIdFetch(initialRunId?: string) {
  let runId = initialRunId?.trim() || undefined;

  return {
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      if (runId && !headers.has(LOVABLE_AIG_RUN_ID_HEADER)) {
        headers.set(LOVABLE_AIG_RUN_ID_HEADER, runId);
      }
      const response = await fetch(input, { ...init, headers });
      const next = response.headers.get(LOVABLE_AIG_RUN_ID_HEADER)?.trim();
      if (!runId && next) runId = next;
      return response;
    },
    getRunId: () => runId,
  };
}

export function createLovableAiGatewayProvider(lovableApiKey: string, initialRunId?: string) {
  const runIdFetch = createRunIdFetch(initialRunId);

  const provider = createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": lovableApiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
    fetch: runIdFetch.fetch as typeof fetch,
  });

  return Object.assign(provider, { getRunId: runIdFetch.getRunId });
}

/** Model used by every module. Prompt logic stays per-module. */
export const WORKPLACE_MODEL = "openai/gpt-6-astra";

/** Turns a gateway/SDK failure into a message that is safe and useful to show a user. */
export function describeAiError(error: unknown): string {
  const anyErr = error as { statusCode?: number; status?: number; message?: string } | undefined;
  const status = anyErr?.statusCode ?? anyErr?.status;

  if (status === 429) {
    return "The AI service is rate limited right now. Please wait a moment and try again.";
  }
  if (status === 402) {
    return "This workspace has run out of AI credits. The workspace owner needs to add credits before AI features will work again.";
  }
  if (status === 403) {
    return "AI access is blocked for this workspace by an administrator setting or credit limit.";
  }
  if (status === 401) {
    return "The AI service is not configured correctly (missing or invalid API key).";
  }
  if (status && status >= 500) {
    return "The AI service had a temporary problem. Please try again.";
  }
  if (anyErr?.message) return anyErr.message;
  return "The AI request failed. Please try again.";
}
