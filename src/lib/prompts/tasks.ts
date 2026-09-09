import { RESPONSIBLE_AI_RULES, jsonContract, type ModulePrompt } from "./shared";

export type TaskForPrompt = {
  id: string;
  title: string;
  description: string;
  deadline: string;
  urgency: string;
  importance: string;
  category: string;
};

export type PlanHorizon = "daily" | "weekly";

const SHARED_ROLE = `ROLE:
You are a workplace productivity and planning assistant.`;

function taskBlock(tasks: TaskForPrompt[]) {
  return tasks
    .map(
      (t) =>
        `- id: ${t.id}
  title: ${t.title}
  description: ${t.description || "(none)"}
  deadline: ${t.deadline || "not provided"}
  urgency: ${t.urgency}
  importance: ${t.importance}
  category: ${t.category || "not provided"}`,
    )
    .join("\n");
}

export function buildPrioritizePrompt(input: {
  tasks: TaskForPrompt[];
  context: string;
  today: string;
}): ModulePrompt {
  const system = `${SHARED_ROLE}

TASK:
Assign a priority level of High, Medium or Low to every supplied task and explain the reasoning briefly.

CONTEXT:
Use only the supplied task details (urgency, importance, deadline, category) and the user's context notes. Today's date is ${input.today}.

${RESPONSIBLE_AI_RULES}
- Never invent deadlines, requirements or owners. If a deadline was not provided, reason from urgency and importance only and say so.

QUALITY:
Prioritize realistically. Reasoning must be one short sentence referring to the task's actual attributes. Return one entry per supplied id, using the exact ids given.

${jsonContract(`{
  "priorities": [{ "id": string, "priority": "High" | "Medium" | "Low", "reasoning": string }],
  "notes": string
}`)}`;

  const user = `TASKS:
${taskBlock(input.tasks)}

USER CONTEXT:
${input.context.trim() || "(none provided)"}`;

  return { id: "tasks.prioritize", system, user };
}

export function buildPlanPrompt(input: {
  tasks: TaskForPrompt[];
  horizon: PlanHorizon;
  context: string;
  today: string;
}): ModulePrompt {
  const system = `${SHARED_ROLE}

TASK:
Build a practical ${input.horizon === "daily" ? "single working-day schedule" : "five working-day (Monday to Friday) schedule"} from the user's active tasks, plus short time-organization suggestions.

CONTEXT:
Use only the supplied tasks and the user's context notes. Today's date is ${input.today}. Assume a standard working day unless the user's context says otherwise.

${RESPONSIBLE_AI_RULES}
- Never invent tasks, deadlines, meetings or commitments that are not in the supplied list.
- Time blocks are your suggestions, not facts about the user's calendar. Keep them realistic and do not overfill the day.
- If there are not enough tasks to fill the schedule, leave the schedule short rather than inventing work.

QUALITY:
Group related work, protect focus time, and sequence by priority and deadline.

${jsonContract(`{
  "blocks": [{ "label": string, "items": [{ "time": string, "title": string, "note": string }] }],
  "suggestions": string[],
  "missingInformation": string[]
}`)}`;

  const user = `ACTIVE TASKS:
${taskBlock(input.tasks)}

USER CONTEXT / PREFERENCES:
${input.context.trim() || "(none provided)"}

HORIZON: ${input.horizon}`;

  return { id: `tasks.plan.${input.horizon}`, system, user };
}
