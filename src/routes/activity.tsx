import { createFileRoute, Link } from "@tanstack/react-router";

import { EmptyState, PageIntro, Panel, PanelTitle } from "@/components/ai/ai-ui";
import { moduleMeta } from "@/lib/nav";
import { useWorkspace } from "@/lib/workspace-store";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Activity — Meridian" },
      {
        name: "description",
        content:
          "A real record of everything you have generated in Meridian: emails drafted, meetings summarized, tasks planned and research sessions run.",
      },
      { property: "og:title", content: "Activity — Meridian" },
      {
        property: "og:description",
        content: "Your real workspace history, stored in this browser only.",
      },
    ],
  }),
  component: ActivityPage,
});

function ActivityPage() {
  const { activity, hydrated } = useWorkspace();

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Activity"
        title="What you have actually done"
        description="Every entry below comes from your own use of the five tools. Nothing is pre-filled or estimated, and the history lives only in this browser."
      />

      <Panel>
        <PanelTitle right={<span className="text-xs text-muted-foreground">{activity.length} entries</span>}>
          History
        </PanelTitle>

        {!hydrated || activity.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              title="No activity yet"
              description="Generate an email, summarize a meeting, plan your tasks or run a research session and it will show up here."
            />
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Link
                to="/email"
                className="rounded-xl border border-glass-line bg-card/70 px-3.5 py-2 text-xs font-semibold text-foreground/80 hover:bg-card"
              >
                Draft an email
              </Link>
              <Link
                to="/meetings"
                className="rounded-xl border border-glass-line bg-card/70 px-3.5 py-2 text-xs font-semibold text-foreground/80 hover:bg-card"
              >
                Summarize notes
              </Link>
            </div>
          </div>
        ) : (
          <ol className="mt-5 flex flex-col divide-y divide-border/60">
            {activity.map((entry) => {
              const meta = moduleMeta[entry.module];
              return (
                <li key={entry.id} className="flex items-start gap-3 py-3.5">
                  <span
                    className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg text-xs font-bold ${meta.bgClass} ${meta.colorClass}`}
                  >
                    {meta.badge}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{entry.title}</p>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">{entry.detail}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground/80">
                    {new Date(entry.at).toLocaleString()}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </Panel>
    </div>
  );
}
