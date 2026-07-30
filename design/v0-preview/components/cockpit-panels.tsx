import {
  Users,
  CalendarDays,
  Activity,
  ArrowRight,
  Bell,
  History,
  CloudSun,
  Wind,
  Receipt,
  FileText,
  Compass,
  CircleAlert,
  ArrowRightLeft,
} from "lucide-react";
import { demoConnection, demoSegments } from "@/lib/demo";
import { Panel, SourceLine, Unknown } from "./provenance";
import { RiskBand, StatusPill, type StatusTone } from "./status";

/* ---------------- Trip header ---------------- */
export function TripHeader() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted">
          <span className="tnum">PDX</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="tnum">JFK</span>
          <span className="text-muted/60">· 1 stop (DEN)</span>
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Portland to New York
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          <span className="tnum inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" aria-hidden="true" /> Thu, 12 Nov
            2026
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4" aria-hidden="true" /> 2 travelers
          </span>
        </div>
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-safe-500/40 bg-safe-500/10 px-3 py-1.5 text-sm font-semibold text-safe-500">
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="dp-live-dot absolute inline-flex h-2 w-2 rounded-full bg-safe-500" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-safe-500" />
        </span>
        Monitoring active
      </span>
    </div>
  );
}

/* ---------------- Overall status ---------------- */
export function OverallStatus() {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-watch-500/10 text-watch-500">
            <Activity className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Delay on your first flight — connection still looks workable
            </h2>
            <p className="text-sm text-muted">
              Your PDX departure is running late. Estimated connection slack in
              DEN is{" "}
              <span className="tnum font-semibold text-foreground">
                18 minutes
              </span>
              .
            </p>
          </div>
        </div>
        <StatusPill tone="watch">Action suggested</StatusPill>
      </div>
    </Panel>
  );
}

/* ---------------- Itinerary ---------------- */
function ItineraryNode({
  code,
  time,
  tz,
  label,
}: {
  code: string;
  time: string;
  tz: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 md:flex-col md:items-center md:gap-1 md:text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border-strong bg-surface text-sm font-semibold tnum text-foreground">
        {code}
      </span>
      <div className="md:mt-1">
        <div className="tnum text-sm font-semibold text-foreground">{time}</div>
        <div className="tnum text-xs text-muted">{tz}</div>
        <div className="text-xs text-muted">{label}</div>
      </div>
    </div>
  );
}

export function Itinerary() {
  const [a, b] = demoSegments;
  return (
    <Panel className="p-5 sm:p-6">
      <h2 className="text-base font-semibold text-foreground">Itinerary</h2>

      {/* Desktop: horizontal route line. Mobile: vertical timeline. */}
      <div className="mt-5 flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-4">
        <ItineraryNode
          code={a.origin.code}
          time={a.currentDep}
          tz={a.depTzLabel}
          label="Departs"
        />

        {/* leg 1 */}
        <div className="ms-5 border-s border-dashed border-border-strong ps-6 md:ms-0 md:mt-5 md:flex md:flex-1 md:flex-col md:items-center md:border-s-0 md:ps-0">
          <div className="md:flex md:w-full md:items-center md:gap-2">
            <span className="hidden h-px flex-1 route-dash text-border-strong md:block" />
            <span className="tnum whitespace-nowrap rounded-full border border-border bg-surface-raised px-2.5 py-0.5 text-xs text-muted">
              {a.flightNumber}
            </span>
            <span className="hidden h-px flex-1 route-dash text-border-strong md:block" />
          </div>
          <span className="mt-1 block text-xs text-watch-500 md:text-center">
            Delayed +{a.delayMinutes} min
          </span>
        </div>

        {/* connection */}
        <div className="ms-5 border-s border-dashed border-border-strong ps-6 md:ms-0 md:border-s-0 md:ps-0">
          <div className="flex flex-col items-start gap-1 rounded-xl border border-sky-500/30 bg-sky-500/5 px-3 py-2 md:items-center">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <ArrowRightLeft className="h-3.5 w-3.5 text-sky-500 dark:text-sky-400" aria-hidden="true" />
              Connect at {b.origin.code}
            </span>
            <span className="tnum text-xs text-muted">
              {demoConnection.slackMinutes} min estimated slack
            </span>
          </div>
        </div>

        {/* leg 2 */}
        <div className="ms-5 border-s border-dashed border-border-strong ps-6 md:ms-0 md:mt-5 md:flex md:flex-1 md:flex-col md:items-center md:border-s-0 md:ps-0">
          <div className="md:flex md:w-full md:items-center md:gap-2">
            <span className="hidden h-px flex-1 route-dash text-border-strong md:block" />
            <span className="tnum whitespace-nowrap rounded-full border border-border bg-surface-raised px-2.5 py-0.5 text-xs text-muted">
              {b.flightNumber}
            </span>
            <span className="hidden h-px flex-1 route-dash text-border-strong md:block" />
          </div>
          <span className="mt-1 block text-xs text-safe-500 md:text-center">
            On time
          </span>
        </div>

        <ItineraryNode
          code={b.destination.code}
          time={b.currentArr}
          tz={b.arrTzLabel}
          label="Arrives (next day)"
        />
      </div>

      <p className="mt-4 text-xs text-muted">
        Route diagram, described in text: {a.origin.code} departs {a.currentDep}{" "}
        {a.depTzLabel}, flight {a.flightNumber} (delayed {a.delayMinutes}{" "}
        minutes), connect at {b.origin.code} with{" "}
        {demoConnection.slackMinutes} minutes estimated slack, flight{" "}
        {b.flightNumber} on time, arriving {b.destination.code} {b.currentArr}{" "}
        {b.arrTzLabel} the next day.
      </p>
    </Panel>
  );
}

/* ---------------- Latest meaningful change ---------------- */
export function LatestChange() {
  return (
    <Panel className="p-5">
      <div className="flex items-center gap-2">
        <History className="h-5 w-5 text-watch-500" aria-hidden="true" />
        <h2 className="text-base font-semibold text-foreground">
          Latest meaningful change
        </h2>
      </div>
      <div className="mt-3 flex gap-3">
        <div
          className="mt-1 h-2 w-2 shrink-0 rounded-full bg-watch-500"
          aria-hidden="true"
        />
        <div>
          <p className="text-sm text-foreground">
            Here is what changed: your{" "}
            <span className="tnum font-semibold">MR 1487</span> departure moved
            from <span className="tnum">14:05</span> to{" "}
            <span className="tnum font-semibold text-watch-500">14:52</span> PT.
          </p>
          <p className="tnum mt-1 text-xs text-muted">
            Detected 4 min ago · The disruption cause has not been verified.
          </p>
        </div>
      </div>
    </Panel>
  );
}

/* ---------------- Next best action ---------------- */
export function NextBestAction() {
  const steps = [
    "Head toward gate C7 now — boarding may move earlier if the aircraft recovers time.",
    "Keep your onward flight CC 902; the estimated connection still holds.",
    "If the delay grows past 30 more minutes, ask the carrier about protection on the next DEN–JFK service.",
  ];
  return (
    <Panel className="border-sky-500/30 p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Compass className="h-5 w-5 text-sky-500 dark:text-sky-400" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-foreground">
          Next best action
        </h2>
      </div>
      <ol className="mt-4 space-y-3">
        {steps.map((s, i) => (
          <li key={s} className="flex gap-3">
            <span className="tnum flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-contrast">
              {i + 1}
            </span>
            <span className="text-sm leading-relaxed text-foreground">{s}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs text-muted">
        Suggestions are informational. DelayPilot never rebooks or files
        anything for you.
      </p>
    </Panel>
  );
}

/* ---------------- Delay / cancellation assessment ---------------- */
export function DelayAssessment() {
  const factors = [
    { label: "Inbound aircraft running late", tone: "watch" as StatusTone },
    { label: "Origin airport departures flowing normally", tone: "safe" as StatusTone },
    { label: "No cancellation signal in the feed", tone: "safe" as StatusTone },
  ];
  return (
    <Panel className="p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <CircleAlert className="h-5 w-5 text-watch-500" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-foreground">
          Delay &amp; cancellation assessment
        </h2>
      </div>
      <div className="mt-4">
        <RiskBand level="moderate" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-foreground">
        Contributing factors
      </h3>
      <ul className="mt-2 space-y-2">
        {factors.map((f) => (
          <li key={f.label} className="flex items-center gap-2">
            <StatusPill tone={f.tone} size="sm">
              {f.tone === "safe" ? "OK" : "Watch"}
            </StatusPill>
            <span className="text-sm text-muted">{f.label}</span>
          </li>
        ))}
      </ul>
      <SourceLine
        className="mt-4"
        provenance="Heuristic risk band"
        freshness="Recomputed 4 min ago"
      />
    </Panel>
  );
}

/* ---------------- Weather & airspace ---------------- */
export function WeatherAirspace() {
  return (
    <Panel className="p-5">
      <div className="flex items-center gap-2">
        <CloudSun className="h-5 w-5 text-sky-500 dark:text-sky-400" aria-hidden="true" />
        <h2 className="text-base font-semibold text-foreground">
          Weather &amp; airspace factors
        </h2>
      </div>
      <ul className="mt-3 space-y-3 text-sm">
        <li className="flex items-start gap-2">
          <Wind className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
          <span className="text-muted">
            <span className="font-medium text-foreground">DEN:</span> Gusty
            surface winds reported. Operational only — this is not a cause
            determination.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <CloudSun className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
          <span className="text-muted">
            <span className="font-medium text-foreground">PDX:</span>{" "}
            <Unknown inline /> — no airspace advisory in this feed.
          </span>
        </li>
      </ul>
      <SourceLine
        className="mt-4"
        provenance="Stale"
        freshness="Updated 38 min ago"
        source="Weather feed (demo)"
      />
      <p className="mt-2 text-xs text-muted">
        Weather describes operational conditions only — never a safety
        instruction and never proof of an extraordinary circumstance.
      </p>
    </Panel>
  );
}

/* ---------------- Evidence & receipt organizer ---------------- */
export function EvidenceOrganizer() {
  const items = [
    { label: "Schedule-change notice", meta: "Captured 4 min ago", kind: "auto" },
    { label: "Boarding passes (2)", meta: "From itinerary", kind: "auto" },
    { label: "Meal receipt", meta: "Not added", kind: "empty" },
    { label: "Hotel receipt", meta: "Not added", kind: "empty" },
  ];
  return (
    <Panel className="p-5">
      <div className="flex items-center gap-2">
        <Receipt className="h-5 w-5 text-sky-500 dark:text-sky-400" aria-hidden="true" />
        <h2 className="text-base font-semibold text-foreground">
          Evidence &amp; receipts
        </h2>
      </div>
      <p className="mt-1 text-sm text-muted">
        A factual chronology you can export as a printable packet.
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((it) => (
          <li
            key={it.label}
            className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
          >
            <span className="flex items-center gap-2">
              <FileText
                className={`h-4 w-4 ${
                  it.kind === "empty" ? "text-unknown-500" : "text-muted"
                }`}
                aria-hidden="true"
              />
              <span className="text-sm text-foreground">{it.label}</span>
            </span>
            {it.kind === "empty" ? (
              <span className="text-xs text-unknown-500">{it.meta}</span>
            ) : (
              <span className="tnum text-xs text-muted">{it.meta}</span>
            )}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-3 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-raised text-sm font-semibold text-foreground hover:bg-surface"
      >
        <FileText className="h-4 w-4" aria-hidden="true" /> Export evidence packet
      </button>
    </Panel>
  );
}

/* ---------------- Source & freshness panel ---------------- */
export function SourceFreshnessPanel() {
  const rows = [
    { label: "Flight status", prov: "Live" as const, age: "4 min ago" },
    { label: "Gate / terminal", prov: "Cached" as const, age: "21 min ago" },
    { label: "Weather", prov: "Stale" as const, age: "38 min ago" },
    { label: "Rights rule set", prov: "Live" as const, age: "v2026.04" },
  ];
  return (
    <Panel className="p-5">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-sky-500 dark:text-sky-400" aria-hidden="true" />
        <h2 className="text-base font-semibold text-foreground">
          Sources &amp; freshness
        </h2>
      </div>
      <ul className="mt-3 space-y-3">
        {rows.map((r) => (
          <li
            key={r.label}
            className="flex items-center justify-between gap-2 text-sm"
          >
            <span className="text-muted">{r.label}</span>
            <SourceLine provenance={r.prov} freshness={r.age} />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
