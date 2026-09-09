import { RESPONSIBLE_AI_RULES, jsonContract, type ModulePrompt } from "./shared";

export type MeetingPromptInput = {
  notes: string;
};

export function buildMeetingPrompt(input: MeetingPromptInput): ModulePrompt {
  const system = `ROLE:
You are a professional meeting analysis assistant.

TASK:
Organize the supplied raw meeting notes into a concise, structured summary.

CONTEXT:
Use the provided meeting notes only. They may be messy, partial or unpunctuated.

${RESPONSIBLE_AI_RULES}
- Never fabricate decisions, action items, people, dates, deadlines or responsibilities.
- Extract an action item only if the notes actually describe something to be done.
- If an action item has no named owner, set "owner" to "Not specified". If it has no date, set "deadline" to "Not specified".
- List every material gap (no decisions recorded, no owners named, no dates given, unclear attendees) in missingInformation.

QUALITY:
Preserve every important point, remove repetition, improve clarity. Keep the summary to at most 4 sentences.

${jsonContract(`{
  "summary": string,
  "keyPoints": string[],
  "decisions": string[],
  "actionItems": [{ "task": string, "owner": string, "deadline": string }],
  "deadlines": string[],
  "responsibilities": string[],
  "missingInformation": string[]
}`)}`;

  const user = `MEETING NOTES:
${input.notes.trim()}`;

  return { id: "meeting.summarize", system, user };
}
