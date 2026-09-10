import { RESPONSIBLE_AI_RULES, jsonContract, type ModulePrompt } from "./shared";

export type EmailAudience = "Client" | "Manager" | "Team" | "Other";
export type EmailTone = "Formal" | "Friendly" | "Persuasive";
export type EmailRefinement = "regenerate" | "shorter" | "more-formal";

export type EmailPromptInput = {
  purpose: string;
  context: string;
  audience: EmailAudience;
  tone: EmailTone;
  refinement: EmailRefinement;
  currentSubject?: string | undefined;
  currentBody?: string | undefined;
};

const AUDIENCE_GUIDE: Record<EmailAudience, string> = {
  Client:
    "External client. Be courteous and professional, avoid internal jargon, make next steps explicit.",
  Manager:
    "Direct manager. Lead with the outcome, be concise, make any request or decision needed obvious.",
  Team: "Internal colleagues. Be collaborative and direct, plain language, clear ownership of next steps.",
  Other: "Unspecified professional recipient. Stay neutral, courteous and broadly appropriate.",
};

const TONE_GUIDE: Record<EmailTone, string> = {
  Formal: "Formal register, complete sentences, no contractions, no slang, no exclamation marks.",
  Friendly: "Warm and approachable while still professional. Contractions are fine.",
  Persuasive: "Motivate action with clear reasoning and benefits. Never overstate or pressure.",
};

const REFINEMENT_GUIDE: Record<EmailRefinement, string> = {
  regenerate: "Write a fresh draft. Vary the structure and phrasing from any previous attempt.",
  shorter:
    "Rewrite the existing draft to be materially shorter while keeping every substantive point. Remove padding, not meaning.",
  "more-formal":
    "Rewrite the existing draft in a more formal register without adding any new information.",
};

export function buildEmailPrompt(input: EmailPromptInput): ModulePrompt {
  const system = `ROLE:
You are a professional workplace communication assistant.

TASK:
Generate a context-appropriate workplace email based only on the purpose and context the user supplies.

AUDIENCE:
${AUDIENCE_GUIDE[input.audience]}

TONE:
${TONE_GUIDE[input.tone]}

${RESPONSIBLE_AI_RULES}
- Do not invent recipient names, sender names, company names, prices, dates or meeting times.
- Use neutral placeholders such as "[Recipient name]" or "[date]" when a detail is required but was not provided, and list every such gap in missingInformation.

QUALITY:
Clear, concise, grammatically correct, appropriate for the selected audience and tone. No filler.

${jsonContract(`{
  "subject": string,
  "body": string,
  "missingInformation": string[]
}`)}`;

  const user = `PURPOSE:
${input.purpose.trim()}

CONTEXT PROVIDED BY USER:
${input.context.trim() || "(none provided)"}

REFINEMENT INSTRUCTION:
${REFINEMENT_GUIDE[input.refinement]}${
    input.refinement !== "regenerate" && input.currentBody
      ? `

EXISTING DRAFT TO REWRITE:
Subject: ${input.currentSubject ?? ""}
Body:
${input.currentBody}`
      : ""
  }`;

  return { id: `email.${input.refinement}`, system, user };
}
