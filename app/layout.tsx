import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers";
import { NavProvider } from "./context/NavContext";
import { Navbar } from "./components/Navbar";
import { SmoothScroll } from "./components/SmoothScroll";
import { ReadingProgress } from "./components/ReadingProgress";
import { KonamiEasterEgg } from "./components/KonamiEasterEgg";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-reading-serif",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://akshatdarshi.dev"),
  title: {
    default: "Akshat Darshi",
    template: "%s | Akshat Darshi",
  },
  description:
    "Software engineer building production-grade SaaS & GenAI systems. Backend-heavy full-stack engineer.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Akshat Darshi",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${instrumentSerif.variable} ${sourceSerif.variable} antialiased transition-colors duration-300`}
      >
        <ThemeProvider>
          <NavProvider>
            <ReadingProgress />
            <KonamiEasterEgg />
            <SmoothScroll>{children}</SmoothScroll>
            <Navbar />
          </NavProvider>
        </ThemeProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
