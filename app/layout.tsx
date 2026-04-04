import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers";
import { NavProvider } from "./context/NavContext";
import { Navbar } from "./components/Navbar";

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

export const metadata: Metadata = {
  title: "Akshat Darshi",
  description: "Software Engineer",
};

import { SmoothScroll } from "./components/SmoothScroll";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${instrumentSerif.variable} antialiased transition-colors duration-300`}
      >
        <ThemeProvider>
          <NavProvider>
            <SmoothScroll>
              {children}
            </SmoothScroll>
            <Navbar />
          </NavProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
