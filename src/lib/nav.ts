import type { ModuleKey } from "./workspace-store";

export type NavItem = {
  to: "/" | "/email" | "/meetings" | "/tasks" | "/research" | "/chat" | "/activity" | "/settings";
  label: string;
  badge: string;
  subtitle: string;
  module?: ModuleKey;
  colorClass: string;
  bgClass: string;
};

export const overviewNav: NavItem[] = [
  {
    to: "/",
    label: "Dashboard",
    badge: "D",
    subtitle: "Workspace overview",
    colorClass: "text-brand",
    bgClass: "bg-brand/10",
  },
];

export const toolNav: NavItem[] = [
  {
    to: "/email",
    label: "Email Generator",
    badge: "E",
    subtitle: "Draft workplace emails",
    module: "email",
    colorClass: "text-mod-email",
    bgClass: "bg-mod-email/10",
  },
  {
    to: "/meetings",
    label: "Meeting Notes",
    badge: "S",
    subtitle: "Summarize and extract actions",
    module: "meeting",
    colorClass: "text-mod-meeting",
    bgClass: "bg-mod-meeting/10",
  },
  {
    to: "/tasks",
    label: "Task Planner",
    badge: "T",
    subtitle: "Prioritize and schedule",
    module: "task",
    colorClass: "text-mod-task",
    bgClass: "bg-mod-task/10",
  },
  {
    to: "/research",
    label: "Research",
    badge: "R",
    subtitle: "Analyze a topic or source",
    module: "research",
    colorClass: "text-mod-research",
    bgClass: "bg-mod-research/10",
  },
  {
    to: "/chat",
    label: "Chatbot",
    badge: "C",
    subtitle: "Ask where to start",
    module: "chat",
    colorClass: "text-mod-chat",
    bgClass: "bg-mod-chat/10",
  },
];

export const workspaceNav: NavItem[] = [
  {
    to: "/activity",
    label: "Activity",
    badge: "A",
    subtitle: "Everything you have generated",
    colorClass: "text-brand",
    bgClass: "bg-brand/10",
  },
  {
    to: "/settings",
    label: "Settings & AI Guidelines",
    badge: "G",
    subtitle: "How this assistant behaves",
    colorClass: "text-brand",
    bgClass: "bg-brand/10",
  },
];

export const allNav = [...overviewNav, ...toolNav, ...workspaceNav];

export function navForPath(pathname: string): NavItem {
  return allNav.find((item) => item.to === pathname) ?? overviewNav[0];
}

export const moduleMeta: Record<ModuleKey | "system", { label: string; badge: string; colorClass: string; bgClass: string }> =
  {
    email: { label: "Email Generator", badge: "E", colorClass: "text-mod-email", bgClass: "bg-mod-email/10" },
    meeting: { label: "Meeting Notes", badge: "S", colorClass: "text-mod-meeting", bgClass: "bg-mod-meeting/10" },
    task: { label: "Task Planner", badge: "T", colorClass: "text-mod-task", bgClass: "bg-mod-task/10" },
    research: { label: "Research", badge: "R", colorClass: "text-mod-research", bgClass: "bg-mod-research/10" },
    chat: { label: "Chatbot", badge: "C", colorClass: "text-mod-chat", bgClass: "bg-mod-chat/10" },
    system: { label: "Workspace", badge: "W", colorClass: "text-muted-foreground", bgClass: "bg-muted" },
  };
