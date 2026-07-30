import type { ReactNode } from "react";
import {
  Radio,
  Database,
  History,
  FlaskConical,
  WifiOff,
  Waves,
  HelpCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Provenance chips — the exact six-item vocabulary. Never hidden      */
/* behind a tooltip; provenance is part of the data.                   */
/* ------------------------------------------------------------------ */

export type Provenance =
  | "Live"
  | "Cached"
  | "Stale"
  | "Demo"
  | "Unavailable"
  | "Heuristic risk band";

const PROVENANCE_STYLES: Record<
  Provenance,
  { icon: typeof Radio; className: string; live?: boolean }
> = {
  Live: {
    icon: Radio,
    className:
      "border-safe-500/40 bg-safe-500/10 text-safe-500 dark:text-safe-500",
    live: true,
  },
  Cached: {
    icon: Database,
    className: "border-sky-600/40 bg-sky-600/10 text-sky-600 dark:text-sky-400",
  },
  Stale: {
    icon: History,
    className: "border-watch-500/40 bg-watch-500/10 text-watch-500",
  },
  Demo: {
    icon: FlaskConical,
    className:
      "border-dashed border-slate-500/50 bg-slate-500/5 text-slate-700 dark:text-slate-500",
  },
  Unavailable: {
    icon: WifiOff,
    className: "border-unknown-500/40 bg-unknown-500/10 text-unknown-500",
  },
  "Heuristic risk band": {
    icon: Waves,
    className: "border-watch-500/40 bg-watch-500/10 text-watch-500",
  },
};

export function ProvenanceChip({
  provenance,
  className = "",
}: {
  provenance: Provenance;
  className?: string;
}) {
  const { icon: Icon, className: tone, live } = PROVENANCE_STYLES[provenance];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${tone} ${className}`}
    >
      {live ? (
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="dp-live-dot absolute inline-flex h-2 w-2 rounded-full bg-safe-500" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-safe-500" />
        </span>
      ) : (
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      <span>{provenance}</span>
    </span>
  );
}

/* Freshness — the age of the datum, always beside its provenance. */
export function Freshness({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs text-muted tnum ${className}`}
    >
      {label}
    </span>
  );
}

/* Combined provenance + freshness + optional source id, the standard
   footer on every datum-bearing panel. */
export function SourceLine({
  provenance,
  freshness,
  source,
  className = "",
}: {
  provenance: Provenance;
  freshness?: string;
  source?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${className}`}>
      <ProvenanceChip provenance={provenance} />
      {freshness ? <Freshness label={freshness} /> : null}
      {source ? (
        <span className="text-xs text-muted">
          Source: <span className="text-foreground/80">{source}</span>
        </span>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Unknown — a first-class designed state. Never a blank, dash, or 0.  */
/* ------------------------------------------------------------------ */

export function Unknown({
  hint,
  inline = false,
}: {
  hint?: string;
  inline?: boolean;
}) {
  if (inline) {
    return (
      <span className="inline-flex items-center gap-1 text-unknown-500">
        <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="text-sm font-medium">Unknown</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-unknown-500/40 bg-unknown-500/5 px-2 py-1 text-unknown-500">
      <HelpCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="text-sm font-medium">Unknown</span>
      {hint ? <span className="text-xs text-muted">· {hint}</span> : null}
    </span>
  );
}

/* Small "Demo data" banner used on any panel showing fixture data. */
export function DemoBanner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border border-dashed border-slate-500/40 bg-slate-500/5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-500 ${className}`}
    >
      <FlaskConical className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>Demo data — not a live flight.</span>
    </div>
  );
}

export function Panel({
  children,
  className = "",
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article" | "aside";
}) {
  return (
    <Tag
      className={`rounded-2xl border border-border bg-surface shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset] ${className}`}
    >
      {children}
    </Tag>
  );
}
