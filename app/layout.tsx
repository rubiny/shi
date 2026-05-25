import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f59e0b",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://shit.army"),
  title: "SHIT.ARMY | The Meme Army That Pays",
  description: "Join the most degenerate army on Base. Complete offers, stake $SHIT, recruit soldiers & earn real crypto. No BS. Just poop & profit.",
  manifest: "/manifest.json",
  icons: {
    icon: "/white-shit-logo.png",
    apple: "/icons/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SHIT.ARMY",
  },
  openGraph: {
    title: "SHIT.ARMY | The Meme Army That Pays",
    description: "Join the most degenerate army on Base. Earn $SHIT through offerwalls, staking, NFTs, and referrals.",
    url: "https://shit.army",
    siteName: "SHIT.ARMY",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SHIT.ARMY - The Meme Army That Pays",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SHIT.ARMY | The Meme Army That Pays",
    description: "Join the most degenerate army on Base. Earn $SHIT through offerwalls, staking & memes.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "theme-color": "#f59e0b",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'SHIT.ARMY',
              url: 'https://shit.army',
              description: 'Complete offers, stake $SHIT, recruit soldiers & earn real crypto.',
              applicationCategory: 'GameApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.7',
                ratingCount: '12400',
              },
              publisher: {
                '@type': 'Organization',
                name: 'SHIT.ARMY',
                url: 'https://shit.army',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://shit.army/icons/icon-512x512.png',
                },
              },
            }),
          }}
        />
        {children}
        <PWAInstallPrompt />
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js')})}`
          }}
        />
      </body>
    </html>
  );
}
