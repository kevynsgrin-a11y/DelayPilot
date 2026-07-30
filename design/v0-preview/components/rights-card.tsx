"use client";

import { useState } from "react";
import {
  Scale,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  CalendarClock,
  ExternalLink,
} from "lucide-react";
import { demoRights, type RightsFacet } from "@/lib/demo";
import { Panel } from "./provenance";
import { RightsStatusBadge } from "./status";

function Facet({ facet }: { facet: RightsFacet }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border">
      <div className="flex flex-wrap items-start justify-between gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground">
              {facet.title}
            </h4>
            <RightsStatusBadge status={facet.status} size="sm" />
          </div>
          {/* answer-first summary */}
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            {facet.summary}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="inline-flex h-11 min-w-11 items-center justify-center gap-1 rounded-lg px-3 text-xs font-medium text-foreground hover:bg-surface-raised"
        >
          {open ? "Hide reasoning" : "Reasoning"}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
      </div>
      {open ? (
        <div className="border-t border-border bg-surface-raised px-4 py-3 text-sm leading-relaxed text-muted">
          {facet.detail}
        </div>
      ) : null}
    </div>
  );
}

export function RightsCard() {
  const r = demoRights;
  return (
    <Panel as="article" className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-raised text-sky-500 dark:text-sky-400">
            <Scale className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Passenger-rights estimate
            </h2>
            <p className="text-sm text-muted">
              Jurisdiction:{" "}
              <span className="font-medium text-foreground">
                {r.jurisdiction}
              </span>
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-surface-raised px-3 py-1.5 text-right">
          <div className="text-xs font-semibold text-foreground">
            {r.ruleVersion}
          </div>
          <div className="tnum text-xs text-muted">{r.effectiveDate}</div>
        </div>
      </div>

      {/* What may apply — answer first */}
      <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted">
        What may apply
      </h3>
      <div className="mt-2 space-y-3">
        {r.facets.map((f) => (
          <Facet key={f.key} facet={f} />
        ))}
      </div>

      {/* What we still need to know */}
      <div className="mt-6 rounded-xl border border-dashed border-unknown-500/40 bg-unknown-500/5 p-4">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <CircleHelp className="h-4 w-4 text-unknown-500" aria-hidden="true" />
          What we still need to know
        </h3>
        <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm text-muted">
          {r.needToKnow.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </div>

      {/* Deadline */}
      <div className="mt-4 flex items-start gap-2 rounded-xl border border-border p-4">
        <CalendarClock
          className="mt-0.5 h-4 w-4 shrink-0 text-sky-500 dark:text-sky-400"
          aria-hidden="true"
        />
        <div>
          <div className="text-sm font-semibold text-foreground">Deadline</div>
          <p className="text-sm text-muted">{r.deadline}</p>
        </div>
      </div>

      {/* Evidence checklist */}
      <div className="mt-4 rounded-xl border border-border p-4">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <ClipboardList
            className="h-4 w-4 text-sky-500 dark:text-sky-400"
            aria-hidden="true"
          />
          Evidence checklist
        </h3>
        <ul className="mt-2 space-y-2">
          {r.evidence.map((e) => (
            <li key={e} className="flex items-start gap-2 text-sm text-muted">
              <span
                className="mt-1 h-3.5 w-3.5 shrink-0 rounded-[4px] border border-border-strong"
                aria-hidden="true"
              />
              <span>{e}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Official sources */}
      <div className="mt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Official sources
        </h3>
        <ul className="mt-2 space-y-2">
          {r.sources.map((s) => (
            <li key={s.label}>
              <span className="inline-flex items-center gap-1.5 text-sm text-sky-600 underline decoration-sky-600/40 underline-offset-2 dark:text-sky-400 dark:decoration-sky-400/40">
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                {s.label}
              </span>
              <span className="ml-1 text-xs text-muted">({s.note})</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-5 border-t border-border pt-4 text-xs leading-relaxed text-muted">
        This is an estimate of what <em>may</em> apply under the cited rule
        version, based on the facts entered — not legal advice, and not a
        statement that you are owed anything. A contextual weather or airspace
        condition is not, by itself, legal cause. Confirm your situation against
        the official source above.
      </p>
    </Panel>
  );
}
