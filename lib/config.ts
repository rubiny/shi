// lib/config.ts
// Centralna konfiguracja aplikacji SHIT.ARMY
// Wszystkie API endpoints, klucze i ustawienia w jednym miejscu

export const CONFIG = {
  // App Info
  APP: {
    NAME: 'SHIT.ARMY',
    VERSION: '1.0.0',
    URL: process.env.NEXT_PUBLIC_APP_URL || 'https://shit.army',
    SUPPORT_EMAIL: 'support@shit.army',
  },

  // Feature Flags - łatwe włączanie/wyłączanie funkcji
  FEATURES: {
    KYC_REQUIRED: process.env.NEXT_PUBLIC_KYC_REQUIRED === 'true',
    WITHDRAWAL_2FA: process.env.NEXT_PUBLIC_WITHDRAWAL_2FA === 'true',
    REFERRAL_SYSTEM: true,
    BATTLE_PASS: true,
    STAKING: true,
    NFT_MARKETPLACE: true,
    MERCH_STORE: true,
    LEADERBOARD: true,
    ACHIEVEMENTS: true,
    PWA_ENABLED: process.env.NEXT_PUBLIC_PWA_ENABLED === 'true',
    ANALYTICS: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',
    SENTRY: process.env.NEXT_PUBLIC_SENTRY_DSN !== undefined,
  },

  // API Endpoints - tutaj podłączasz swoje backend API
  API: {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.shit.army/v1',
    
    ENDPOINTS: {
      // Auth
      AUTH: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        VERIFY_WALLET: '/auth/verify-wallet',
      },
      
      // User
      USER: {
        PROFILE: '/user/profile',
        UPDATE_PROFILE: '/user/profile',
        BALANCE: '/user/balance',
        STATS: '/user/stats',
        DELETE_ACCOUNT: '/user/account',
      },
      
      // Offers
      OFFERS: {
        LIST: '/offers',
        START: '/offers/start',
        PROGRESS: '/offers/progress',
        CLAIM: '/offers/claim',
        ACTIVE: '/offers/active',
      },
      
      // Quests
      QUESTS: {
        LIST: '/quests',
        CLAIM: '/quests/claim',
        PROGRESS: '/quests/progress',
      },
      
      // Battle Pass
      BATTLE_PASS: {
        STATUS: '/battle-pass/status',
        CLAIM_TIER: '/battle-pass/claim',
      },
      
      // Staking
      STAKING: {
        POSITIONS: '/staking/positions',
        STAKE: '/staking/stake',
        UNSTAKE: '/staking/unstake',
        CLAIM_REWARDS: '/staking/claim',
      },
      
      // Marketplace
      MARKETPLACE: {
        LISTINGS: '/marketplace/listings',
        BUY: '/marketplace/buy',
        SELL: '/marketplace/sell',
        MY_NFTS: '/marketplace/my-nfts',
      },
      
      // Withdrawals
      WITHDRAWAL: {
        REQUEST: '/withdrawal/request',
        HISTORY: '/withdrawal/history',
        NETWORKS: '/withdrawal/networks',
      },
      
      // Transactions
      TRANSACTIONS: {
        LIST: '/transactions',
        EXPORT: '/transactions/export',
      },
      
      // Referrals
      REFERRAL: {
        STATS: '/referral/stats',
        CLAIM: '/referral/claim',
      },
      
      // KYC
      KYC: {
        STATUS: '/kyc/status',
        SUBMIT: '/kyc/submit',
        UPLOAD_DOCUMENT: '/kyc/upload',
      },
      
      // Leaderboard
      LEADERBOARD: {
        WEEKLY: '/leaderboard/weekly',
        ALL_TIME: '/leaderboard/all-time',
      },
    },
  },

  // Blockchain / Web3 Config
  WEB3: {
    // Supported networks
    NETWORKS: {
      BASE: {
        chainId: 8453,
        name: 'Base',
        rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC || 'https://mainnet.base.org',
        explorerUrl: 'https://basescan.org',
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
      },
      ETHEREUM: {
        chainId: 1,
        name: 'Ethereum',
        rpcUrl: process.env.NEXT_PUBLIC_ETH_RPC || 'https://ethereum.publicnode.com',
        explorerUrl: 'https://etherscan.io',
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
      },
      POLYGON: {
        chainId: 137,
        name: 'Polygon',
        rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://polygon-rpc.com',
        explorerUrl: 'https://polygonscan.com',
        nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
      },
    },
    
    // Contract addresses
    CONTRACTS: {
      SHIT_TOKEN: process.env.NEXT_PUBLIC_SHIT_TOKEN_CONTRACT || '0x...',
      STAKING: process.env.NEXT_PUBLIC_STAKING_CONTRACT || '0x...',
      MARKETPLACE: process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT || '0x...',
    },
  },

  // Business Logic Config
  BUSINESS: {
    // Withdrawal limits
    WITHDRAWAL: {
      MIN_AMOUNT: 25,
      MAX_AMOUNT: 100000,
      DAILY_LIMIT: 5000,
      KYC_REQUIRED_ABOVE: 100, // USD equivalent
      FEE_PERCENTAGE: 0.5,
      
      NETWORKS: {
        BASE: { fee: 0.5, minWithdraw: 50, confirmations: 10 },
        ETH: { fee: 2.5, minWithdraw: 100, confirmations: 12 },
        POLYGON: { fee: 0.2, minWithdraw: 25, confirmations: 20 },
      },
    },
    
    // Offerwall
    OFFERWALL: {
      EXCHANGE_RATE: 12, // 1 $SHIT = 12 PTS
      MIN_CONVERT: 100,
      BOOST_EXPIRY_MINUTES: [30, 45, 60, 120], // Losowy z zakresu
    },
    
    // Battle Pass
    BATTLE_PASS: {
      SEASON_NAME: 'Season 1: Shit Rising',
      XP_PER_TIER: 500,
      MAX_TIER: 20,
      SEASON_END_DATE: '2026-08-31T23:59:59Z',
    },
    
    // Staking
    STAKING: {
      LOCK_PERIODS: [
        { days: 7, apy: 32 },
        { days: 30, apy: 48 },
        { days: 90, apy: 67 },
      ],
      EARLY_UNSTAKE_PENALTY: 0.1, // 10%
    },
    
    // Referral
    REFERRAL: {
      COMMISSION_PERCENT: 15,
      BONUS_TIERS: [
        { referrals: 5, bonus: 500 },
        { referrals: 10, bonus: 1500 },
        { referrals: 25, bonus: 5000 },
      ],
    },
    
    // Daily Bonus
    DAILY_BONUS: {
      BASE_AMOUNT: 150,
      STREAK_MULTIPLIER: 20,
      MAX_STREAK_MULTIPLIER: 35, // %
    },
  },

  // Security
  SECURITY: {
    // CAPTCHA
    CAPTCHA: {
      ENABLED: process.env.NEXT_PUBLIC_CAPTCHA_ENABLED === 'true',
      PROVIDER: 'recaptcha', // 'recaptcha' | 'hcaptcha' | 'turnstile'
      SITE_KEY: process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY,
    },
    
    // Rate Limiting (frontend-side warnings)
    RATE_LIMIT: {
      MAX_OFFERS_PER_HOUR: 10,
      MAX_WITHDRAWALS_PER_DAY: 3,
      MAX_LOGIN_ATTEMPTS: 5,
    },
    
    // 2FA
    TWO_FACTOR: {
      ENABLED: process.env.NEXT_PUBLIC_2FA_ENABLED === 'true',
      ISSUER: 'SHIT.ARMY',
    },
  },

  // External Services
  EXTERNAL: {
    // Offerwall Providers - tutaj podłączasz zewnętrzne sieci ofert
    OFFER_PROVIDERS: {
      OFFERTORO: {
        ENABLED: process.env.NEXT_PUBLIC_OFFERTORO_ENABLED === 'true',
        API_URL: process.env.OFFERTORO_API_URL,
        API_KEY: process.env.OFFERTORO_API_KEY,
        POSTBACK_KEY: process.env.OFFERTORO_POSTBACK_KEY,
      },
      ADGEM: {
        ENABLED: process.env.NEXT_PUBLIC_ADGEM_ENABLED === 'true',
        API_URL: process.env.ADGEM_API_URL,
        API_KEY: process.env.ADGEM_API_KEY,
      },
      ADSCEND: {
        ENABLED: process.env.NEXT_PUBLIC_ADSCEND_ENABLED === 'true',
        API_URL: process.env.ADSCEND_API_URL,
        PUBLISHER_ID: process.env.ADSCEND_PUBLISHER_ID,
      },
    },
    
    // Analytics
    ANALYTICS: {
      GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GA_ID,
      MIXPANEL_TOKEN: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
      POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    },
    
    // Monitoring
    SENTRY: {
      DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
      ENVIRONMENT: process.env.NEXT_PUBLIC_SENTRY_ENV || 'production',
    },
    
    // Push Notifications
    PUSH: {
      ONE_SIGNAL_APP_ID: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
      ONE_SIGNAL_REST_KEY: process.env.ONESIGNAL_REST_KEY,
    },
    
    // Merch (Printful)
    PRINTFUL: {
      API_KEY: process.env.PRINTFUL_API_KEY,
      STORE_ID: process.env.PRINTFUL_STORE_ID,
    },
    
    // KYC Provider (SumSub / Onfido / etc)
    KYC: {
      PROVIDER: process.env.KYC_PROVIDER || 'sumsub',
      API_KEY: process.env.KYC_API_KEY,
      SECRET_KEY: process.env.KYC_SECRET_KEY,
    },
  },

  // UI/UX Config
  UI: {
    // Theme
    DEFAULT_THEME: 'dark',
    ACCENT_COLOR: '#f59e0b',
    
    // Animations
    ANIMATIONS_ENABLED: true,
    REDUCE_MOTION: false, // accessibility
    
    // Pagination
    ITEMS_PER_PAGE: 10,
    
    // Toast notifications
    TOAST_DURATION: 2600,
    
    // Refresh intervals (ms)
    REFRESH_INTERVALS: {
      BALANCE: 30000, // 30s
      OFFERS: 60000, // 1min
      LEADERBOARD: 300000, // 5min
      TRANSACTIONS: 60000, // 1min
    },
  },
} as const;

// Type-safe helpers
export type Config = typeof CONFIG;
export type ApiEndpoints = typeof CONFIG.API.ENDPOINTS;

// Helper do budowania pełnych URLi API
export const apiUrl = (endpoint: string) => `${CONFIG.API.BASE_URL}${endpoint}`;

// Helper do sprawdzania czy feature jest włączony
export const isFeatureEnabled = (feature: keyof typeof CONFIG.FEATURES) => 
  CONFIG.FEATURES[feature];

// Helper do sprawdzania czy użytkownik może wypłacić bez KYC
export const canWithdrawWithoutKyc = (amount: number) => 
  !CONFIG.FEATURES.KYC_REQUIRED || amount < CONFIG.BUSINESS.WITHDRAWAL.KYC_REQUIRED_ABOVE;

export default CONFIG;
