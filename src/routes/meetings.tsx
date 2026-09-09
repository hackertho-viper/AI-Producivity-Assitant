import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import {
  AiBadge,
  BulletList,
  CopyButton,
  Disclaimer,
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
} from "@/components/ai/ai-ui";
import { summarizeMeeting, type MeetingResult } from "@/lib/ai.functions";
import { useWorkspace } from "@/lib/workspace-store";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Meridian" },
      {
        name: "description",
        content:
          "Turn raw meeting notes into a structured summary with key points, decisions, action items, deadlines and responsibilities — and push action items into the Task Planner.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer — Meridian" },
      {
        property: "og:description",
        content: "Structured meeting summaries with action items you can send straight to your planner.",
      },
    ],
  }),
  component: MeetingsPage,
});

function reportText(r: MeetingResult) {
  const lines = [
    "MEETING SUMMARY",
    r.summary,
    "",
    "KEY POINTS",
    ...r.keyPoints.map((p) => `- ${p}`),
    "",
    "DECISIONS",
    ...(r.decisions.length ? r.decisions.map((d) => `- ${d}`) : ["- None recorded in the notes"]),
    "",
    "ACTION ITEMS",
    ...(r.actionItems.length
      ? r.actionItems.map((a) => `- ${a.task} | ${a.owner} | ${a.deadline}`)
      : ["- None recorded in the notes"]),
    "",
    "DEADLINES",
    ...(r.deadlines.length ? r.deadlines.map((d) => `- ${d}`) : ["- None recorded in the notes"]),
    "",
    "RESPONSIBILITIES",
    ...(r.responsibilities.length
      ? r.responsibilities.map((d) => `- ${d}`)
      : ["- None recorded in the notes"]),
  ];
  return lines.join("\n");
}

function MeetingsPage() {
  const { addTasks, bumpCounter, logActivity } = useWorkspace();
  const navigate = useNavigate();
  const summarize = useServerFn(summarizeMeeting);

  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<MeetingResult | null>(null);
  const [summaryDraft, setSummaryDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transferred, setTransferred] = useState(false);

  const tooShort = notes.trim().length < 30;

  async function run() {
    if (tooShort || loading) return;
    setLoading(true);
    setError(null);
    try {
      const r = await summarize({ data: { notes } });
      setResult(r);
      setSummaryDraft(r.summary);
      setTransferred(false);
      bumpCounter("meetingsSummarized");
      logActivity({
        module: "meeting",
        title: "Summarized meeting notes",
        detail: `${r.actionItems.length} action item${r.actionItems.length === 1 ? "" : "s"} found`,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "The AI request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function transferActionItems() {
    if (!result?.actionItems.length) return;
    addTasks(
      result.actionItems.map((item) => ({
        title: item.task,
        description:
          item.owner && item.owner !== "Not specified"
            ? `Responsible: ${item.owner} (from meeting notes)`
            : "Responsible person was not specified in the meeting notes.",
        deadline: /^\d{4}-\d{2}-\d{2}$/.test(item.deadline) ? item.deadline : "",
        urgency: "medium" as const,
        importance: "medium" as const,
        category: "Meeting follow-up",
      })),
      "meeting-summarizer",
    );
    setTransferred(true);
    logActivity({
      module: "task",
      title: `Added ${result.actionItems.length} action item${result.actionItems.length === 1 ? "" : "s"} to the planner`,
      detail: "From Meeting Notes Summarizer",
    });
    toast.success("Action items added to the Task Planner", {
      action: { label: "Open planner", onClick: () => navigate({ to: "/tasks" }) },
    });
  }

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Meeting Summarizer"
        title="Turn raw notes into decisions and actions"
        description="Paste your notes exactly as you took them — bullet points, fragments, anything. Meridian only organizes what is there, and tells you when something important was never recorded."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <PanelTitle>Meeting notes</PanelTitle>
          <div className="mt-5 space-y-4">
            <label className="block">
              <FieldLabel hint="(at least 30 characters)">Paste your notes</FieldLabel>
              <TextArea
                rows={16}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  "Example:\nWeekly sync — attendees: me, Priya, Tom\n- Budget sign-off still pending\n- Priya to send revised figures by Friday\n- Agreed to delay the launch review"
                }
              />
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <PrimaryButton type="button" onClick={run} loading={loading} disabled={tooShort}>
                {result ? "Summarize again" : "Summarize notes"}
              </PrimaryButton>
              <span className="text-[11px] text-muted-foreground">
                {tooShort
                  ? "Add a bit more detail before summarizing."
                  : `${notes.trim().length} characters ready`}
              </span>
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelTitle right={result ? <AiBadge /> : undefined}>Structured summary</PanelTitle>
          <div className="mt-5 space-y-5">
            {error ? <ErrorNotice message={error} onRetry={run} /> : null}

            {loading && !result ? (
              <div className="space-y-3">
                <LoadingLines rows={7} />
                <p className="text-xs text-muted-foreground">Reading your notes…</p>
              </div>
            ) : null}

            {!loading && !result && !error ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                Your summary, key points, decisions, action items, deadlines and responsibilities will
                appear here.
              </p>
            ) : null}

            {result ? (
              <>
                <div>
                  <h3 className="font-display text-sm font-bold">1 · Meeting summary</h3>
                  <TextArea
                    className="mt-2"
                    rows={4}
                    value={summaryDraft}
                    onChange={(e) => setSummaryDraft(e.target.value)}
                  />
                </div>

                <div>
                  <h3 className="font-display text-sm font-bold">2 · Key points</h3>
                  <div className="mt-2">
                    <BulletList items={result.keyPoints} empty="No distinct key points in the notes." />
                  </div>
                </div>

                <div>
                  <h3 className="font-display text-sm font-bold">3 · Decisions</h3>
                  <div className="mt-2">
                    <BulletList
                      items={result.decisions}
                      empty="No decisions were recorded in these notes."
                    />
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-sm font-bold">4 · Action items</h3>
                    {result.actionItems.length ? (
                      <GhostButton type="button" onClick={transferActionItems} disabled={transferred}>
                        {transferred ? "Added to planner" : "Add to Task Planner"}
                      </GhostButton>
                    ) : null}
                  </div>
                  {result.actionItems.length ? (
                    <div className="mt-2 overflow-x-auto rounded-2xl border border-glass-line bg-card/60">
                      <table className="w-full min-w-[520px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-border/60 text-[11px] uppercase tracking-wide text-muted-foreground">
                            <th className="px-3 py-2 font-semibold">Task</th>
                            <th className="px-3 py-2 font-semibold">Responsible person</th>
                            <th className="px-3 py-2 font-semibold">Deadline</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.actionItems.map((item, i) => (
                            <tr key={i} className="border-b border-border/40 last:border-0">
                              <td className="px-3 py-2.5">{item.task}</td>
                              <td className="px-3 py-2.5 text-muted-foreground">{item.owner}</td>
                              <td className="px-3 py-2.5 text-muted-foreground">{item.deadline}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs italic text-muted-foreground">
                      No action items were described in these notes.
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="font-display text-sm font-bold">5 · Deadlines</h3>
                  <div className="mt-2">
                    <BulletList
                      items={result.deadlines}
                      empty="No deadlines were mentioned in these notes."
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-display text-sm font-bold">6 · Responsibilities</h3>
                  <div className="mt-2">
                    <BulletList
                      items={result.responsibilities}
                      empty="No responsibilities were assigned in these notes."
                    />
                  </div>
                </div>

                <MissingInfoNotice items={result.missingInformation} title="Missing from your notes" />

                <div className="flex flex-wrap gap-2">
                  <GhostButton type="button" onClick={run} disabled={loading}>
                    Regenerate
                  </GhostButton>
                  <CopyButton
                    value={reportText({ ...result, summary: summaryDraft })}
                    label="Copy summary"
                  />
                </div>
              </>
            ) : null}

            <div className="border-t border-border/60 pt-4">
              <Disclaimer />
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
