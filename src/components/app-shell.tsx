import { Link, useRouterState } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { overviewNav, toolNav, workspaceNav, navForPath, type NavItem } from "@/lib/nav";

function NavLinks({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  return (
    <>
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          activeOptions={{ exact: true }}
          activeProps={{
            className: "bg-card/80 text-foreground font-semibold shadow-sm ring-1 ring-border/60",
          }}
          inactiveProps={{ className: "text-muted-foreground font-medium hover:bg-card/50" }}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors"
        >
          <span
            className={`grid size-6 shrink-0 place-items-center rounded-md text-[11px] font-bold ${item.bgClass} ${item.colorClass}`}
          >
            {item.badge}
          </span>
          <span className="truncate">{item.label}</span>
        </Link>
      ))}
    </>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
      {children}
    </p>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-2">
      <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-2 text-primary-foreground shadow-lg shadow-brand/30">
        <span className="font-display text-lg font-bold">M</span>
      </div>
      <div>
        <p className="font-display text-sm font-bold leading-none">Meridian</p>
        <p className="mt-1 text-[11px] font-medium text-muted-foreground">AI Productivity</p>
      </div>
    </div>
  );
}

function NavBody({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <SectionLabel>Overview</SectionLabel>
      <NavLinks items={overviewNav} onNavigate={onNavigate} />
      <div className="mt-6">
        <SectionLabel>AI Tools</SectionLabel>
        <NavLinks items={toolNav} onNavigate={onNavigate} />
      </div>
      <div className="mt-6">
        <SectionLabel>Workspace</SectionLabel>
        <NavLinks items={workspaceNav} onNavigate={onNavigate} />
      </div>
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = navForPath(pathname);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="aur absolute -left-40 -top-40 size-[520px] rounded-full bg-brand/40 blur-[120px]" />
        <div
          className="aur absolute -right-32 top-24 size-[460px] rounded-full bg-brand-2/30 blur-[120px]"
          style={{ animationDelay: "-6s" }}
        />
        <div
          className="aur absolute -bottom-48 left-1/3 size-[560px] rounded-full bg-mod-task/25 blur-[130px]"
          style={{ animationDelay: "-11s" }}
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1440px]">
        <aside className="glass sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-1 border-r border-glass-line px-5 py-8 lg:flex">
          <div className="mb-8">
            <Brand />
          </div>
          <NavBody />
          <div className="mt-auto rounded-2xl border border-glass-line bg-card/50 p-4">
            <p className="font-display text-xs font-semibold">Responsible AI</p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
              Outputs are editable drafts and clearly labeled. Nothing is fabricated.
            </p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="glass-soft sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-glass-line px-4 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger
                  aria-label="Open navigation"
                  className="grid size-9 shrink-0 place-items-center rounded-lg border border-glass-line bg-card/70 lg:hidden"
                >
                  <Menu className="size-4" />
                </SheetTrigger>
                <SheetContent side="left" className="w-72 overflow-y-auto bg-background px-5 py-6">
                  <SheetTitle className="sr-only">Navigation</SheetTitle>
                  <div className="mb-8">
                    <Brand />
                  </div>
                  <NavBody onNavigate={() => setOpen(false)} />
                </SheetContent>
              </Sheet>
              <div className="min-w-0">
                <p className="font-display truncate text-sm font-bold">{current.label}</p>
                <p className="truncate text-[11px] text-muted-foreground">{current.subtitle}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="hidden rounded-full border border-glass-line bg-card/60 px-3 py-1.5 text-[11px] text-muted-foreground sm:inline">
                Saved in this browser
              </span>
            </div>
          </header>

          <main className="px-4 py-8 sm:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
