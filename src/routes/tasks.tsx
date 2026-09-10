import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  AiBadge,
  BulletList,
  ChipGroup,
  CopyButton,
  Disclaimer,
  EmptyState,
  ErrorNotice,
  FieldLabel,
  GhostButton,
  LoadingLines,
  MissingInfoNotice,
  PageIntro,
  Panel,
  PanelTitle,
  PrimaryButton,
  TextArea,
  TextInput,
} from "@/components/ai/ai-ui";
import { generatePlan, prioritizeTasks, type PlanResult } from "@/lib/ai.functions";
import { cn } from "@/lib/utils";
import { useWorkspace, type Level, type Priority, type Task } from "@/lib/workspace-store";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "AI Task Planner & Scheduler — Meridian" },
      {
        name: "description",
        content:
          "Capture tasks with urgency, importance and deadlines, let AI prioritise them with clear reasoning, and generate a realistic daily or weekly schedule.",
      },
      { property: "og:title", content: "AI Task Planner & Scheduler — Meridian" },
      {
        property: "og:description",
        content: "Prioritise your workload and build a realistic daily or weekly plan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TasksPage;
});

const levels: readonly Level[] = ["high", "medium", "low"] as const;

const priorityClass: Record<Priority, string> = {
  High: "bg-prio-high/10 text-prio-high",
  Medium: "bg-prio-medium/10 text-prio-medium",
  Low: "bg-prio-low/10 text-prio-low",
};

function planText(plan: PlanResult) {
  const lines: string[] = ["SCHEDULE"];
  for (const block of plan.blocks) {
    lines.push("", block.label);
    for (const item of block.items) {
      lines.push(`- ${item.time} · ${item.title}${item.note ? ` — ${item.note}` : ""}`);
    }
  }
  if (plan.suggestions.length) {
    lines.push("", "SUGGESTIONS", ...plan.suggestions.map((s) => `- ${s}`));
  }
  return lines.join("\n");
}

function toPromptTask(t: Task) {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    deadline: t.deadline,
    urgency: t.urgency,
    importance: t.importance,
    category: t.category,
  };
}

function TasksPage() {
  const {
    tasks,
    addTask,
    deleteTask,
    toggleTask,
    applyPriorities,
    logActivity,
    setEmailSeed,
  } = useWorkspace();
  const navigate = useNavigate();
  const prioritize = useServerFn(prioritizeTasks);
  const plan = useServerFn(generatePlan);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState<Level>("medium");
  const [importance, setImportance] = useState<Level>("medium");

  const [context, setContext] = useState("");
  const [horizon, setHorizon] = useState<"daily" | "weekly">("daily");

  const [prioLoading, setPrioLoading] = useState(false);
  const [prioError, setPrioError] = useState<string | null>(null);
  const [prioNotes, setPrioNotes] = useState("");

  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [planResult, setPlanResult] = useState<PlanResult | null>(null);

  const activeTasks = useMemo(() => tasks.filter((t) => t.status === "active"), [tasks]);
  const completedTasks = useMemo(() => tasks.filter((t) => t.status === "completed"), [tasks]);

  function submitTask() {
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      description: description.trim(),
      deadline,
      category: category.trim(),
      urgency,
      importance,
    });
    logActivity({ module: "task", title: "Added a task", detail: title.trim() });
    setTitle("");
    setDescription("");
    setDeadline("");
    setCategory("");
    setUrgency("medium");
    setImportance("medium");
  }

  async function runPrioritize() {
    if (!activeTasks.length || prioLoading) return;
    setPrioLoading(true);
    setPrioError(null);
    try {
      const r = await prioritize({
        data: { tasks: activeTasks.map(toPromptTask), context },
      });
      applyPriorities(
        r.priorities.map((p) => ({ id: p.id, priority: p.priority, reasoning: p.reasoning })),
      );
      setPrioNotes(r.notes);
      logActivity({
        module: "task",
        title: "Prioritised tasks with AI",
        detail: `${r.priorities.length} task${r.priorities.length === 1 ? "" : "s"} rated`,
      });
    } catch (e) {
      setPrioError(e instanceof Error ? e.message : "The AI request failed. Please try again.");
    } finally {
      setPrioLoading(false);
    }
  }

  async function runPlan() {
    if (!activeTasks.length || planLoading) return;
    setPlanLoading(true);
    setPlanError(null);
    try {
      const r = await plan({ data: { tasks: activeTasks.map(toPromptTask), horizon, context } });
      setPlanResult(r);
      logActivity({
        module: "task",
        title: `Generated a ${horizon} plan`,
        detail: `${r.blocks.length} block${r.blocks.length === 1 ? "" : "s"} scheduled`,
      });
    } catch (e) {
      setPlanError(e instanceof Error ? e.message : "The AI request failed. Please try again.");
    } finally {
      setPlanLoading(false);
    }
  }

  function draftUpdateEmail(task: Task) {
    setEmailSeed({
      purpose: `Send a short status update about the task "${task.title}"`,
      context: [
        `Task: ${task.title}`,
        task.description ? `Details: ${task.description}` : "",
        task.deadline ? `Deadline: ${task.deadline}` : "No deadline recorded.",
        task.priority ? `Priority: ${task.priority}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });
    toast.success("Sent to the Email Generator", {
      action: { label: "Open email", onClick: () => navigate({ to: "/email" }) },
    });
  }

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Task Planner"
        title="Prioritise the work, then schedule it"
        description="Add what you actually have to do. Meridian rates priority from the urgency, importance and deadlines you give it, and builds a schedule without inventing work you never mentioned."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <Panel>
          <PanelTitle>Add a task</PanelTitle>
          <div className="mt-5 space-y-4">
            <label className="block">
              <FieldLabel>Task title</FieldLabel>
              <TextInput
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Send revised budget to Priya"
              />
            </label>
            <label className="block">
              <FieldLabel hint="(optional)">Description</FieldLabel>
              <TextArea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Anything that matters for prioritising it"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <FieldLabel hint="(optional)">Deadline</FieldLabel>
                <TextInput type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </label>
              <label className="block">
                <FieldLabel hint="(optional)">Category</FieldLabel>
                <TextInput
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Finance"
                />
              </label>
            </div>
            <ChipGroup label="Urgency" options={levels} value={urgency} onChange={setUrgency} />
            <ChipGroup
              label="Importance"
              options={levels}
              value={importance}
              onChange={setImportance}
            />
            <PrimaryButton type="button" onClick={submitTask} disabled={!title.trim()}>
              Add task
            </PrimaryButton>
          </div>

          <div className="mt-6 border-t border-border/60 pt-5">
            <label className="block">
              <FieldLabel hint="(optional, used by both AI actions)">
                Your working context
              </FieldLabel>
              <TextArea
                rows={3}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="I have meetings all Tuesday morning and prefer deep work early."
              />
            </label>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <PanelTitle
              right={
                <div className="flex flex-wrap gap-2">
                  <GhostButton
                    type="button"
                    onClick={runPrioritize}
                    disabled={!activeTasks.length || prioLoading}
                  >
                    {prioLoading ? "Prioritising…" : "Prioritise with AI"}
                  </GhostButton>
                </div>
              }
            >
              Your tasks ({activeTasks.length} active)
            </PanelTitle>

            <div className="mt-5 space-y-4">
              {prioError ? <ErrorNotice message={prioError} onRetry={runPrioritize} /> : null}

              {!tasks.length ? (
                <EmptyState
                  title="No tasks yet"
                  description="Add your first task on the left, or summarise a meeting and push its action items straight in here."
                />
              ) : null}

              {activeTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl border border-glass-line bg-card/60 p-4"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 size-4 shrink-0 accent-brand"
                      checked={false}
                      onChange={() => toggleTask(task.id)}
                      aria-label={`Mark ${task.title} complete`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{task.title}</p>
                        {task.priority ? (
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                              priorityClass[task.priority],
                            )}
                          >
                            {task.priority}
                          </span>
                        ) : null}
                        {task.source === "meeting-summarizer" ? (
                          <span className="rounded-full bg-mod-meeting/10 px-2.5 py-0.5 text-[11px] font-semibold text-mod-meeting">
                            From meeting
                          </span>
                        ) : null}
                      </div>
                      {task.description ? (
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {task.description}
                        </p>
                      ) : null}
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        {task.deadline ? `Due ${task.deadline}` : "No deadline"} · urgency{" "}
                        {task.urgency} · importance {task.importance}
                        {task.category ? ` · ${task.category}` : ""}
                      </p>
                      {task.reasoning ? (
                        <p className="mt-2 rounded-xl bg-brand/5 px-3 py-2 text-[11px] leading-relaxed text-foreground/75">
                          AI reasoning: {task.reasoning}
                        </p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <GhostButton type="button" onClick={() => draftUpdateEmail(task)}>
                          Draft an update email
                        </GhostButton>
                        <GhostButton
                          type="button"
                          onClick={() => deleteTask(task.id)}
                          aria-label={`Delete ${task.title}`}
                        >
                          <Trash2 className="size-3.5" /> Delete
                        </GhostButton>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {prioNotes ? (
                <div className="rounded-2xl border border-glass-line bg-card/60 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-foreground/80">AI notes on your workload</p>
                    <AiBadge>AI-generated</AiBadge>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{prioNotes}</p>
                </div>
              ) : null}

              {completedTasks.length ? (
                <div className="border-t border-border/60 pt-4">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Completed ({completedTasks.length})
                  </p>
                  <ul className="mt-2 space-y-2">
                    {completedTasks.map((task) => (
                      <li key={task.id} className="flex items-center gap-3 text-sm">
                        <input
                          type="checkbox"
                          className="size-4 accent-brand"
                          checked
                          onChange={() => toggleTask(task.id)}
                          aria-label={`Reopen ${task.title}`}
                        />
                        <span className="text-muted-foreground line-through">{task.title}</span>
                        <button
                          type="button"
                          onClick={() => deleteTask(task.id)}
                          className="ml-auto text-muted-foreground hover:text-destructive"
                          aria-label={`Delete ${task.title}`}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </Panel>

          <Panel>
            <PanelTitle right={planResult ? <AiBadge>AI-generated plan</AiBadge> : undefined}>
              Schedule
            </PanelTitle>
            <div className="mt-5 space-y-4">
              <div className="flex flex-wrap items-end gap-3">
                <ChipGroup
                  label="Horizon"
                  options={["daily", "weekly"] as const}
                  value={horizon}
                  onChange={setHorizon}
                />
                <PrimaryButton
                  type="button"
                  onClick={runPlan}
                  loading={planLoading}
                  disabled={!activeTasks.length}
                >
                  {planResult ? "Regenerate plan" : `Generate ${horizon} plan`}
                </PrimaryButton>
              </div>

              {planError ? <ErrorNotice message={planError} onRetry={runPlan} /> : null}

              {planLoading && !planResult ? <LoadingLines rows={6} /> : null}

              {!activeTasks.length && !planResult ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Add at least one active task and Meridian will build a realistic schedule around it.
                </p>
              ) : null}

              {planResult ? (
                <div className="space-y-5">
                  {planResult.blocks.length ? (
                    planResult.blocks.map((block, i) => (
                      <div key={i}>
                        <h3 className="font-display text-sm font-bold">{block.label}</h3>
                        <ul className="mt-2 space-y-2">
                          {block.items.map((item, j) => (
                            <li
                              key={j}
                              className="rounded-xl border border-glass-line bg-card/60 px-3 py-2.5"
                            >
                              <p className="text-sm font-semibold">
                                <span className="text-brand">{item.time}</span> · {item.title}
                              </p>
                              {item.note ? (
                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                  {item.note}
                                </p>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs italic text-muted-foreground">
                      There was not enough task detail to build a schedule.
                    </p>
                  )}

                  <div>
                    <h3 className="font-display text-sm font-bold">Time-organisation suggestions</h3>
                    <div className="mt-2">
                      <BulletList
                        items={planResult.suggestions}
                        empty="No extra suggestions for this workload."
                      />
                    </div>
                  </div>

                  <MissingInfoNotice items={planResult.missingInformation} />

                  <CopyButton value={planText(planResult)} label="Copy plan" />
                </div>
              ) : null}

              <div className="border-t border-border/60 pt-4">
                <Disclaimer>
                  Priorities and time blocks are AI suggestions based only on the tasks and context you
                  entered — they are not read from your real calendar. Review before committing to them.
                </Disclaimer>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
