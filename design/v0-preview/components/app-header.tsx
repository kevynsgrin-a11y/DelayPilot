import Link from "next/link";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/lookup", label: "Track a flight" },
  { href: "/trip", label: "Trip cockpit" },
  { href: "/connection", label: "Connection" },
  { href: "/rights", label: "Rights" },
];

export function AppHeader({ active }: { active?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => {
              const isActive = active === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`inline-flex h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-surface text-foreground"
                        : "text-muted hover:bg-surface hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/lookup"
            className="hidden h-11 items-center rounded-lg bg-accent px-4 text-sm font-semibold text-accent-contrast transition-opacity hover:opacity-90 sm:inline-flex"
          >
            Track a flight
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
