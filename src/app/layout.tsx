import type { Metadata } from "next";
import "./globals.css";
import { StructuredData } from "@/components/seo/StructuredData";
import { LayoutSwitch } from "@/components/layout/LayoutSwitch";

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "TRD Remedial - The Remedial Experts | Structural Solutions Sydney",
    template: "%s | TRD Remedial"
  },
  description: "Sydney's leading structural remediation and concrete repair specialists. Expert structural strengthening, crack injection, concrete cutting, concrete repairs, post tension truncation, slab scanning, and 24/7 emergency structural solutions across NSW. Building compliance guaranteed.",
  keywords: [
    "structural remediation Sydney",
    "concrete repair",
    "structural strengthening",
    "building compliance",
    "structural engineering",
    "crack injection",
    "concrete cutting",
    "GPR scanning",
    "slab scanning",
    "concrete repairs",
    "post tension truncation",
    "emergency structural repair",
    "building commissioner approved",
    "Sydney construction",
    "curtain wall injection",
    "structural alterations"
  ],
  authors: [{ name: "TRD Remedial", url: "https://trdremedial.com.au" }],
  creator: "TRD Remedial",
  publisher: "TRD Remedial",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://trdremedial.com.au"),
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "TRD Remedial - The Remedial Experts | Structural Solutions Sydney",
    description: "We solve structural challenges others can't handle. Expert remediation services: structural strengthening, concrete cutting, crack injection, concrete repairs, post tension truncation, slab scanning. 24/7 emergency response.",
    url: "https://trdremedial.com.au",
    siteName: "TRD Remedial",
    locale: "en_AU",
    type: "website",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TRD Remedial - Structural Remediation Experts",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TRD Remedial - The Remedial Experts",
    description: "Award-winning structural remediation. We solve challenges others can't handle. 24/7 emergency response.",
    images: ["/images/twitter-image.jpg"],
    creator: "@trdremedial",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // verification: {
  //   google: "YOUR_GOOGLE_VERIFICATION_CODE",
  //   yandex: "YOUR_YANDEX_VERIFICATION_CODE",
  // },
  category: "construction",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <StructuredData />
        {/* Font Preloading - Optimized for Performance (Only critical fonts preloaded) */}
        {/* PRIMARY FONT: Messina Sans Regular - Used for main body text */}
        <link
          rel="preload"
          href="/fonts/messina-sans/MessinaSans-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* SECONDARY FONTS: Loaded with lower priority for faster FCP */}
        <link
          rel="prefetch"
          href="/fonts/messina-sans/MessinaSans-SemiBold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="prefetch"
          href="/fonts/rader/PPRader-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="prefetch"
          href="/fonts/rader/PPRader-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className="antialiased"
      >
        <LayoutSwitch>{children}</LayoutSwitch>
      </body>
    </html>
  );
}
