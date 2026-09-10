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
  TextInput,
} from "@/components/ai/ai-ui";
import { runResearch, type ResearchResult } from "@/lib/ai.functions";
import { useWorkspace } from "@/lib/workspace-store";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Meridian" },
      {
        name: "description",
        content:
          "Analyse a work question or your own source material into an executive summary, key insights, recommendations and a plain-language explanation.",
      },
      { property: "og:title", content: "AI Research Assistant — Meridian" },
      {
        property: "og:description",
        content: "Structured research reports grounded in the material you supply.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResearchPage,
});

function reportText(r: ResearchResult, summary: string) {
  return [
    "EXECUTIVE SUMMARY",
    summary,
    "",
    "KEY INSIGHTS",
    ...r.keyInsights.map((i) => `- ${i}`),
    "",
    "RECOMMENDATIONS",
    ...r.recommendations.map((i) => `- ${i}`),
    "",
    "IN PLAIN LANGUAGE",
    r.simplifiedExplanation,
    "",
    "HOW TO VERIFY THIS",
    r.verificationAdvice,
  ].join("\n");
}

function ResearchPage() {
  const { bumpCounter, logActivity, addTask } = useWorkspace();
  const navigate = useNavigate();
  const research = useServerFn(runResearch);

  const [question, setQuestion] = useState("");
  const [sourceMaterial, setSourceMaterial] = useState("");
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [summaryDraft, setSummaryDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tooShort = question.trim().length < 8;

  async function run() {
    if (tooShort || loading) return;
    setLoading(true);
    setError(null);
    try {
      const r = await research({ data: { question, sourceMaterial } });
      setResult(r);
      setSummaryDraft(r.executiveSummary);
      bumpCounter("researchSessions");
      logActivity({
        module: "research",
        title: "Ran a research session",
        detail: question.trim().slice(0, 90),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "The AI request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function createFollowUpTask() {
    addTask({
      title: `Follow up on research: ${question.trim().slice(0, 70)}`,
      description: summaryDraft.slice(0, 400),
      deadline: "",
      urgency: "medium",
      importance: "medium",
      category: "Research follow-up",
    });
    logActivity({
      module: "task",
      title: "Added a research follow-up task",
      detail: "From Research Assistant",
    });
    toast.success("Follow-up task added", {
      action: { label: "Open planner", onClick: () => navigate({ to: "/tasks" }) },
    });
  }

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Research Assistant"
        title="Understand a topic without guesswork"
        description="Ask a work question, and optionally paste the report, article or notes it should be based on. When your material doesn't answer part of the question, Meridian says so instead of filling the gap."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <PanelTitle>What do you need to know?</PanelTitle>
          <div className="mt-5 space-y-4">
            <label className="block">
              <FieldLabel>Question or topic</FieldLabel>
              <TextInput
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What are the trade-offs of moving our support team to a shared inbox?"
              />
            </label>
            <label className="block">
              <FieldLabel hint="(optional — strongly recommended)">Source material</FieldLabel>
              <TextArea
                rows={14}
                value={sourceMaterial}
                onChange={(e) => setSourceMaterial(e.target.value)}
                placeholder="Paste the article, report extract, transcript or internal notes this answer should be based on."
              />
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <PrimaryButton type="button" onClick={run} loading={loading} disabled={tooShort}>
                {result ? "Analyse again" : "Analyse"}
              </PrimaryButton>
              <span className="text-[11px] text-muted-foreground">
                {sourceMaterial.trim()
                  ? "Your material will be treated as the primary basis."
                  : "No material supplied — the answer will come from general knowledge."}
              </span>
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelTitle right={result ? <AiBadge /> : undefined}>Research report</PanelTitle>
          <div className="mt-5 space-y-5">
            {error ? <ErrorNotice message={error} onRetry={run} /> : null}

            {loading && !result ? (
              <div className="space-y-3">
                <LoadingLines rows={7} />
                <p className="text-xs text-muted-foreground">Analysing…</p>
              </div>
            ) : null}

            {!loading && !result && !error ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                Your executive summary, key insights, recommendations and a plain-language explanation
                will appear here.
              </p>
            ) : null}

            {result ? (
              <>
                <div>
                  <h3 className="font-display text-sm font-bold">Executive summary</h3>
                  <TextArea
                    className="mt-2"
                    rows={5}
                    value={summaryDraft}
                    onChange={(e) => setSummaryDraft(e.target.value)}
                  />
                </div>

                <div>
                  <h3 className="font-display text-sm font-bold">Key insights</h3>
                  <div className="mt-2">
                    <BulletList items={result.keyInsights} empty="No distinct insights were found." />
                  </div>
                </div>

                <div>
                  <h3 className="font-display text-sm font-bold">Recommendations</h3>
                  <div className="mt-2">
                    <BulletList
                      items={result.recommendations}
                      empty="No recommendations could be made from this material."
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-display text-sm font-bold">In plain language</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                    {result.simplifiedExplanation || "No simplified explanation was produced."}
                  </p>
                </div>

                <MissingInfoNotice
                  items={result.notAvailableInSource}
                  title="Not answered by your source material"
                />

                {result.verificationAdvice ? (
                  <div className="rounded-2xl border border-glass-line bg-card/60 p-4">
                    <p className="text-xs font-semibold text-foreground/80">How to verify this</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {result.verificationAdvice}
                    </p>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <GhostButton type="button" onClick={run} disabled={loading}>
                    Regenerate
                  </GhostButton>
                  <CopyButton value={reportText(result, summaryDraft)} label="Copy report" />
                  <GhostButton type="button" onClick={createFollowUpTask}>
                    Add follow-up task
                  </GhostButton>
                </div>
              </>
            ) : null}

            <div className="border-t border-border/60 pt-4">
              <Disclaimer>
                AI-generated analysis. Meridian does not browse the web and never invents sources,
                statistics or citations — check anything decision-critical against the original material.
              </Disclaimer>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
