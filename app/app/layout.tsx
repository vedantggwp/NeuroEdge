import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { Header } from "@/components/Header";
import { SITE } from "@/lib/constants";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  metadataBase: new URL(SITE.url),
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    siteName: SITE.name,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="relative min-h-full flex flex-col bg-bg-primary text-text-primary font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-text-inverse focus:font-medium focus:shadow-lg"
        >
          Skip to main content
        </a>
        {process.env.NEXT_PUBLIC_POSTHOG_KEY ? (
          <Script
            strategy="afterInteractive"
            src="https://us-assets.i.posthog.com/static/array.js"
            data-api-host="https://us.i.posthog.com"
            data-project-api-key={process.env.NEXT_PUBLIC_POSTHOG_KEY}
          />
        ) : null}
        <Header />
        {children}
      </body>
    </html>
  );
}
