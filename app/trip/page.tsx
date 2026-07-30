import { AppHeader } from "@/components/app-header";
import { SiteFooter } from "@/components/site-footer";
import { DemoBanner } from "@/components/provenance";
import { SegmentCard } from "@/components/segment-card";
import { ConnectionCockpit } from "@/components/connection-cockpit";
import { RightsCard } from "@/components/rights-card";
import { AlertSettings } from "@/components/alert-settings";
import {
  TripHeader,
  OverallStatus,
  Itinerary,
  LatestChange,
  NextBestAction,
  DelayAssessment,
  WeatherAirspace,
  EvidenceOrganizer,
  SourceFreshnessPanel,
} from "@/components/cockpit-panels";
import { demoSegments } from "@/lib/demo";

export default function TripCockpitPage() {
  return (
    <div className="min-h-dvh bg-background">
      <AppHeader active="/trip" />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <DemoBanner className="mb-4" />
        <TripHeader />

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Primary: action + itinerary (8 cols) */}
          <div className="flex flex-col gap-5 lg:col-span-8">
            <OverallStatus />
            <Itinerary />

            <section aria-labelledby="segments-heading" className="flex flex-col gap-4">
              <h2
                id="segments-heading"
                className="text-sm font-semibold uppercase tracking-wide text-muted"
              >
                Flight segments
              </h2>
              {demoSegments.map((seg) => (
                <SegmentCard key={seg.id} segment={seg} />
              ))}
            </section>

            <LatestChange />
            <NextBestAction />
            <DelayAssessment />
            <ConnectionCockpit />
            <RightsCard />
          </div>

          {/* Secondary: source / alerts / supporting (4 cols) */}
          <aside className="flex flex-col gap-5 lg:col-span-4">
            <SourceFreshnessPanel />
            <AlertSettings />
            <WeatherAirspace />
            <EvidenceOrganizer />
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
