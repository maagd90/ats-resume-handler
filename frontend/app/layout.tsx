import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AppShell from "@/components/AppShell";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { siteMetadata } from "@/lib/marketing/content";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: siteMetadata.title,
  description: siteMetadata.description,
  keywords: siteMetadata.keywords,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: siteMetadata.openGraph,
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.openGraph.title,
    description: siteMetadata.openGraph.description,
  },
  icons: { icon: "/icon.svg" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <ThemeProvider>
          <AnalyticsProvider />
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
