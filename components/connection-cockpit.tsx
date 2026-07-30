import {
  ShieldCheck,
  Split,
  PlaneLanding,
  DoorClosed,
  Info,
  CircleHelp,
} from "lucide-react";
import { demoConnection } from "@/lib/demo";
import { Panel, Unknown } from "./provenance";
import { RiskBand, StatusPill } from "./status";

function MinutesStat({
  label,
  value,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: number | null;
  tone?: "neutral" | "accent" | "watch";
  hint?: string;
}) {
  const color =
    tone === "accent"
      ? "text-sky-500 dark:text-sky-400"
      : tone === "watch"
        ? "text-watch-500"
        : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-surface-raised p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </div>
      {value === null ? (
        <div className="mt-2">
          <Unknown inline />
        </div>
      ) : (
        <div className={`tnum mt-1 text-3xl font-semibold ${color}`}>
          {value}
          <span className="ml-1 text-base font-normal text-muted">min</span>
        </div>
      )}
      {hint ? <div className="mt-1 text-xs text-muted">{hint}</div> : null}
    </div>
  );
}

export function ConnectionCockpit() {
  const c = demoConnection;
  const protectedTicket = c.protection === "protected";

  return (
    <Panel className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Connection assessment
          </h2>
          <p className="tnum mt-0.5 text-sm text-muted">
            Connecting at {c.airport}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${
            protectedTicket
              ? "border-safe-500/40 bg-safe-500/10 text-safe-500"
              : "border-watch-500/40 bg-watch-500/10 text-watch-500"
          }`}
        >
          {protectedTicket ? (
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Split className="h-4 w-4" aria-hidden="true" />
          )}
          {protectedTicket ? "Protected through-ticket" : "Self-transfer"}
        </span>
      </div>

      {/* headline estimates */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface-raised p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
            <PlaneLanding className="h-3.5 w-3.5" aria-hidden="true" /> Inbound
            gate-in
          </div>
          <div className="tnum mt-1 text-xl font-semibold text-foreground">
            {c.inboundGateIn}
          </div>
          <div className="text-xs text-muted">estimated</div>
        </div>
        <div className="rounded-xl border border-border bg-surface-raised p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
            <DoorClosed className="h-3.5 w-3.5" aria-hidden="true" /> Onward
            gate-close
          </div>
          <div className="tnum mt-1 text-xl font-semibold text-foreground">
            {c.nextGateClose}
          </div>
          <div className="text-xs text-muted">estimated</div>
        </div>
        <MinutesStat
          label="Available"
          value={c.availableMinutes}
          hint="Between the two estimates"
        />
        <MinutesStat
          label="Estimated required"
          value={c.requiredMinutes}
          tone="watch"
          hint="Sum of transfer components"
        />
      </div>

      {/* slack + risk band */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col justify-center rounded-xl border border-sky-500/30 bg-sky-500/5 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-muted">
            Estimated slack
          </div>
          <div className="tnum mt-1 text-4xl font-semibold text-sky-500 dark:text-sky-400">
            {c.slackMinutes}
            <span className="ml-1 text-lg font-normal text-muted">min</span>
          </div>
          <p className="mt-1 text-sm text-muted">
            Available minus estimated required. Positive slack is not a
            guaranteed connection.
          </p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <RiskBand level={c.riskBand} />
        </div>
      </div>

      {/* component breakdown */}
      <div className="mt-5">
        <h3 className="text-sm font-semibold text-foreground">
          Transfer components
        </h3>
        <ul className="mt-2 divide-y divide-border rounded-xl border border-border">
          {c.components.map((comp) => (
            <li
              key={comp.label}
              className="flex items-center justify-between gap-4 px-4 py-2.5"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">
                  {comp.label}
                </div>
                {comp.note ? (
                  <div className="text-xs text-muted">{comp.note}</div>
                ) : null}
              </div>
              <div className="shrink-0 text-right">
                {comp.minutes === null ? (
                  <Unknown inline />
                ) : comp.minutes === 0 ? (
                  <span className="text-sm text-muted">—not applicable</span>
                ) : (
                  <span className="tnum text-sm font-semibold text-foreground">
                    {comp.minutes} min
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* assumptions + missing */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-raised p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Info className="h-4 w-4 text-sky-500 dark:text-sky-400" aria-hidden="true" />
            Assumptions
          </h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm text-muted">
            {c.assumptions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-dashed border-unknown-500/40 bg-unknown-500/5 p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <CircleHelp className="h-4 w-4 text-unknown-500" aria-hidden="true" />
            Missing data
          </h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm text-muted">
            {c.missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted">
        This is a heuristic estimate built from typical transfer times, not a
        guaranteed connection. Minutes are indicative and update only when a
        source changes.
      </p>
    </Panel>
  );
}
