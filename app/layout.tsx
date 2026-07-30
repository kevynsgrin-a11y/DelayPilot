import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DelayPilot — Stay ahead of flight disruptions",
  description:
    "Track a flight, understand connection risk, and see the refund, care, and rebooking rules that may apply—before airport chaos makes the decision for you.",
  applicationName: "DelayPilot",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef5fb" },
    { media: "(prefers-color-scheme: dark)", color: "#050b16" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} bg-background`}>
      <head>
        {/* Respect system theme on first paint; toggle overrides at runtime. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('dp-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
