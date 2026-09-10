import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { SendHorizonal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  Disclaimer,
  ErrorNotice,
  GhostButton,
  LoadingLines,
  PageIntro,
  Panel,
  PanelTitle,
  TextArea,
} from "@/components/ai/ai-ui";
import { chatReply } from "@/lib/ai.functions";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/workspace-store";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Workplace Chatbot — Meridian" },
      {
        name: "description",
        content:
          "Ask workplace productivity questions and get routed to the right Meridian module — email drafting, meeting summaries, task planning or research.",
      },
      { property: "og:title", content: "AI Workplace Chatbot — Meridian" },
      {
        property: "og:description",
        content: "A workplace assistant that answers questions and points you to the right tool.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatPage,
});

type Turn = { role: "user" | "assistant"; content: string };

const starters = [
  "I have 12 tasks and no idea what to do first. Where do I start?",
  "How do I turn messy meeting notes into follow-up actions?",
  "I need to tell a client we are running two days late.",
  "How should I structure a research summary for my manager?",
];

const routes = [
  { to: "/email", label: "Email Generator" },
  { to: "/meetings", label: "Meeting Notes" },
  { to: "/tasks", label: "Task Planner" },
  { to: "/research", label: "Research" },
] as const;

function ChatPage() {
  const { tasks, tasksCompleted, counters, logActivity } = useWorkspace();
  const navigate = useNavigate();
  const reply = useServerFn(chatReply);

  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns, loading]);

  async function send(message: string, existing?: Turn[]) {
    const text = message.trim();
    if (!text || loading) return;
    const history = existing ?? turns;
    setTurns([...history, { role: "user", content: text }]);
    setInput("");
    setLastMessage(text);
    setLoading(true);
    setError(null);
    try {
      const r = await reply({
        data: {
          message: text,
          history: history.slice(-12),
          workspaceSnapshot: {
            activeTasks: tasks.filter((t) => t.status === "active").length,
            completedTasks: tasksCompleted,
            emailsGenerated: counters.emailsGenerated,
            meetingsSummarized: counters.meetingsSummarized,
            researchSessions: counters.researchSessions,
          },
        },
      });
      setTurns([...history, { role: "user", content: text }, { role: "assistant", content: r.reply }]);
      logActivity({ module: "chat", title: "Asked the chatbot", detail: text.slice(0, 90) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "The AI request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Chatbot"
        title="Ask what to do, and where to do it"
        description="A workplace assistant that answers productivity questions and points you to the module that will actually do the work. It can see how many tasks, emails and summaries you have — never their contents."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)]">
        <Panel className="flex min-h-[540px] flex-col">
          <PanelTitle
            right={
              turns.length ? (
                <GhostButton type="button" onClick={() => setTurns([])}>
                  Clear conversation
                </GhostButton>
              ) : undefined
            }
          >
            Conversation
          </PanelTitle>

          <div className="mt-5 flex-1 space-y-4 overflow-y-auto pr-1">
            {!turns.length && !loading ? (
              <div className="space-y-3">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Ask anything about your workload, workplace writing or planning. Try one of these:
                </p>
                <div className="flex flex-col gap-2">
                  {starters.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="rounded-xl border border-glass-line bg-card/60 px-3.5 py-2.5 text-left text-xs leading-relaxed text-foreground/80 transition-colors hover:bg-card"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {turns.map((turn, i) => (
              <div
                key={i}
                className={cn("flex", turn.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    turn.role === "user"
                      ? "bg-ink text-primary-foreground"
                      : "border border-glass-line bg-card/70 text-foreground/90",
                  )}
                >
                  {turn.content}
                </div>
              </div>
            ))}

            {loading ? (
              <div className="max-w-[85%] rounded-2xl border border-glass-line bg-card/70 px-4 py-3">
                <LoadingLines rows={3} />
              </div>
            ) : null}

            {error ? (
              <ErrorNotice message={error} onRetry={() => send(lastMessage, turns.slice(0, -1))} />
            ) : null}

            <div ref={endRef} />
          </div>

          <form
            className="mt-4 border-t border-border/60 pt-4"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <div className="flex items-end gap-2">
              <TextArea
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Ask about prioritising, drafting, summarising or researching…"
                aria-label="Your message"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                aria-label="Send message"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-ink text-primary-foreground shadow-lg shadow-ink/20 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <SendHorizonal className="size-4" />
              </button>
            </div>
            <div className="mt-3">
              <Disclaimer>
                AI-generated guidance. The chatbot cannot open pages, save tasks or send emails for you —
                it tells you which module to use. This conversation is not saved when you leave the page.
              </Disclaimer>
            </div>
          </form>
        </Panel>

        <Panel>
          <PanelTitle>Jump to a module</PanelTitle>
          <div className="mt-5 space-y-2">
            {routes.map((r) => (
              <button
                key={r.to}
                type="button"
                onClick={() => navigate({ to: r.to })}
                className="w-full rounded-xl border border-glass-line bg-card/60 px-3.5 py-2.5 text-left text-sm font-semibold transition-colors hover:bg-card"
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="mt-6 border-t border-border/60 pt-5">
            <p className="text-xs font-semibold text-foreground/80">What the chatbot can see</p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
              Only counts: {tasks.filter((t) => t.status === "active").length} active tasks,{" "}
              {tasksCompleted} completed, {counters.emailsGenerated} emails,{" "}
              {counters.meetingsSummarized} meeting summaries, {counters.researchSessions} research
              sessions. It never reads the contents of your work.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
