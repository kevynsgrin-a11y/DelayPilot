import Link from "next/link";

/* DelayPilot's own brand mark — a radar arc with a route line and a
   heading marker. No third-party logos, wordmarks, or brand colors. */
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="16"
        cy="16"
        r="13"
        className="stroke-border-strong"
        strokeWidth="1.5"
      />
      <path
        d="M16 16 A13 13 0 0 1 27 9"
        className="stroke-sky-400"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6 22 L26 10"
        className="stroke-sky-500"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="2 3"
      />
      <path
        d="M22 9.5 L27 8 L25.5 13 Z"
        className="fill-sky-400"
      />
      <circle cx="16" cy="16" r="2.5" className="fill-sky-500" />
    </svg>
  );
}

export function Logo({
  className = "",
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className}`}
    >
      <LogoMark />
      <span className="text-lg">
        Delay<span className="text-sky-500 dark:text-sky-400">Pilot</span>
      </span>
    </Link>
  );
}
