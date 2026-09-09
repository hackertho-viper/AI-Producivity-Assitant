import { Check, Copy, Loader2, RotateCcw, TriangleAlert } from "lucide-react";
import { useState, type ReactNode, type TextareaHTMLAttributes, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("panel p-5 sm:p-6", className)}>{children}</section>;
}

export function PanelTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="font-display text-lg font-bold">{children}</h2>
      {right}
    </div>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <section className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </section>
  );
}

export function FieldLabel({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
      {children}
      {hint ? <span className="ml-1 font-normal text-muted-foreground/70">{hint}</span> : null}
    </span>
  );
}

const controlClass =
  "w-full rounded-xl border border-glass-line bg-card/70 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/50";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(controlClass, props.className)} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(controlClass, "resize-y", props.className)} />;
}

export function PrimaryButton({
  children,
  loading,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-ink/20 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border border-glass-line bg-card/70 px-3.5 py-2 text-xs font-semibold text-foreground/80 transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly T[];
  value: T;
  onChange: (next: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label}>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = option === value;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                active
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-glass-line bg-card/60 text-muted-foreground hover:bg-card",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AiBadge({ children = "AI-generated · editable" }: { children?: ReactNode }) {
  return (
    <span className="rounded-full bg-brand/10 px-3 py-1 text-[11px] font-semibold text-brand">
      {children}
    </span>
  );
}

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <GhostButton
      type="button"
      disabled={!value}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Copied" : label}
    </GhostButton>
  );
}

export function ErrorNotice({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
      <div className="flex items-start gap-2.5">
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div>
          <p className="text-sm font-semibold text-destructive">That request didn&apos;t complete</p>
          <p className="mt-1 text-xs leading-relaxed text-foreground/70">{message}</p>
          {onRetry ? (
            <GhostButton type="button" onClick={onRetry} className="mt-3">
              <RotateCcw className="size-3.5" /> Try again
            </GhostButton>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function MissingInfoNotice({
  items,
  title = "Not provided in your input",
}: {
  items: string[];
  title?: string;
}) {
  if (!items.length) return null;
  return (
    <div className="rounded-2xl border border-glass-line bg-card/60 p-4">
      <p className="text-xs font-semibold text-foreground/80">{title}</p>
      <ul className="mt-2 space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/50" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LoadingLines({ rows = 5 }: { rows?: number }) {
  const widths = ["w-full", "w-11/12", "w-4/5", "w-10/12", "w-3/5", "w-9/12", "w-2/3"];
  return (
    <div className="space-y-2.5" aria-live="polite" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={cn("h-2.5 animate-pulse rounded-full bg-muted", widths[i % widths.length])} />
      ))}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border/70 bg-card/40 px-6 py-10 text-center">
      <p className="font-display text-sm font-bold">{title}</p>
      <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

export function Disclaimer({ children }: { children?: ReactNode }) {
  return (
    <p className="text-[11px] leading-relaxed text-muted-foreground/80">
      {children ??
        "AI-generated content. Review and edit before use. Meridian works only from what you provide and does not invent names, dates or commitments — verify anything important against your own records."}
    </p>
  );
}

export function BulletList({ items, empty }: { items: string[]; empty: string }) {
  if (!items.length) return <p className="text-xs italic text-muted-foreground">{empty}</p>;
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
