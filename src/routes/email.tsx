import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import {
  AiBadge,
  ChipGroup,
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
import { generateEmail } from "@/lib/ai.functions";
import type { EmailAudience, EmailRefinement, EmailTone } from "@/lib/prompts/email";
import { useWorkspace } from "@/lib/workspace-store";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Meridian" },
      {
        name: "description",
        content:
          "Draft professional workplace emails from your own purpose and context, with audience and tone controls and fully editable output.",
      },
      { property: "og:title", content: "Smart Email Generator — Meridian" },
      {
        property: "og:description",
        content: "Generate, shorten and formalize workplace emails without inventing facts.",
      },
    ],
  }),
  component: EmailPage,
});

const AUDIENCES = ["Client", "Manager", "Team", "Other"] as const;
const TONES = ["Formal", "Friendly", "Persuasive"] as const;

function EmailPage() {
  const { bumpCounter, logActivity, emailSeed, setEmailSeed } = useWorkspace();
  const generate = useServerFn(generateEmail);

  const [purpose, setPurpose] = useState("");
  const [context, setContext] = useState("");
  const [audience, setAudience] = useState<EmailAudience>("Client");
  const [tone, setTone] = useState<EmailTone>("Formal");

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [missing, setMissing] = useState<string[]>([]);
  const [loading, setLoading] = useState<EmailRefinement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasResult, setHasResult] = useState(false);

  useEffect(() => {
    if (emailSeed) {
      setPurpose(emailSeed.purpose);
      setContext(emailSeed.context);
      setEmailSeed(null);
    }
    // Seed is consumed once when arriving from the Task Planner.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canGenerate = purpose.trim().length >= 5;

  async function run(refinement: EmailRefinement) {
    if (!canGenerate || loading) return;
    setLoading(refinement);
    setError(null);
    try {
      const result = await generate({
        data: {
          purpose,
          context,
          audience,
          tone,
          refinement,
          currentSubject: subject,
          currentBody: body,
        },
      });
      setSubject(result.subject);
      setBody(result.body);
      setMissing(result.missingInformation);
      setHasResult(true);
      bumpCounter("emailsGenerated");
      logActivity({
        module: "email",
        title:
          refinement === "regenerate"
            ? `Generated an email for a ${audience.toLowerCase()}`
            : refinement === "shorter"
              ? "Shortened an email draft"
              : "Made an email draft more formal",
        detail: `Audience: ${audience} · Tone: ${tone}`,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "The AI request failed. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Email Generator"
        title="Draft a professional email"
        description="Describe the purpose and any context you want included. Meridian adapts the language to your recipient and tone, and never invents names, dates or commitments."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <PanelTitle>Your input</PanelTitle>

          <div className="mt-5 space-y-4">
            <label className="block">
              <FieldLabel>Purpose</FieldLabel>
              <TextInput
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Follow up on last week's proposal and ask for a decision date"
              />
            </label>

            <label className="block">
              <FieldLabel hint="(optional)">Context</FieldLabel>
              <TextArea
                rows={5}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Anything the email should mention: background, agreed points, real dates, next steps. Only what you write here is used."
              />
            </label>

            <ChipGroup label="Audience" options={AUDIENCES} value={audience} onChange={setAudience} />
            <ChipGroup label="Tone" options={TONES} value={tone} onChange={setTone} />

            <div className="flex flex-wrap items-center gap-3">
              <PrimaryButton
                type="button"
                onClick={() => run("regenerate")}
                loading={loading === "regenerate"}
                disabled={!canGenerate}
              >
                {hasResult ? "Regenerate" : "Generate email"}
              </PrimaryButton>
              {!canGenerate ? (
                <span className="text-[11px] text-muted-foreground">
                  Add a purpose of at least 5 characters to generate.
                </span>
              ) : null}
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelTitle right={hasResult ? <AiBadge /> : undefined}>Draft output</PanelTitle>

          <div className="mt-5 space-y-4">
            {error ? <ErrorNotice message={error} onRetry={() => run(loading ?? "regenerate")} /> : null}

            {loading && !hasResult ? (
              <div className="space-y-4">
                <div className="h-3 w-2/3 animate-pulse rounded-full bg-muted" />
                <LoadingLines rows={6} />
                <p className="text-xs text-muted-foreground">Writing your draft…</p>
              </div>
            ) : null}

            {!loading && !hasResult && !error ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                Your subject line and email body will appear here. Both stay fully editable — nothing
                is ever sent from this app.
              </p>
            ) : null}

            {hasResult ? (
              <>
                <label className="block">
                  <FieldLabel>Subject</FieldLabel>
                  <TextInput value={subject} onChange={(e) => setSubject(e.target.value)} />
                </label>

                <label className="block">
                  <FieldLabel>Email body</FieldLabel>
                  <TextArea rows={14} value={body} onChange={(e) => setBody(e.target.value)} />
                </label>

                <div className="flex flex-wrap gap-2">
                  <GhostButton
                    type="button"
                    onClick={() => run("regenerate")}
                    disabled={!!loading}
                  >
                    Regenerate
                  </GhostButton>
                  <GhostButton type="button" onClick={() => run("shorter")} disabled={!!loading}>
                    Make shorter
                  </GhostButton>
                  <GhostButton
                    type="button"
                    onClick={() => run("more-formal")}
                    disabled={!!loading}
                  >
                    Make more formal
                  </GhostButton>
                  <CopyButton value={`Subject: ${subject}\n\n${body}`} label="Copy email" />
                </div>

                {loading ? (
                  <p className="text-xs text-muted-foreground">Updating the draft…</p>
                ) : null}

                <MissingInfoNotice items={missing} />
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
