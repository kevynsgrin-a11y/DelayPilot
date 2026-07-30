import Link from "next/link";
import Image from "next/image";
import {
  Radar,
  Link2,
  FileClock,
  Bell,
  ShieldCheck,
  Scale,
  ArrowRight,
  Check,
  BookOpen,
  Split,
  Gauge,
  ListChecks,
  Database,
} from "lucide-react";
import { FlightLookupForm } from "./flight-lookup-form";
import { SegmentCard } from "./segment-card";
import { Panel, DemoBanner, SourceLine } from "./provenance";
import { RiskBand, StatusPill } from "./status";
import { ImageSection, ImageCard } from "./image-section";
import { demoSegments } from "@/lib/demo";

/* ---------------- Hero + trust line ---------------- */
export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-surface">
      {/* Background image with overlay */}
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src="/images/hero-traveler.png"
          alt=""
          fill
          className="object-cover opacity-[0.08] dark:opacity-[0.12]"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-surface/50 via-surface/80 to-surface" />
      </div>

      {/* faint radar-arc motif, decorative */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[36rem] w-[36rem] rounded-full border border-border-strong/40"
      >
        <div className="absolute inset-16 rounded-full border border-border-strong/30" />
        <div className="absolute inset-32 rounded-full border border-border-strong/20" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-16">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
            Flight disruption intelligence
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground text-balance sm:text-5xl">
            Stay ahead of flight disruptions.
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted text-pretty">
            Track a flight, understand connection risk, and see the refund,
            care, and rebooking rules that may apply—before airport chaos makes
            the decision for you.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/lookup"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-accent px-6 text-base font-semibold text-accent-contrast transition-opacity hover:opacity-90"
            >
              Track a flight <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              href="/trip"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-surface px-6 text-base font-semibold text-foreground transition-colors hover:bg-surface-raised"
            >
              Try the demo
            </Link>
          </div>
          {/* trust line */}
          <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
            <span>Source-linked status</span>
            <span aria-hidden="true">·</span>
            <span>Versioned passenger-rights rules</span>
            <span aria-hidden="true">·</span>
            <span>No booking code required</span>
          </p>
        </div>

        {/* Primary flight-lookup form — visible above the fold on mobile too */}
        <div className="lg:pl-4">
          <FlightLookupForm />
        </div>
      </div>
    </section>
  );
}

/* ---------------- Interactive demo result ---------------- */
export function DemoResult() {
  return (
    <section
      aria-labelledby="demo-heading"
      className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="demo-heading"
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            See a disruption, decoded
          </h2>
          <p className="mt-2 max-w-2xl text-muted">
            This is what a delayed segment looks like in DelayPilot — status,
            provenance, freshness, and an honest risk band, with nothing
            invented.
          </p>
        </div>
        <Link
          href="/trip"
          className="inline-flex h-11 items-center gap-1.5 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-foreground hover:bg-surface-raised"
        >
          Open full cockpit <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <DemoBanner className="mt-5" />

      <div className="mt-4 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SegmentCard segment={demoSegments[0]} />
        </div>
        <Panel className="flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">
              At a glance
            </h3>
            <StatusPill tone="watch">Delayed</StatusPill>
          </div>
          <RiskBand level="moderate" />
          <ul className="space-y-2 text-sm text-muted">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-safe-500" aria-hidden="true" />
              Connection still workable
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-safe-500" aria-hidden="true" />
              No cancellation signal
            </li>
          </ul>
          <SourceLine provenance="Live" freshness="Updated 4 min ago" />
        </Panel>
      </div>
    </section>
  );
}

/* ---------------- What DelayPilot tells you ---------------- */
export function WhatWeTell() {
  const features = [
    {
      icon: Radar,
      title: "What is happening",
      body: "Current status, schedule changes, and gate or terminal moves where licensed data supports them.",
      image: "/images/frustrated-waiting.png",
      imageAlt: "Traveler checking flight status in airport lobby",
    },
    {
      icon: Gauge,
      title: "How much to trust it",
      body: "Every datum carries its source, freshness, and a provenance label. Unknown is a designed state, never a blank.",
      image: "/images/monitoring-peace.png",
      imageAlt: "Relaxed traveler with confidence in flight information",
    },
    {
      icon: Split,
      title: "What may happen next",
      body: "A transparent, qualitative risk band for delay, cancellation, and connection — with the factors that drive it.",
      image: "/images/connection-stress.png",
      imageAlt: "Traveler navigating airport connection",
    },
    {
      icon: ListChecks,
      title: "What to do now",
      body: "A prioritized next-best-action checklist for the disruption in front of you. We never act on your behalf.",
      image: "/images/rights-empowered.png",
      imageAlt: "Empowered traveler at service desk",
    },
    {
      icon: Scale,
      title: "Which rules may apply",
      body: "Source-linked passenger-rights guidance for the US, EU, UK, and Canada, versioned by effective date.",
      image: "/images/success-boarding.png",
      imageAlt: "Happy passengers boarding aircraft",
    },
    {
      icon: FileClock,
      title: "A record you can use",
      body: "A factual chronology and receipt organizer you can export as a printable evidence packet.",
      image: "/images/business-comfort.png",
      imageAlt: "Comfortable traveler in premium cabin",
    },
  ];
  return (
    <section
      aria-labelledby="what-heading"
      className="border-y border-border bg-surface"
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2
          id="what-heading"
          className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          What DelayPilot tells you
        </h2>
        <p className="mt-2 max-w-2xl text-muted">
          Five questions, answered the way an operations desk would — calm,
          sourced, and precise about uncertainty.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Panel key={f.title} className="group overflow-hidden p-0">
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={f.image}
                  alt={f.imageAlt}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent"
                />
                <span className="absolute bottom-3 left-3 flex h-11 w-11 items-center justify-center rounded-xl bg-surface/90 text-sky-500 backdrop-blur-sm dark:text-sky-400">
                  <f.icon className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-base font-semibold text-foreground">
                  {f.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {f.body}
                </p>
              </div>
            </Panel>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Connection-risk explainer ---------------- */
export function ConnectionExplainer() {
  return (
    <section
      aria-labelledby="conn-heading"
      className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"
    >
      <ImageSection
        imageSrc="/images/connection-stress.png"
        imageAlt="Traveler rushing through airport terminal to make a connection"
        imagePosition="right"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
            Connection risk
          </p>
          <h2
            id="conn-heading"
            className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl text-balance"
          >
            Minutes you have vs. minutes a transfer takes
          </h2>
          <p className="mt-3 text-muted text-pretty">
            We separate a protected through-ticket from a self-transfer, then
            break the connection into its parts — deplane, walk, security,
            immigration, bags, mobility, and an honest uncertainty buffer. You
            see the slack, the assumptions, and the data we are missing.
          </p>
          <p className="mt-3 text-sm text-muted">
            No speedometer, no false precision. Just a qualitative band and the
            reasoning behind it.
          </p>
          <Link
            href="/connection"
            className="mt-5 inline-flex h-11 items-center gap-1.5 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-contrast hover:opacity-90"
          >
            See a connection check <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </ImageSection>
    </section>
  );
}

/* ---------------- Passenger-rights explainer ---------------- */
export function RightsExplainer() {
  return (
    <section
      aria-labelledby="rights-heading"
      className="border-y border-border bg-surface"
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <ImageSection
          imageSrc="/images/rights-empowered.png"
          imageAlt="Confident traveler discussing options at airport service desk"
          imagePosition="left"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
              Passenger rights
            </p>
            <h2
              id="rights-heading"
              className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl text-balance"
            >
              What may apply — never what you are owed
            </h2>
            <p className="mt-3 text-muted text-pretty">
              Rights render as versioned data with effective dates, not prose
              buried in an app. Each answer comes first; the reasoning and the
              official source are one tap away. We say &quot;may apply&quot; — never
              &quot;guaranteed compensation.&quot;
            </p>
            <Link
              href="/rights"
              className="mt-5 inline-flex h-11 items-center gap-1.5 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-contrast hover:opacity-90"
            >
              See a rights estimate <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </ImageSection>
      </div>
    </section>
  );
}

/* ---------------- Monitoring / alert demo ---------------- */
export function MonitoringDemo() {
  const alerts = [
    {
      tone: "watch" as const,
      title: "Departure moved to 14:52 PT",
      meta: "MR 1487 · 4 min ago",
    },
    {
      tone: "safe" as const,
      title: "Onward flight still on time",
      meta: "CC 902 · 6 min ago",
    },
    {
      tone: "safe" as const,
      title: "Connection slack recalculated: 18 min",
      meta: "DEN · 6 min ago",
    },
  ];
  return (
    <section
      aria-labelledby="monitor-heading"
      className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"
    >
      <ImageSection
        imageSrc="/images/monitoring-peace.png"
        imageAlt="Relaxed traveler in airport lounge with peace of mind"
        imagePosition="right"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
            Monitoring
          </p>
          <h2
            id="monitor-heading"
            className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl text-balance"
          >
            Deduplicated alerts, only when it matters
          </h2>
          <p className="mt-3 text-muted text-pretty">
            Save a trip and DelayPilot watches it for you. You hear from us when
            something meaningful changes — a schedule move, a gate change, a
            shift in connection slack — not on a timer, and never twice for the
            same event.
          </p>
          <Panel className="mt-6 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Bell className="h-5 w-5 text-sky-500 dark:text-sky-400" aria-hidden="true" />
              <h3 className="text-base font-semibold text-foreground">
                Recent alerts
              </h3>
              <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-safe-500">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="dp-live-dot absolute inline-flex h-2 w-2 rounded-full bg-safe-500" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-safe-500" />
                </span>
                Monitoring
              </span>
            </div>
            <ul className="space-y-2">
              {alerts.map((a) => (
                <li
                  key={a.title}
                  className="flex items-start gap-3 rounded-xl border border-border p-3"
                >
                  <StatusPill tone={a.tone} size="sm">
                    {a.tone === "watch" ? "Change" : "OK"}
                  </StatusPill>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {a.title}
                    </div>
                    <div className="tnum text-xs text-muted">{a.meta}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </ImageSection>
    </section>
  );
}

/* ---------------- Travel journey showcase ---------------- */
export function TravelJourney() {
  const moments = [
    {
      image: "/images/success-boarding.png",
      imageAlt: "Happy passengers boarding aircraft with smiling flight attendant",
      title: "Boarding with confidence",
      description: "Know your connection is protected before you step on the plane.",
    },
    {
      image: "/images/happy-family.png",
      imageAlt: "Happy family seated comfortably in airplane seats",
      title: "Peace of mind in the air",
      description: "Real-time updates mean no surprises when you land.",
    },
    {
      image: "/images/business-comfort.png",
      imageAlt: "Business traveler resting comfortably in premium cabin",
      title: "Rest easy",
      description: "Monitoring continues even while you sleep at 35,000 feet.",
    },
  ];

  return (
    <section
      aria-labelledby="journey-heading"
      className="border-y border-border bg-surface"
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2
            id="journey-heading"
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl text-balance"
          >
            From uncertainty to arrival
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted text-pretty">
            DelayPilot turns travel anxiety into informed confidence — so you
            can focus on the journey, not the what-ifs.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {moments.map((m) => (
            <ImageCard
              key={m.title}
              imageSrc={m.image}
              imageAlt={m.imageAlt}
              title={m.title}
              description={m.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Pricing ---------------- */
export function Pricing() {
  const tiers = [
    {
      name: "Free",
      price: "$0",
      cadence: "always",
      blurb: "Track a flight and see status with full provenance.",
      features: [
        "Single-flight tracking",
        "Status with source & freshness",
        "Basic rights overview",
      ],
      ads: true,
      cta: "Start free",
      highlighted: false,
    },
    {
      name: "Trip Pass",
      price: "$9",
      cadence: "per trip",
      blurb: "Full cockpit for one trip, monitored end to end. Ad-free.",
      features: [
        "Multi-segment cockpit",
        "Connection assessment",
        "Deduplicated alerts",
        "Evidence packet export",
      ],
      ads: false,
      cta: "Cover a trip",
      highlighted: true,
    },
    {
      name: "Plus",
      price: "$49",
      cadence: "per year",
      blurb: "Unlimited trips and household sharing. Ad-free.",
      features: [
        "Unlimited monitored trips",
        "Family sharing",
        "Priority rule-set updates",
        "Full evidence history",
      ],
      ads: false,
      cta: "Go Plus",
      highlighted: false,
    },
  ];
  return (
    <section
      aria-labelledby="pricing-heading"
      className="border-y border-border bg-surface"
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2
          id="pricing-heading"
          className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          Simple pricing
        </h2>
        <p className="mt-2 max-w-2xl text-muted">
          Paid tiers are entirely ad-free. Utility and official rights
          information always come before any commercial suggestion.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {tiers.map((t) => (
            <Panel
              key={t.name}
              className={`flex flex-col p-6 ${
                t.highlighted ? "border-accent ring-1 ring-accent" : ""
              }`}
            >
              {t.highlighted ? (
                <span className="mb-3 inline-flex w-fit items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-contrast">
                  Most popular
                </span>
              ) : null}
              <h3 className="text-lg font-semibold text-foreground">
                {t.name}
              </h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="tnum text-4xl font-semibold text-foreground">
                  {t.price}
                </span>
                <span className="text-sm text-muted">{t.cadence}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{t.blurb}</p>
              <ul className="mt-4 flex-1 space-y-2">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-safe-500"
                      aria-hidden="true"
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-xs text-muted">
                {t.ads ? "Includes clearly-labelled ads" : "Ad-free"}
              </div>
              <button
                type="button"
                className={`mt-4 inline-flex h-12 items-center justify-center rounded-xl px-5 text-base font-semibold ${
                  t.highlighted
                    ? "bg-accent text-accent-contrast hover:opacity-90"
                    : "border border-border bg-surface-raised text-foreground hover:bg-surface"
                }`}
              >
                {t.cta}
              </button>
            </Panel>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Source & methodology strip ---------------- */
export function SourceStrip() {
  const items = [
    {
      icon: Database,
      title: "Licensed providers only",
      body: "Live status comes from licensed flight-data providers, shown with source and freshness. We fail closed rather than serve fixtures as live.",
    },
    {
      icon: Link2,
      title: "Source-linked rules",
      body: "Passenger-rights guidance links to the official regulator or carrier source, versioned by effective date.",
    },
    {
      icon: ShieldCheck,
      title: "Independent",
      body: "Not an airline, airport, regulator, law firm, or claims company. No third-party logos or brand colors.",
    },
  ];
  return (
    <section
      aria-labelledby="source-heading"
      className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"
    >
      <h2
        id="source-heading"
        className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
      >
        Sources &amp; methodology
      </h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {items.map((i) => (
          <div
            key={i.title}
            className="flex gap-3 rounded-2xl border border-border bg-surface p-5"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 dark:text-sky-400">
              <i.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {i.title}
              </h3>
              <p className="mt-1 text-sm text-muted">{i.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Selected guides ---------------- */
export function Guides() {
  const guides = [
    {
      tag: "US · DOT",
      title: "When a US delay or cancellation means a refund",
      read: "6 min read",
    },
    {
      tag: "EU · 261",
      title: "EU261 care and compensation, in plain language",
      read: "8 min read",
    },
    {
      tag: "Connections",
      title: "Protected through-tickets vs. self-transfers",
      read: "5 min read",
    },
  ];
  return (
    <section
      aria-labelledby="guides-heading"
      className="border-t border-border bg-surface"
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-sky-500 dark:text-sky-400" aria-hidden="true" />
          <h2
            id="guides-heading"
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            Selected guides
          </h2>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {guides.map((g) => (
            <article
              key={g.title}
              className="group flex flex-col rounded-2xl border border-border bg-background p-5 transition-colors hover:border-border-strong"
            >
              <span className="w-fit rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-medium text-muted">
                {g.tag}
              </span>
              <h3 className="mt-3 flex-1 text-base font-semibold text-foreground text-pretty">
                {g.title}
              </h3>
              <div className="mt-4 flex items-center justify-between text-sm text-muted">
                <span>{g.read}</span>
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
