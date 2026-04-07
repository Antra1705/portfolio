import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Antra | Designer & AI Engineer",
  description: "Personal portfolio of Antra - Designer, Web Developer & AI Engineer.",
  icons: {
    icon: "/favicon.png", // Correctly linking the favicon for your portfolio
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
        <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased selection:bg-[#F2AEBC] selection:text-white">
        {children}
      </body>
    </html>
  );
}
