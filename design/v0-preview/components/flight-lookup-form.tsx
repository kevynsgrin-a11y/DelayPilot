"use client";

import { useId, useState } from "react";
import { Plane, Route, Search, CheckCircle2, AlertCircle } from "lucide-react";

type Mode = "flight" | "route";

const AIRLINE_EXAMPLES = [
  "Meridian Air (MR)",
  "Cascade Connect (CC)",
  "Northwind (NW)",
  "Solstice Airways (SL)",
];
const AIRPORT_EXAMPLES = ["PDX — Portland", "DEN — Denver", "JFK — New York", "LHR — London"];

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-foreground"
      >
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p className="mt-1 flex items-center gap-1 text-xs text-critical-500">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

const inputBase =
  "h-12 w-full rounded-xl border border-border bg-surface px-3 text-base text-foreground placeholder:text-muted focus:border-accent";

export function FlightLookupForm({ compact = false }: { compact?: boolean }) {
  const [mode, setMode] = useState<Mode>("flight");
  const [airline, setAirline] = useState("");
  const [flightNo, setFlightNo] = useState("");
  const [flightErr, setFlightErr] = useState<string>();
  const [submitted, setSubmitted] = useState(false);

  const uid = useId();
  const airlineListId = `${uid}-airlines`;
  const airportListId = `${uid}-airports`;

  function validateFlightNo(v: string) {
    if (!v) {
      setFlightErr("Enter the flight number, digits only (e.g. 1487).");
      return false;
    }
    if (!/^\d{1,4}$/.test(v.trim())) {
      setFlightErr("Flight number should be 1–4 digits, no letters.");
      return false;
    }
    setFlightErr(undefined);
    return true;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "flight" && !validateFlightNo(flightNo)) return;
    setSubmitted(true);
  }

  return (
    <div
      className={`rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6 ${
        compact ? "" : ""
      }`}
    >
      {/* Mode toggle */}
      <div
        role="tablist"
        aria-label="Lookup mode"
        className="mb-5 inline-flex rounded-xl border border-border bg-surface-raised p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "flight"}
          onClick={() => setMode("flight")}
          className={`inline-flex h-11 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold transition-colors ${
            mode === "flight"
              ? "bg-accent text-accent-contrast"
              : "text-muted hover:text-foreground"
          }`}
        >
          <Plane className="h-4 w-4" aria-hidden="true" /> By flight
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "route"}
          onClick={() => setMode("route")}
          className={`inline-flex h-11 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold transition-colors ${
            mode === "route"
              ? "bg-accent text-accent-contrast"
              : "text-muted hover:text-foreground"
          }`}
        >
          <Route className="h-4 w-4" aria-hidden="true" /> By route &amp; time
        </button>
      </div>

      {/* Shared datalists for keyboard-friendly comboboxes */}
      <datalist id={airlineListId}>
        {AIRLINE_EXAMPLES.map((a) => (
          <option key={a} value={a} />
        ))}
      </datalist>
      <datalist id={airportListId}>
        {AIRPORT_EXAMPLES.map((a) => (
          <option key={a} value={a} />
        ))}
      </datalist>

      <form onSubmit={onSubmit} noValidate>
        {mode === "flight" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Airline name or code"
              htmlFor={`${uid}-airline`}
              hint="Type a name or 2-letter code. Example: Meridian Air or MR."
            >
              <input
                id={`${uid}-airline`}
                list={airlineListId}
                value={airline}
                onChange={(e) => setAirline(e.target.value)}
                placeholder="e.g. Meridian Air (MR)"
                className={inputBase}
                autoComplete="off"
              />
            </Field>
            <Field
              label="Flight number"
              htmlFor={`${uid}-flightno`}
              hint="Digits only. Example: 1487."
              error={flightErr}
            >
              <input
                id={`${uid}-flightno`}
                inputMode="numeric"
                value={flightNo}
                onChange={(e) => setFlightNo(e.target.value)}
                onBlur={(e) => validateFlightNo(e.target.value)}
                placeholder="e.g. 1487"
                className={`${inputBase} tnum ${
                  flightErr ? "border-critical-500" : ""
                }`}
                aria-invalid={flightErr ? true : undefined}
              />
            </Field>
            <Field
              label="Date of departure"
              htmlFor={`${uid}-date`}
              hint="Departure date in the origin's local time."
            >
              <input
                id={`${uid}-date`}
                type="date"
                className={`${inputBase} tnum`}
              />
            </Field>
            <Field
              label="Origin / destination (optional)"
              htmlFor={`${uid}-disambig`}
              hint="Only needed if a flight number is reused on the day."
            >
              <input
                id={`${uid}-disambig`}
                list={airportListId}
                placeholder="e.g. PDX or PDX → DEN"
                className={inputBase}
                autoComplete="off"
              />
            </Field>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Origin"
              htmlFor={`${uid}-origin`}
              hint="Airport name or 3-letter code."
            >
              <input
                id={`${uid}-origin`}
                list={airportListId}
                placeholder="e.g. PDX — Portland"
                className={inputBase}
                autoComplete="off"
              />
            </Field>
            <Field
              label="Destination"
              htmlFor={`${uid}-dest`}
              hint="Airport name or 3-letter code."
            >
              <input
                id={`${uid}-dest`}
                list={airportListId}
                placeholder="e.g. JFK — New York"
                className={inputBase}
                autoComplete="off"
              />
            </Field>
            <Field
              label="Date"
              htmlFor={`${uid}-rdate`}
              hint="Travel date in the origin's local time."
            >
              <input
                id={`${uid}-rdate`}
                type="date"
                className={`${inputBase} tnum`}
              />
            </Field>
            <Field
              label="Approximate time"
              htmlFor={`${uid}-time`}
              hint="Roughly when you depart — we widen the search."
            >
              <input
                id={`${uid}-time`}
                type="time"
                className={`${inputBase} tnum`}
              />
            </Field>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            No booking reference required, ever. We never ask for a PNR or record
            locator.
          </p>
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-base font-semibold text-accent-contrast transition-opacity hover:opacity-90"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
            Track this flight
          </button>
        </div>
      </form>

      {submitted ? (
        <div
          role="status"
          className="mt-4 flex items-center gap-2 rounded-xl border border-safe-500/40 bg-safe-500/10 px-3 py-2 text-sm text-safe-500"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Demo form — inputs validated. In the product this opens your trip
          cockpit.
        </div>
      ) : null}
    </div>
  );
}
