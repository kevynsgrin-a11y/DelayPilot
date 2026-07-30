import { AppHeader } from "@/components/app-header";
import { SiteFooter } from "@/components/site-footer";
import { DemoBanner } from "@/components/provenance";
import { RightsCard } from "@/components/rights-card";

export default function RightsPage() {
  return (
    <div className="min-h-dvh bg-background">
      <AppHeader active="/rights" />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-sm font-medium uppercase tracking-wide text-sky-600 dark:text-sky-400">
          Passenger rights
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          What may apply — and why
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Answer-first guidance, versioned by effective date, with the reasoning
          one tap away. DelayPilot tells you what <em>may</em> apply under the
          cited rules; it never tells you that you are owed money.
        </p>
        <DemoBanner className="my-5" />
        <RightsCard />
      </main>
      <SiteFooter />
    </div>
  );
}
