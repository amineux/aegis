import type { Metadata, Viewport } from "next";
import ErrorBoundary from '@/components/ErrorBoundary';
import "./globals.css";
import {
  AUTHOR, PRODUCT_NAME, PRODUCT_SHORT, PRODUCT_TAGLINE, REPO_URL,
} from '@/lib/brand';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const SITE_TITLE = `${PRODUCT_NAME} — ${PRODUCT_TAGLINE} | Live Flights, CCTV & Recon`;
const SITE_DESCRIPTION = `${AUTHOR}’s personal OSINT command center. Track aircraft, satellites, and worldwide CCTV on a 3D globe. DNS, WHOIS, sanctions, earthquakes, wildfires, news, and conflict layers — self-hosted, no required API keys.`;

export const viewport: Viewport = {
  themeColor: "#D4AF37",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${PRODUCT_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "OSINT tools", "free OSINT tools", "online OSINT toolkit", "OSINT framework",
    "nmap online", "port scanner online",
    "DNS lookup tool", "WHOIS lookup",
    "threat intelligence", "network reconnaissance",
    "OSINT", "open source intelligence", "intelligence dashboard",
    "flight tracker", "ADS-B tracker",
    "satellite tracking",
    "CCTV cameras live",
    "earthquake monitor", "USGS earthquake",
    "wildfire tracker", "NASA FIRMS",
    PRODUCT_NAME, AUTHOR, "osiris-command",
  ],
  authors: [{ name: AUTHOR, url: REPO_URL }],
  creator: AUTHOR,
  publisher: AUTHOR,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/android-chrome-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/android-chrome-512x512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
    shortcut: "/favicon.ico",
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/apple-touch-icon.png",
      },
    ],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${PRODUCT_NAME} — ${PRODUCT_TAGLINE}`,
    description: `${AUTHOR}’s self-hosted intelligence dashboard. Live flights, CCTV, satellites, earthquakes, wildfires, news, and recon tools. No API keys required for core feeds.`,
    type: "website",
    siteName: PRODUCT_NAME,
    locale: "en_US",
    url: "/",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${PRODUCT_NAME} — ${PRODUCT_TAGLINE}`,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${PRODUCT_NAME} — ${PRODUCT_TAGLINE}`,
    description: `${AUTHOR}’s self-hosted OSINT dashboard. Live flights, CCTV, satellites, and recon tools.`,
    images: ["/og-image.png"],
  },
  category: "technology",
  classification: "Intelligence & Security",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": PRODUCT_NAME,
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#06060C",
    "msapplication-config": "none",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: PRODUCT_NAME,
  alternateName: [PRODUCT_NAME, PRODUCT_SHORT, `${AUTHOR} OSINT`],
  url: REPO_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: "SecurityApplication",
  operatingSystem: "Web",
  browserRequirements: "Requires a modern web browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  featureList: [
    "Real-time flight tracking via ADS-B",
    "Satellite tracking including ISS",
    "Worldwide public CCTV camera monitoring",
    "Earthquake monitoring (USGS live feed)",
    "Wildfire detection (NASA FIRMS)",
    "Nuclear facility mapping",
    "Severe weather alerts",
    "Cyber threat & CVE intelligence",
    "DNS, WHOIS, and certificate lookups",
    "OFAC SDN sanctions search",
    "Interactive 3D globe with day/night cycle",
    "Region intelligence dossier reports",
    "Mission profiles for disaster, aviation, and conflict watch",
  ],
  screenshot: "/og-image.png",
  author: {
    "@type": "Person",
    name: AUTHOR,
    url: REPO_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="canonical" href={SITE_URL} />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

      </head>
      <body className="antialiased">
        <ErrorBoundary name={PRODUCT_NAME}>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
