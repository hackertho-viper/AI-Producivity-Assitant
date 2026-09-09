import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

import { createLovableAiGatewayProvider, WORKPLACE_MODEL, describeAiError } from "./ai-gateway.server";
import { parseModelJson, type ModulePrompt } from "./prompts/shared";
import { buildEmailPrompt } from "./prompts/email";
import { buildMeetingPrompt } from "./prompts/meeting";
import { buildPlanPrompt, buildPrioritizePrompt } from "./prompts/tasks";
import { buildResearchPrompt } from "./prompts/research";
import { buildChatSystemPrompt, type ChatTurn } from "./prompts/chat";

async function runPrompt(prompt: ModulePrompt, extraMessages: ChatTurn[] = []) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) {
    throw new Error("AI is not configured for this project yet (missing LOVABLE_API_KEY).");
  }

  const gateway = createLovableAiGatewayProvider(key);

  try {
    const result = await generateText({
      model: gateway(WORKPLACE_MODEL),
      system: prompt.system,
      messages: [
        ...extraMessages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: prompt.user },
      ],
    });
    return result.text;
  } catch (error) {
    throw new Error(describeAiError(error));
  }
}

async function runJsonPrompt<T>(prompt: ModulePrompt): Promise<T> {
  const text = await runPrompt(prompt);
  return parseModelJson<T>(text);
}

/* ---------------------------------- email --------------------------------- */

const emailInput = z.object({
  purpose: z.string().min(5),
  context: z.string().default(""),
  audience: z.enum(["Client", "Manager", "Team", "Other"]),
  tone: z.enum(["Formal", "Friendly", "Persuasive"]),
  refinement: z.enum(["regenerate", "shorter", "more-formal"]).default("regenerate"),
  currentSubject: z.string().optional(),
  currentBody: z.string().optional(),
});

export type EmailResult = {
  subject: string;
  body: string;
  missingInformation: string[];
};

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => emailInput.parse(data))
  .handler(async ({ data }) => {
    const result = await runJsonPrompt<EmailResult>(buildEmailPrompt(data));
    return {
      subject: result.subject ?? "",
      body: result.body ?? "",
      missingInformation: result.missingInformation ?? [],
    };
  });

/* --------------------------------- meeting -------------------------------- */

const meetingInput = z.object({ notes: z.string().min(30) });

export type MeetingResult = {
  summary: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: Array<{ task: string; owner: string; deadline: string }>;
  deadlines: string[];
  responsibilities: string[];
  missingInformation: string[];
};

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => meetingInput.parse(data))
  .handler(async ({ data }) => {
    const r = await runJsonPrompt<MeetingResult>(buildMeetingPrompt(data));
    return {
      summary: r.summary ?? "",
      keyPoints: r.keyPoints ?? [],
      decisions: r.decisions ?? [],
      actionItems: (r.actionItems ?? []).filter((a) => a && a.task),
      deadlines: r.deadlines ?? [],
      responsibilities: r.responsibilities ?? [],
      missingInformation: r.missingInformation ?? [],
    };
  });

/* ---------------------------------- tasks --------------------------------- */

const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().default(""),
  deadline: z.string().default(""),
  urgency: z.string(),
  importance: z.string(),
  category: z.string().default(""),
});

const prioritizeInput = z.object({
  tasks: z.array(taskSchema).min(1),
  context: z.string().default(""),
});

export type PrioritizeResult = {
  priorities: Array<{ id: string; priority: "High" | "Medium" | "Low"; reasoning: string }>;
  notes: string;
};

export const prioritizeTasks = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => prioritizeInput.parse(data))
  .handler(async ({ data }) => {
    const r = await runJsonPrompt<PrioritizeResult>(
      buildPrioritizePrompt({ ...data, today: new Date().toISOString().slice(0, 10) }),
    );
    return { priorities: r.priorities ?? [], notes: r.notes ?? "" };
  });

const planInput = z.object({
  tasks: z.array(taskSchema).min(1),
  horizon: z.enum(["daily", "weekly"]),
  context: z.string().default(""),
});

export type PlanResult = {
  blocks: Array<{ label: string; items: Array<{ time: string; title: string; note: string }> }>;
  suggestions: string[];
  missingInformation: string[];
};

export const generatePlan = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => planInput.parse(data))
  .handler(async ({ data }) => {
    const r = await runJsonPrompt<PlanResult>(
      buildPlanPrompt({ ...data, today: new Date().toISOString().slice(0, 10) }),
    );
    return {
      blocks: (r.blocks ?? []).map((b) => ({ label: b.label ?? "", items: b.items ?? [] })),
      suggestions: r.suggestions ?? [],
      missingInformation: r.missingInformation ?? [],
    };
  });

/* -------------------------------- research -------------------------------- */

const researchInput = z.object({
  question: z.string().min(8),
  sourceMaterial: z.string().default(""),
});

export type ResearchResult = {
  executiveSummary: string;
  keyInsights: string[];
  recommendations: string[];
  simplifiedExplanation: string;
  notAvailableInSource: string[];
  verificationAdvice: string;
};

export const runResearch = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => researchInput.parse(data))
  .handler(async ({ data }) => {
    const r = await runJsonPrompt<ResearchResult>(buildResearchPrompt(data));
    return {
      executiveSummary: r.executiveSummary ?? "",
      keyInsights: r.keyInsights ?? [],
      recommendations: r.recommendations ?? [],
      simplifiedExplanation: r.simplifiedExplanation ?? "",
      notAvailableInSource: r.notAvailableInSource ?? [],
      verificationAdvice: r.verificationAdvice ?? "",
    };
  });

/* ---------------------------------- chat ---------------------------------- */

const chatInput = z.object({
  message: z.string().min(1),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .default([]),
  workspaceSnapshot: z.object({
    activeTasks: z.number(),
    completedTasks: z.number(),
    emailsGenerated: z.number(),
    meetingsSummarized: z.number(),
    researchSessions: z.number(),
  }),
});

export const chatReply = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => chatInput.parse(data))
  .handler(async ({ data }) => {
    const prompt = buildChatSystemPrompt(data);
    const text = await runPrompt(prompt, data.history.slice(-12));
    return { reply: text.trim() };
  });
