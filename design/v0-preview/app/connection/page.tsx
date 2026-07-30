import { AppHeader } from "@/components/app-header";
import { SiteFooter } from "@/components/site-footer";
import { DemoBanner } from "@/components/provenance";
import { ConnectionCockpit } from "@/components/connection-cockpit";

export default function ConnectionPage() {
  return (
    <div className="min-h-dvh bg-background">
      <AppHeader active="/connection" />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-sm font-medium uppercase tracking-wide text-sky-600 dark:text-sky-400">
          Connection cockpit
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Will your connection hold?
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          A transparent estimate of the minutes you have versus the minutes a
          transfer typically takes — with every assumption and every missing
          input named. No gauge, because this data does not support that
          precision.
        </p>
        <DemoBanner className="my-5" />
        <ConnectionCockpit />
      </main>
      <SiteFooter />
    </div>
  );
}
