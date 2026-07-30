import Link from "next/link";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            Flight disruption intelligence. Source-linked status, versioned
            passenger-rights rules, no booking code required.
          </p>
        </div>

        <nav aria-label="Product" className="text-sm">
          <h2 className="mb-3 font-semibold text-foreground">Product</h2>
          <ul className="space-y-2 text-muted">
            <li>
              <Link className="hover:text-foreground" href="/lookup">
                Track a flight
              </Link>
            </li>
            <li>
              <Link className="hover:text-foreground" href="/trip">
                Trip cockpit
              </Link>
            </li>
            <li>
              <Link className="hover:text-foreground" href="/connection">
                Connection check
              </Link>
            </li>
            <li>
              <Link className="hover:text-foreground" href="/rights">
                Passenger rights
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Resources" className="text-sm">
          <h2 className="mb-3 font-semibold text-foreground">Resources</h2>
          <ul className="space-y-2 text-muted">
            <li>
              <span className="hover:text-foreground">Guides</span>
            </li>
            <li>
              <span className="hover:text-foreground">Sources &amp; methodology</span>
            </li>
            <li>
              <span className="hover:text-foreground">Rule-set changelog</span>
            </li>
            <li>
              <span className="hover:text-foreground">Status</span>
            </li>
          </ul>
        </nav>

        <nav aria-label="Legal" className="text-sm">
          <h2 className="mb-3 font-semibold text-foreground">Legal</h2>
          <ul className="space-y-2 text-muted">
            <li>
              <span className="hover:text-foreground">Privacy</span>
            </li>
            <li>
              <span className="hover:text-foreground">Terms</span>
            </li>
            <li>
              <span className="hover:text-foreground">Cookie choices</span>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto max-w-7xl px-4 py-6 text-xs leading-relaxed text-muted sm:px-6 lg:px-8">
          DelayPilot is an independent travel-information tool. It is not an
          airline, airport, government agency, law firm, claims company, or
          flight-data provider. Guidance is informational, is expressed as what{" "}
          <em>may</em> apply under the cited rule version, and may not reflect
          every fact in your case. DelayPilot never files a claim, books,
          rebooks, or requests a refund on your behalf.
        </p>
      </div>
    </footer>
  );
}
