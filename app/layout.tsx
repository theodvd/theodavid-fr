import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

/* Self-hosted variable fonts (Fontshare) — zero external requests. */
const clash = localFont({
  src: "../fonts/ClashDisplay-Variable.woff2",
  variable: "--font-clash",
  weight: "200 700",
  display: "swap",
});

const satoshi = localFont({
  src: "../fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  weight: "300 900",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://theodavid.com"),
  title: "Théo David · Growth, Data & Systems",
  description:
    "Growth Data & Automation at Finary. Co-founder of Tiro. I build growth systems for fintech: data pipelines, AI automation and working products, shipped.",
  openGraph: {
    title: "Théo David · Growth, Data & Systems",
    description:
      "I build growth systems for fintech. Data pipelines, AI automation and working products, shipped.",
    url: "https://theodavid.com",
    siteName: "Théo David",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Théo David · Growth, Data & Systems",
    description: "I build growth systems for fintech.",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
};

/* Film grain — inline SVG turbulence, tiled over every page. */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='128' height='128' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${clash.variable} ${satoshi.variable} ${jetbrains.variable}`}
      // the astres gate stamps data-astres on <html> before hydration
      suppressHydrationWarning
    >
      <body>
        {children}
        <div
          className="pointer-events-none fixed inset-0 z-40 opacity-[0.05]"
          style={{ backgroundImage: GRAIN, backgroundSize: "128px 128px" }}
          aria-hidden="true"
        />
      </body>
    </html>
  );
}
