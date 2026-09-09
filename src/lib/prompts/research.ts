import { RESPONSIBLE_AI_RULES, jsonContract, type ModulePrompt } from "./shared";

export type ResearchPromptInput = {
  question: string;
  sourceMaterial: string;
};

export function buildResearchPrompt(input: ResearchPromptInput): ModulePrompt {
  const hasSource = input.sourceMaterial.trim().length > 0;

  const system = `ROLE:
You are a professional research and information-analysis assistant.

TASK:
Analyze the user's question${hasSource ? " using the supplied source material as the primary basis" : ""} and return a structured report.

CONTEXT:
${
  hasSource
    ? "Source material was supplied. Prioritize it over general knowledge. Whenever the material does not answer part of the question, say so explicitly and add it to notAvailableInSource."
    : "No source material was supplied. Answer from general knowledge, be explicit about uncertainty, and never present an estimate as a measured figure."
}

${RESPONSIBLE_AI_RULES}
- Never fabricate sources, citations, statistics, quotations, study names or dates.
- Do not attribute claims to named organizations or people unless the supplied material does.

QUALITY:
Clear, useful, concise and transparent about uncertainty. Keep the simplified explanation plain enough for a non-specialist colleague.

${jsonContract(`{
  "executiveSummary": string,
  "keyInsights": string[],
  "recommendations": string[],
  "simplifiedExplanation": string,
  "notAvailableInSource": string[],
  "verificationAdvice": string
}`)}`;

  const user = `QUESTION / TOPIC:
${input.question.trim()}

SOURCE MATERIAL:
${hasSource ? input.sourceMaterial.trim() : "(none provided)"}`;

  return { id: hasSource ? "research.with-source" : "research.general", system, user };
}
