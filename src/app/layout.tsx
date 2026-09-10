import type { Metadata, Viewport } from "next";
import ErrorBoundary from '@/components/ErrorBoundary';
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const REPO_URL = "https://github.com/amineux/osiris-hq";
const SITE_NAME = "Osiris HQ";
const SITE_TITLE = "Osiris HQ — Personal OSINT Command Center | Live Flights, CCTV & Recon";
const SITE_DESCRIPTION = "amineux’s personal OSINT command center. Track aircraft, satellites, and worldwide CCTV on a 3D globe. DNS, WHOIS, sanctions, earthquakes, wildfires, news, and conflict layers — self-hosted, no required API keys. Based on the open-source OSIRIS project.";

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
    template: "%s | Osiris HQ",
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
    "Osiris HQ", "amineux", "osiris-hq",
  ],
  authors: [{ name: "amineux", url: REPO_URL }],
  creator: "amineux",
  publisher: "amineux",
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
    title: "Osiris HQ — Personal OSINT Command Center",
    description: "amineux’s self-hosted intelligence dashboard. Live flights, CCTV, satellites, earthquakes, wildfires, news, and recon tools. No API keys required for core feeds.",
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: "/",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Osiris HQ — Personal OSINT command center",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Osiris HQ — Personal OSINT Command Center",
    description: "amineux’s self-hosted OSINT dashboard. Live flights, CCTV, satellites, and recon tools.",
    images: ["/og-image.png"],
  },
  category: "technology",
  classification: "Intelligence & Security",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Osiris HQ",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#06060C",
    "msapplication-config": "none",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Osiris HQ",
  alternateName: ["Osiris HQ", "OSIRIS HQ", "amineux OSINT"],
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
  ],
  screenshot: "/og-image.png",
  author: {
    "@type": "Person",
    name: "amineux",
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
        <ErrorBoundary name="Osiris HQ">
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
