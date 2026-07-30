import { AppHeader } from "@/components/app-header";
import { SiteFooter } from "@/components/site-footer";
import { FlightLookupForm } from "@/components/flight-lookup-form";

export default function LookupPage() {
  return (
    <div className="min-h-dvh bg-background">
      <AppHeader active="/lookup" />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-sm font-medium uppercase tracking-wide text-sky-600 dark:text-sky-400">
          Track a flight
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl text-balance">
          Find your flight by number, or by route and time
        </h1>
        <p className="mt-2 max-w-2xl text-muted text-pretty">
          Two ways in. Both are keyboard-friendly, both validate as you type,
          and neither needs a booking code.
        </p>
        <div className="mt-6">
          <FlightLookupForm />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
