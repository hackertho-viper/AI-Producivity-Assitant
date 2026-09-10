import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import {
  Disclaimer,
  PageIntro,
  Panel,
  PanelTitle,
  PrimaryButton,
} from "@/components/ai/ai-ui";
import { useWorkspace } from "@/lib/workspace-store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings & AI Guidelines — Meridian" },
      {
        name: "description",
        content:
          "Manage your workspace preferences and understand how Meridian uses AI responsibly.",
      },
      { property: "og:title", content: "Settings & AI Guidelines — Meridian" },
      {
        property: "og:description",
        content: "Workspace preferences and responsible AI guidelines.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { clearWorkspace } = useWorkspace();
  const [confirmReset, setConfirmReset] = useState(false);

  function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    clearWorkspace();
    setConfirmReset(false);
    toast.success("Workspace reset. All activity and drafts cleared.");
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageIntro
        eyebrow="Workspace"
        title="Settings & AI Guidelines"
        description="Control your workspace and understand how AI is used across the platform."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <PanelTitle>Workspace</PanelTitle>
          <p className="text-sm text-muted-foreground">
            All data is stored locally in this browser. Clearing it removes tasks, generated
            emails, meeting summaries, research reports and chat history.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <PrimaryButton
              onClick={handleReset}
              className={
                confirmReset
                  ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                  : ""
              }
            >
              {confirmReset ? "Confirm clear workspace" : "Clear workspace data"}
            </PrimaryButton>
            {confirmReset && (
              <button
                onClick={() => setConfirmReset(false)}
                className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                Cancel
              </button>
            )}
          </div>
        </Panel>

        <Panel>
          <PanelTitle>AI Model</PanelTitle>
          <p className="text-sm text-muted-foreground">
            Meridian uses the Lovable AI Gateway with a single workplace-tuned model for all
            modules. Prompt logic is kept separate per feature so outputs stay focused and
            testable.
          </p>
          <div className="mt-4 rounded-xl border border-border/60 bg-muted/40 px-4 py-3">
            <p className="font-mono text-xs text-muted-foreground">openai/gpt-6-astra</p>
          </div>
        </Panel>

        <Panel className="lg:col-span-2">
          <PanelTitle>Responsible AI Guidelines</PanelTitle>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            <Guideline
              title="No fabricated facts"
              body="The assistant does not invent names, dates, commitments, statistics or sources. If information is missing, it says so clearly."
            />
            <Guideline
              title="Editable outputs"
              body="Every AI-generated email, summary, plan or report can be reviewed and edited before you use it."
            />
            <Guideline
              title="Clear labels"
              body="AI-generated content is marked as a draft. Important decisions should always be verified by a person."
            />
            <Guideline
              title="Your context only"
              body="Prompts are scoped to the inputs you provide. Research prioritises your source material and flags what is not available in it."
            />
            <Guideline
              title="Cross-module hand-offs"
              body="When you move an action item from Meeting Notes to Task Planner, or draft an email from a task, the original context travels with it."
            />
            <Guideline
              title="Session-based chat"
              body="The chatbot keeps context during your current session and can guide you to the right tool without claiming actions were completed."
            />
          </div>
        </Panel>
      </div>

      <div className="max-w-none">
        <Disclaimer />
      </div>
    </div>
  );
}

function Guideline({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-4">
      <h3 className="font-display text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
