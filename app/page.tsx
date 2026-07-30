import { AppHeader } from "@/components/app-header";
import { SiteFooter } from "@/components/site-footer";
import {
  Hero,
  DemoResult,
  WhatWeTell,
  ConnectionExplainer,
  RightsExplainer,
  MonitoringDemo,
  Pricing,
  SourceStrip,
  Guides,
} from "@/components/home-sections";

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* compact header */}
      <AppHeader />
      <main id="main" className="flex-1">
        {/* hero with primary flight-lookup form + trust line */}
        <Hero />
        {/* interactive demo result */}
        <DemoResult />
        {/* what DelayPilot tells you */}
        <WhatWeTell />
        {/* connection-risk explainer */}
        <ConnectionExplainer />
        {/* passenger-rights explainer */}
        <RightsExplainer />
        {/* monitoring / alert demo */}
        <MonitoringDemo />
        {/* pricing cards */}
        <Pricing />
        {/* source & methodology strip */}
        <SourceStrip />
        {/* selected guides */}
        <Guides />
      </main>
      {/* footer */}
      <SiteFooter />
    </div>
  );
}
