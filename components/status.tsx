import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Plane,
  PlaneLanding,
  Ban,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Operational status — every status conveyed by ICON + TEXT + color.  */
/* Color alone is never the signal (WCAG 2.2 AA).                      */
/* ------------------------------------------------------------------ */

export type StatusTone = "safe" | "watch" | "critical" | "unknown" | "neutral";

const TONE: Record<
  StatusTone,
  { chip: string; solid: string; ring: string; text: string }
> = {
  safe: {
    chip: "border-safe-500/40 bg-safe-500/10 text-safe-500",
    solid: "bg-safe-500 text-white",
    ring: "ring-safe-500/30",
    text: "text-safe-500",
  },
  watch: {
    chip: "border-watch-500/40 bg-watch-500/10 text-watch-500",
    solid: "bg-watch-500 text-ink-950",
    ring: "ring-watch-500/30",
    text: "text-watch-500",
  },
  critical: {
    chip: "border-critical-500/40 bg-critical-500/10 text-critical-500",
    solid: "bg-critical-500 text-white",
    ring: "ring-critical-500/30",
    text: "text-critical-500",
  },
  unknown: {
    chip: "border-unknown-500/40 bg-unknown-500/10 text-unknown-500",
    solid: "bg-unknown-500 text-white",
    ring: "ring-unknown-500/30",
    text: "text-unknown-500",
  },
  neutral: {
    chip: "border-border-strong bg-surface-raised text-foreground",
    solid: "bg-slate-700 text-white",
    ring: "ring-border-strong",
    text: "text-foreground",
  },
};

export function toneClasses(tone: StatusTone) {
  return TONE[tone];
}

export function StatusPill({
  tone,
  icon: Icon,
  children,
  size = "md",
  className = "",
}: {
  tone: StatusTone;
  icon?: LucideIcon;
  children: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
}) {
  const Fallback: LucideIcon =
    tone === "safe"
      ? CheckCircle2
      : tone === "watch"
        ? AlertTriangle
        : tone === "critical"
          ? XCircle
          : tone === "unknown"
            ? HelpCircle
            : Plane;
  const IconComp = Icon ?? Fallback;
  const pad = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${TONE[tone].chip} ${pad} ${className}`}
    >
      <IconComp
        className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"}
        aria-hidden="true"
      />
      <span>{children}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Rights status — the exact five-value vocabulary. "may apply" voice. */
/* ------------------------------------------------------------------ */

export type RightsStatus =
  | "likely_applies"
  | "may_apply"
  | "not_indicated"
  | "cannot_determine"
  | "future_rule_not_active";

const RIGHTS: Record<
  RightsStatus,
  { label: string; tone: StatusTone; icon: LucideIcon }
> = {
  likely_applies: {
    label: "Likely applies",
    tone: "safe",
    icon: CheckCircle2,
  },
  may_apply: { label: "May apply", tone: "watch", icon: AlertTriangle },
  not_indicated: { label: "Not indicated", tone: "neutral", icon: Ban },
  cannot_determine: {
    label: "Cannot determine",
    tone: "unknown",
    icon: HelpCircle,
  },
  future_rule_not_active: {
    label: "Future rule — not yet active",
    tone: "unknown",
    icon: PlaneLanding,
  },
};

export function RightsStatusBadge({
  status,
  size = "md",
}: {
  status: RightsStatus;
  size?: "sm" | "md";
}) {
  const { label, tone, icon } = RIGHTS[status];
  return (
    <StatusPill tone={tone} icon={icon} size={size}>
      {label}
    </StatusPill>
  );
}

/* ------------------------------------------------------------------ */
/* Heuristic risk band — qualitative ONLY. Never a percentage, never a */
/* gauge. Renders as labelled segments with the active band marked by  */
/* icon + text, not color alone.                                       */
/* ------------------------------------------------------------------ */

export type RiskLevel = "low" | "moderate" | "elevated" | "high" | "unknown";

const RISK_ORDER: RiskLevel[] = ["low", "moderate", "elevated", "high"];

const RISK_META: Record<
  RiskLevel,
  { label: string; tone: StatusTone; bar: string }
> = {
  low: { label: "Low", tone: "safe", bar: "bg-safe-500" },
  moderate: { label: "Moderate", tone: "watch", bar: "bg-watch-500" },
  elevated: { label: "Elevated", tone: "watch", bar: "bg-watch-500" },
  high: { label: "High", tone: "critical", bar: "bg-critical-500" },
  unknown: { label: "Unknown", tone: "unknown", bar: "bg-unknown-500" },
};

export function RiskBand({ level }: { level: RiskLevel }) {
  const meta = RISK_META[level];
  const activeIndex = RISK_ORDER.indexOf(level);
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">
          Heuristic risk band
        </span>
        <StatusPill tone={meta.tone} size="sm">
          {meta.label}
        </StatusPill>
      </div>
      <div
        className="mt-2 flex gap-1"
        role="img"
        aria-label={`Heuristic risk band: ${meta.label}${
          level === "unknown" ? "" : ` (segment ${activeIndex + 1} of 4)`
        }`}
      >
        {level === "unknown" ? (
          <div className="h-2 w-full rounded-full border border-dashed border-unknown-500/50 bg-unknown-500/10" />
        ) : (
          RISK_ORDER.map((seg, i) => (
            <div
              key={seg}
              className={`h-2 flex-1 rounded-full ${
                i <= activeIndex ? RISK_META[seg].bar : "bg-border-strong"
              }`}
            />
          ))
        )}
      </div>
      <p className="mt-1.5 text-xs text-muted">
        Qualitative band — no calibrated percentage. Contributing factors listed
        below.
      </p>
    </div>
  );
}
