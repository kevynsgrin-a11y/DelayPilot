"use client";

import { useState } from "react";
import {
  ChevronDown,
  Plane,
  DoorOpen,
  Timer,
  ShieldCheck,
  Gauge,
} from "lucide-react";
import type { SegmentDatum } from "@/lib/demo";
import { Panel, SourceLine, Unknown } from "./provenance";
import { StatusPill } from "./status";

function TimePair({
  label,
  scheduled,
  current,
  tz,
  changed,
}: {
  label: string;
  scheduled: string;
  current: string;
  tz: string;
  changed: boolean;
}) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span
          className={`tnum text-2xl font-semibold ${
            changed ? "text-watch-500" : "text-foreground"
          }`}
        >
          {current}
        </span>
        {changed ? (
          <span className="tnum text-sm text-muted line-through">
            {scheduled}
          </span>
        ) : null}
      </div>
      <div className="tnum mt-0.5 text-xs text-muted">{tz}</div>
    </div>
  );
}

function Confidence({ level }: { level: SegmentDatum["confidence"] }) {
  if (level === "Unknown") {
    return <Unknown inline />;
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <Gauge className="h-4 w-4 text-muted" aria-hidden="true" />
      <span className="text-muted">Data confidence:</span>
      <span className="font-semibold text-foreground">{level}</span>
    </span>
  );
}

export function SegmentCard({ segment }: { segment: SegmentDatum }) {
  const [open, setOpen] = useState(false);
  const depChanged = segment.currentDep !== segment.scheduledDep;
  const arrChanged = segment.currentArr !== segment.scheduledArr;

  return (
    <Panel as="article" className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-raised text-sky-500 dark:text-sky-400">
            <Plane className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="tnum text-base font-semibold text-foreground">
                {segment.flightNumber}
              </span>
              <span className="text-sm text-muted">· {segment.airline}</span>
            </div>
            <div className="tnum mt-0.5 text-sm text-muted">
              {segment.origin.code} → {segment.destination.code}
              <span className="text-muted/70">
                {"  "}
                ({segment.origin.city} → {segment.destination.city})
              </span>
            </div>
          </div>
        </div>
        <StatusPill tone={segment.status.tone}>
          {segment.status.label}
        </StatusPill>
      </div>

      <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-5">
        <TimePair
          label="Departs"
          scheduled={segment.scheduledDep}
          current={segment.currentDep}
          tz={segment.depTzLabel}
          changed={depChanged}
        />
        <TimePair
          label="Arrives"
          scheduled={segment.scheduledArr}
          current={segment.currentArr}
          tz={segment.arrTzLabel}
          changed={arrChanged}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-border px-4 py-4 sm:grid-cols-4 sm:px-5">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
            <DoorOpen className="h-3.5 w-3.5" aria-hidden="true" /> Gate
          </div>
          <div className="mt-1">
            {segment.gate ? (
              <span className="tnum text-base font-semibold text-foreground">
                {segment.gate}
              </span>
            ) : (
              <Unknown inline />
            )}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted">
            Terminal
          </div>
          <div className="mt-1">
            {segment.terminal ? (
              <span className="tnum text-base font-semibold text-foreground">
                {segment.terminal}
              </span>
            ) : (
              <Unknown inline />
            )}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
            <Timer className="h-3.5 w-3.5" aria-hidden="true" /> Delay
          </div>
          <div className="mt-1">
            {segment.delayMinutes === null ? (
              <Unknown inline />
            ) : segment.delayMinutes === 0 ? (
              <span className="text-base font-semibold text-safe-500">
                None
              </span>
            ) : (
              <span className="tnum text-base font-semibold text-watch-500">
                +{segment.delayMinutes} min
              </span>
            )}
          </div>
        </div>
        <div className="flex items-end">
          <Confidence level={segment.confidence} />
        </div>
      </div>

      <div className="border-t border-border p-4 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SourceLine
            provenance={segment.provenance}
            freshness={segment.freshness}
            source={segment.source}
          />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="inline-flex h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-foreground hover:bg-surface-raised"
          >
            {open ? "Hide detail" : "Show detail"}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
        </div>

        {open ? (
          <div className="mt-4 grid gap-4 rounded-xl bg-surface-raised p-4 text-sm sm:grid-cols-2">
            <div>
              <div className="mb-1 font-semibold text-foreground">
                Stated cause
              </div>
              {segment.causeStated ? (
                <p className="text-muted">
                  {segment.causeStated}.{" "}
                  <span className="text-muted/80">
                    Shown as stated by the source — not a verified
                    determination.
                  </span>
                </p>
              ) : (
                <div className="flex items-center gap-2">
                  <Unknown inline />
                  <span className="text-muted">
                    No cause reported by the source.
                  </span>
                </div>
              )}
            </div>
            <div>
              <div className="mb-1 flex items-center gap-1.5 font-semibold text-foreground">
                <ShieldCheck className="h-4 w-4 text-muted" aria-hidden="true" />
                Data notes
              </div>
              <ul className="list-disc space-y-1 pl-4 text-muted">
                <li>Times shown in each airport&apos;s local zone.</li>
                <li>
                  Schedule figures reflect the most recent permitted response.
                </li>
                <li>Estimates update only when the source changes.</li>
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </Panel>
  );
}
