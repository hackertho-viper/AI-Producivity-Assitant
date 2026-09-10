import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Disclaimer, EmptyState, Panel, PanelTitle } from "@/components/ai/ai-ui";
import { moduleMeta, toolNav } from "@/lib/nav";
import { useWorkspace } from "@/lib/workspace-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Meridian — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "One platform for workplace AI: draft emails, summarize meeting notes, plan and prioritize tasks, research topics, and ask the assistant where to start.",
      },
      { property: "og:title", content: "Meridian — AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content:
          "Draft emails, summarize meetings, plan tasks and research topics in one integrated AI workspace.",
      },
    ],
  }),
  component: Dashboard,
});

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

function Metric({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-2xl border border-glass-line bg-card/55 p-5 backdrop-blur-xl">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="font-display mt-2 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-[11px] font-medium text-muted-foreground/80">{hint}</p>
    </div>
  );
}

function Dashboard() {
  const { hydrated, counters, tasks, tasksCompleted, activity } = useWorkspace();
  const activeTasks = tasks.filter((t) => t.status === "active").length;
  const hasActivity = activity.length > 0;

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Welcome to Meridian</p>
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">Your workspace, organized.</h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Five AI modules working as one platform. Generate, summarize, plan and research — every
            output stays editable and honest.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/settings"
            className="rounded-xl border border-glass-line bg-card/70 px-4 py-2.5 text-sm font-semibold text-foreground/70 transition-colors hover:bg-card"
          >
            AI Guidelines
          </Link>
          <Link
            to="/tasks"
            className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-ink/20 transition-opacity hover:opacity-90"
          >
            New task
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric
          label="Tasks completed"
          value={hydrated ? tasksCompleted : 0}
          hint={activeTasks ? `${activeTasks} still active` : "No active tasks"}
        />
        <Metric
          label="Emails generated"
          value={hydrated ? counters.emailsGenerated : 0}
          hint="Counted from your own drafts"
        />
        <Metric
          label="Meetings summarized"
          value={hydrated ? counters.meetingsSummarized : 0}
          hint="Counted from your own notes"
        />
        <Metric
          label="Research sessions"
          value={hydrated ? counters.researchSessions : 0}
          hint="Counted from your own questions"
        />
      </section>

      <Panel>
        <PanelTitle>AI tools</PanelTitle>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {toolNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex items-start gap-3 rounded-2xl border border-glass-line bg-card/70 p-4 text-left transition-colors hover:bg-card"
            >
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-lg text-sm font-bold ${item.bgClass} ${item.colorClass}`}
              >
                {item.badge}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className="mt-0.5 block text-[11px] leading-relaxed text-muted-foreground">
                  {item.subtitle}
                </span>
              </span>
              <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-5">
        <Panel className="lg:col-span-3">
          <PanelTitle
            right={
              hasActivity ? (
                <Link to="/activity" className="text-xs font-semibold text-brand">
                  View all
                </Link>
              ) : undefined
            }
          >
            Recent activity
          </PanelTitle>
          {!hydrated || !hasActivity ? (
            <div className="mt-4">
              <EmptyState
                title="Nothing here yet"
                description="Anything you generate across the five tools will be listed here. No activity has been recorded in this browser yet."
              />
            </div>
          ) : (
            <div className="mt-4 flex flex-col divide-y divide-border/60">
              {activity.slice(0, 6).map((entry) => {
                const meta = moduleMeta[entry.module];
                return (
                  <div key={entry.id} className="flex items-start gap-3 py-3">
                    <span
                      className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg text-[11px] font-bold ${meta.bgClass} ${meta.colorClass}`}
                    >
                      {meta.badge}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{entry.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {timeAgo(entry.at)} · {entry.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        <Panel className="lg:col-span-2">
          <PanelTitle>Jump in</PanelTitle>
          <div className="mt-4 flex flex-col gap-2.5">
            {([toolNav[0], toolNav[1], toolNav[4]] as NavItem[]).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group flex items-center gap-3 rounded-2xl border border-glass-line bg-card/70 p-3 text-left transition-colors hover:bg-card"
              >
                <span
                  className={`grid size-9 place-items-center rounded-lg text-sm font-bold ${item.bgClass} ${item.colorClass}`}
                >
                  {item.badge}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="block text-[11px] text-muted-foreground">{item.subtitle}</span>
                </span>
                <ArrowRight className="size-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </Panel>
      </div>

      <div className="pt-2 text-center">
        <Disclaimer />
      </div>
    </div>
  );
}
