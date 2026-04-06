import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Antra | Designer & AI Engineer",
  description: "Personal portfolio of Antra - Designer, Web Developer & AI Engineer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased selection:bg-[#F2AEBC] selection:text-white">
        {children}
      </body>
    </html>
  );
}
