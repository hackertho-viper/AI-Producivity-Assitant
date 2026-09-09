import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Priority = "High" | "Medium" | "Low";
export type Level = "high" | "medium" | "low";
export type ModuleKey = "email" | "meeting" | "task" | "research" | "chat";

export type Task = {
  id: string;
  title: string;
  description: string;
  deadline: string;
  urgency: Level;
  importance: Level;
  category: string;
  status: "active" | "completed";
  priority?: Priority;
  reasoning?: string;
  source: "manual" | "meeting-summarizer";
  createdAt: string;
};

export type ActivityEntry = {
  id: string;
  module: ModuleKey | "system";
  title: string;
  detail: string;
  at: string;
};

export type EmailSeed = {
  purpose: string;
  context: string;
} | null;

export type Counters = {
  emailsGenerated: number;
  meetingsSummarized: number;
  researchSessions: number;
};

type WorkspaceState = {
  tasks: Task[];
  activity: ActivityEntry[];
  counters: Counters;
  emailSeed: EmailSeed;
};

const STORAGE_KEY = "meridian.workspace.v1";

const emptyState: WorkspaceState = {
  tasks: [],
  activity: [],
  counters: { emailsGenerated: 0, meetingsSummarized: 0, researchSessions: 0 },
  emailSeed: null,
};

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

type WorkspaceContextValue = {
  hydrated: boolean;
  tasks: Task[];
  activity: ActivityEntry[];
  counters: Counters;
  tasksCompleted: number;
  emailSeed: EmailSeed;
  addTask: (task: Omit<Task, "id" | "createdAt" | "status" | "source"> & { source?: Task["source"] }) => void;
  addTasks: (tasks: Array<Omit<Task, "id" | "createdAt" | "status" | "source">>, source: Task["source"]) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  applyPriorities: (updates: Array<{ id: string; priority: Priority; reasoning?: string }>) => void;
  logActivity: (entry: Omit<ActivityEntry, "id" | "at">) => void;
  bumpCounter: (key: keyof Counters) => void;
  setEmailSeed: (seed: EmailSeed) => void;
  clearWorkspace: () => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WorkspaceState>(emptyState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<WorkspaceState>;
        setState({
          tasks: parsed.tasks ?? [],
          activity: parsed.activity ?? [],
          counters: { ...emptyState.counters, ...(parsed.counters ?? {}) },
          emailSeed: parsed.emailSeed ?? null,
        });
      }
    } catch {
      // Corrupted or unavailable storage — start from an empty workspace.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or blocked — the session keeps working in memory.
    }
  }, [state, hydrated]);

  const logActivity = useCallback((entry: Omit<ActivityEntry, "id" | "at">) => {
    setState((prev) => ({
      ...prev,
      activity: [{ ...entry, id: uid(), at: new Date().toISOString() }, ...prev.activity].slice(0, 60),
    }));
  }, []);

  const value = useMemo<WorkspaceContextValue>(() => {
    const makeTask = (
      input: Omit<Task, "id" | "createdAt" | "status" | "source">,
      source: Task["source"],
    ): Task => ({
      ...input,
      id: uid(),
      createdAt: new Date().toISOString(),
      status: "active",
      source,
    });

    return {
      hydrated,
      tasks: state.tasks,
      activity: state.activity,
      counters: state.counters,
      tasksCompleted: state.tasks.filter((t) => t.status === "completed").length,
      emailSeed: state.emailSeed,
      logActivity,
      addTask: (input) => {
        const { source = "manual", ...rest } = input;
        setState((prev) => ({ ...prev, tasks: [makeTask(rest, source), ...prev.tasks] }));
      },
      addTasks: (inputs, source) => {
        setState((prev) => ({
          ...prev,
          tasks: [...inputs.map((i) => makeTask(i, source)), ...prev.tasks],
        }));
      },
      updateTask: (id, patch) => {
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        }));
      },
      deleteTask: (id) => {
        setState((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== id) }));
      },
      toggleTask: (id) => {
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) =>
            t.id === id ? { ...t, status: t.status === "completed" ? "active" : "completed" } : t,
          ),
        }));
      },
      applyPriorities: (updates) => {
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) => {
            const match = updates.find((u) => u.id === t.id);
            return match ? { ...t, priority: match.priority, reasoning: match.reasoning } : t;
          }),
        }));
      },
      bumpCounter: (key) => {
        setState((prev) => ({
          ...prev,
          counters: { ...prev.counters, [key]: prev.counters[key] + 1 },
        }));
      },
      setEmailSeed: (seed) => setState((prev) => ({ ...prev, emailSeed: seed })),
      clearWorkspace: () => setState(emptyState),
    };
  }, [state, hydrated, logActivity]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}
