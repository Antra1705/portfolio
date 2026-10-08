import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { GOATCOUNTER_CODE } from "../lib/analytics";

export const metadata: Metadata = {
  title: "Antra | Software Engineer & Data Scientist",
  description: "Personal portfolio of Antra - Software Engineer & Data Scientist.",
  icons: {
    icon: "/portfolio/favicon.png", // Correctly linking the favicon for your portfolio
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased selection:bg-pink selection:text-ink">
        {children}
        {/* Visitor counts (GoatCounter: no cookies, ignores localhost). Off until a code is set in lib/analytics.ts */}
        {GOATCOUNTER_CODE && (
          <Script
            data-goatcounter={`https://${GOATCOUNTER_CODE}.goatcounter.com/count`}
            src="https://gc.zgo.at/count.js"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
