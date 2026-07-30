"use client";

import { useState } from "react";
import { Bell, Mail, Smartphone } from "lucide-react";
import { Panel } from "./provenance";

type Channel = { key: string; label: string; icon: typeof Bell; on: boolean };

function Toggle({
  label,
  icon: Icon,
  on,
  onToggle,
}: {
  label: string;
  icon: typeof Bell;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="flex items-center gap-2 text-sm text-foreground">
        <Icon className="h-4 w-4 text-muted" aria-hidden="true" />
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={`${label}: ${on ? "on" : "off"}`}
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors ${
          on
            ? "border-accent bg-accent"
            : "border-border-strong bg-surface-raised"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-cloud-50 shadow transition-transform ${
            on ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export function AlertSettings() {
  const [channels, setChannels] = useState<Channel[]>([
    { key: "push", label: "Push notifications", icon: Smartphone, on: true },
    { key: "email", label: "Email digest", icon: Mail, on: true },
    { key: "gate", label: "Gate & terminal changes", icon: Bell, on: true },
    { key: "sched", label: "Schedule changes over 15 min", icon: Bell, on: true },
    { key: "conn", label: "Connection-risk changes", icon: Bell, on: false },
  ]);

  return (
    <Panel className="p-5">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-sky-500 dark:text-sky-400" aria-hidden="true" />
        <h2 className="text-base font-semibold text-foreground">
          Alert settings
        </h2>
      </div>
      <p className="mt-1 text-sm text-muted">
        Deduplicated alerts. We notify you only when something meaningful
        changes.
      </p>
      <div className="mt-3 divide-y divide-border">
        {channels.map((c, i) => (
          <Toggle
            key={c.key}
            label={c.label}
            icon={c.icon}
            on={c.on}
            onToggle={() =>
              setChannels((prev) =>
                prev.map((p, idx) => (idx === i ? { ...p, on: !p.on } : p)),
              )
            }
          />
        ))}
      </div>
    </Panel>
  );
}
