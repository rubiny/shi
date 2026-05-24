# SHIT.ARMY - SEO Configuration

## 🎯 Meta Tags (app/layout.tsx)

```tsx
export const metadata: Metadata = {
  // TYTUŁ - Max 60 znaków, z keyword na początku
  title: "Shit Army | Earn Crypto with Memes on Base Chain",
  
  // OPIS - Max 160 znaków, CTA + keywords
  description: "Join the most degenerate meme army on Base! Complete offers, stake $SHIT, recruit friends & earn real crypto. No KYC under $500. Start earning now! 💩",
  
  // KEYWORDS (dla starszych wyszukiwarek)
  keywords: [
    "earn crypto", "meme coin", "base chain", "stake crypto", 
    "crypto offers", "play to earn", "web3 earning", "shit army",
    "meme army", "crypto rewards", "survey crypto", "offerwall crypto"
  ],
  
  // CANONICAL URL
  alternates: {
    canonical: "https://shit.army",
  },
  
  // OPEN GRAPH (Facebook/Twitter)
  openGraph: {
    title: "Shit Army | Earn Crypto with Memes",
    description: "Join 47,000+ soldiers earning $SHIT. Complete offers, stake & recruit. The meme army that pays! 💩🚀",
    url: "https://shit.army",
    siteName: "SHIT.ARMY",
    images: [
      {
        url: "https://shit.army/og-image.png",
        width: 1200,
        height: 630,
        alt: "Shit Army - Meme Crypto Earning Platform"
      }
    ],
    locale: "en_US",
    type: "website",
  },
  
  // TWITTER/X
  twitter: {
    card: "summary_large_image",
    title: "Shit Army | Earn Crypto with Memes",
    description: "Join 47,000+ soldiers earning $SHIT. The meme army that pays! 💩",
    creator: "@shitarmy",
    images: ["https://shit.army/og-image.png"],
  },
  
  // ROBOTS
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
  
  // VERIFICATION
  verification: {
    google: "YOUR_GOOGLE_VERIFICATION_CODE",
    yandex: "YOUR_YANDEX_CODE",
  },
  
  // ICONS
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "/apple-touch-icon-precomposed.png",
    },
  },
  
  // MANIFEST (PWA)
  manifest: "/manifest.json",
  
  // THEME
  themeColor: "#10b981",
};
```

## 📁 Structure SEO

### URLs (slug structure)
```
/                    - Landing (główna)
/dashboard           - Dashboard użytkownika
/earn                - Offerwall (alt: /offers)
/stake               - Staking page
/market              - NFT Marketplace
/quests              - Quests & Challenges
/battle-pass         - Battle Pass Season
/leaderboard         - Rankings
/refer               - Referral program
/army                - My Army (referrals)
/settings            - User settings
/help                - FAQ & Support
/terms               - Terms of Service
/privacy             - Privacy Policy
/kyc                 - KYC Information
```

## 📝 Content Strategy

### Keywords Priority

**HIGH (Main):**
- earn crypto online
- meme coin earning
- stake crypto rewards
- crypto offerwall
- base chain dapp
- play to earn crypto

**MEDIUM (Long-tail):**
- complete surveys for crypto
- best crypto earning app 2024
- meme army crypto game
- earn shit coin
- web3 earning platform

**LOW (Niche):**
- degenerate crypto community
- poop coin earning
- toilet crypto army

### Landing Page Content

```
H1: Join The Most Degenerate Meme Army on Base
H2: Complete Offers, Stake $SHIT, Earn Real Crypto
H2: How It Works (4 steps)
H2: Why $SHIT? (features)
H2: Community Memes
H3: Battle Pass Season
H3: Rank System
```

## 🔧 Technical SEO

### Sitemap.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://shit.army</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://shit.army/dashboard</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>always</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- Add all public routes -->
</urlset>
```

### Robots.txt
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/private/

Sitemap: https://shit.army/sitemap.xml
```

### Performance
- **Core Web Vitals:**
  - LCP < 2.5s (Largest Contentful Paint)
  - FID < 100ms (First Input Delay)
  - CLS < 0.1 (Cumulative Layout Shift)

- **Image Optimization:**
  - WebP format
  - Lazy loading
  - Responsive images
  - Alt text everywhere

### Structured Data (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Shit Army",
  "description": "Meme-powered crypto earning platform on Base Chain",
  "url": "https://shit.army",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "47000"
  }
}
```

## 🚀 Social Media SEO

### Twitter/X
- Username: @shitarmy
- Bio: "The meme army that pays 💩 Join 47K+ soldiers earning $SHIT on Base"
- Pinned: Landing page link
- Hashtags: #ShitArmy #MemeCoin #BaseChain #EarnCrypto

### Discord SEO
- Server name: Shit Army HQ
- Description: "Join the most degenerate crypto community. Earn, stake, meme."
- Vanity URL: discord.gg/shitarmy

## 📊 Tracking

```javascript
// Google Analytics 4
GTAG_ID = "G-XXXXXXXXXX"

// Events to track:
- page_view
- connect_wallet
- complete_offer
- stake_tokens
- referral_signup
- battle_pass_purchase

// Facebook Pixel (optional)
PIXEL_ID = "XXXXXXXXXX"
```

## 🔗 Backlinks Strategy

1. **Crypto Directories:**
   - DappRadar
   - CoinGecko (when listed)
   - Base Ecosystem page

2. **Content Marketing:**
   - Medium articles: "How to Earn Crypto with Memes"
   - Reddit: r/CryptoCurrency, r/basechain
   - Twitter threads

3. **Partnerships:**
   - Base ecosystem projects
   - Other meme coins
   - Crypto influencers

## ⚡ Quick Wins

1. ✅ Add meta tags (layout.tsx)
2. ✅ Create sitemap.xml
3. ✅ Add robots.txt
4. ✅ Optimize images (WebP)
5. ✅ Add alt text to all images
6. ✅ Fix broken links
7. ✅ Add JSON-LD schema
8. ✅ Submit to Google Search Console
9. ✅ Create social share images (1200x630)
10. ✅ Add canonical URLs
