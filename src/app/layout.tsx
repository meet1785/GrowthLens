import type { Metadata } from "next";
import { Outfit, IBM_Plex_Mono } from "next/font/google";
import { Providers } from "@/components/layout/Providers";
import { ToastContainer } from "@/components/ui/ToastContainer";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GrowthLens — AI-Powered Product Growth Analyzer",
  description:
    "Analyze any SaaS product and receive structured, actionable growth insights on UX, conversion, and monetization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${outfit.variable} ${ibmPlexMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <ToastContainer />
        </Providers>
      </body>
    </html>
  );
}
