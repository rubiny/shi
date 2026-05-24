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

      // Army
      ARMY: {
        SOLDIERS: '/army/soldiers',
        RECRUIT: '/army/recruit',
        DEPLOY: '/army/deploy',
        CLAIM: '/army/claim',
        LEVEL_UP: '/army/level-up',
        RAID_LOG: '/army/raid-log',
      },

      // Market
      MARKET: {
        LISTINGS: '/market/listings',
        BUY: '/market/buy',
        SELL: '/market/sell',
        INVENTORY: '/market/inventory',
        ACTIVE_BOOSTS: '/market/boosts/active',
      },

      // Guilds
      GUILDS: {
        LIST: '/guilds',
        CREATE: '/guilds/create',
        JOIN: '/guilds/join',
        LEAVE: '/guilds/leave',
        CHAT: '/guilds/chat',
        MEMBERS: '/guilds/members',
      },

      // Meme Feed
      MEME_FEED: {
        POSTS: '/memes',
        CREATE: '/memes/create',
        VOTE: '/memes/vote',
        FEATURED: '/memes/featured',
      },

      // Events
      EVENTS: {
        ACTIVE: '/events/active',
        PROGRESS: '/events/progress',
        LEADERBOARD: '/events/leaderboard',
      },

      // Mini Games
      GAMES: {
        SPIN: '/games/spin',
        SCRATCH: '/games/scratch',
        COIN_FLIP: '/games/coin-flip',
        DICE: '/games/dice',
        PUMP_OR_DUMP: '/games/pump-or-dump',
        HISTORY: '/games/history',
      },

      // Admin
      ADMIN: {
        STATS: '/admin/stats',
        USERS: '/admin/users',
        OFFERS: '/admin/offers',
        WITHDRAWALS: '/admin/withdrawals',
        AUDIT_LOG: '/admin/audit',
        CONFIG: '/admin/config',
        BROADCAST: '/admin/broadcast',
        SYSTEM_HEALTH: '/admin/system/health',
        REVENUE: '/admin/revenue',
        GAME_STATS: '/admin/games/stats',
        ARMY_STATS: '/admin/army/stats',
        MARKET_STATS: '/admin/market/stats',
        GUILD_MANAGEMENT: '/admin/guilds',
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

  // Army Config
  ARMY: {
    RECRUIT_COST: Number(process.env.NEXT_PUBLIC_ARMY_RECRUIT_COST) || 500,
    RECRUIT_COOLDOWN_SEC: Number(process.env.NEXT_PUBLIC_ARMY_RECRUIT_COOLDOWN) || 5,
    LEVEL_UP_XP: Number(process.env.NEXT_PUBLIC_ARMY_LEVEL_UP_XP) || 1000,
    MAX_SQUAD_SIZE: Number(process.env.NEXT_PUBLIC_ARMY_MAX_SQUAD) || 10,
    SQUAD_POWER_OFFERWALL_BONUS_PER_100: 1, // +1% offerwall bonus per 100 PWR
    MISSIONS: {
      SEWER: { DURATION_SEC: 60, BASE_REWARD: 50, JACKPOT_CHANCE: 5, JACKPOT_MULT: 3 },
      RESTROOM: { DURATION_SEC: 300, BASE_REWARD: 200, JACKPOT_CHANCE: 8, JACKPOT_MULT: 5 },
      SEPTIC: { DURATION_SEC: 900, BASE_REWARD: 800, JACKPOT_CHANCE: 10, JACKPOT_MULT: 7 },
      FLUSH: { DURATION_SEC: 3600, BASE_REWARD: 3000, JACKPOT_CHANCE: 15, JACKPOT_MULT: 10 },
    },
    STREAK_MULTIPLIERS: { 3: 1.2, 5: 1.5, 7: 1.7, 10: 2.0 },
  },

  // Market Config
  MARKET: {
    LISTING_FEE_PERCENT: Number(process.env.NEXT_PUBLIC_MARKET_FEE) || 7.5,
    MIN_LISTING_PRICE: 10,
    MAX_LISTING_PRICE: 1000000,
    CATEGORIES: ['DEGENS', 'JUICE', 'DRIP', 'FLEX'],
    BOOST_DURATIONS_HOURS: [1, 6, 24, 72],
  },

  // Guild Config
  GUILDS: {
    CREATE_COST: Number(process.env.NEXT_PUBLIC_GUILD_CREATE_COST) || 1000,
    MAX_MEMBERS: Number(process.env.NEXT_PUBLIC_GUILD_MAX_MEMBERS) || 50,
    MIN_NAME_LENGTH: 3,
    MAX_NAME_LENGTH: 20,
    OFFICER_SLOTS: 5,
  },

  // Events Config
  EVENTS: {
    MAX_ACTIVE_EVENTS: 3,
    DEFAULT_DURATION_DAYS: 7,
    LEADERBOARD_SIZE: 50,
  },

  // Meme Feed Config
  MEME_FEED: {
    POST_COST: Number(process.env.NEXT_PUBLIC_MEME_POST_COST) || 50,
    VOTE_COST: Number(process.env.NEXT_PUBLIC_MEME_VOTE_COST) || 10,
    MAX_POSTS_PER_DAY: 5,
    FEATURED_THRESHOLD_VOTES: 20,
  },

  // Ambassador Config
  AMBASSADOR: {
    TIERS: [
      { name: 'Bronze', minReferrals: 0, commission: 15 },
      { name: 'Silver', minReferrals: 10, commission: 18 },
      { name: 'Gold', minReferrals: 25, commission: 22 },
      { name: 'Diamond', minReferrals: 50, commission: 30 },
    ],
  },

  // Mini Games Config
  MINI_GAMES: {
    SPIN_WHEEL: {
      COST_PER_SPIN: Number(process.env.NEXT_PUBLIC_SPIN_COST) || 100,
      MAX_SPINS_PER_DAY: Number(process.env.NEXT_PUBLIC_MAX_SPINS) || 10,
      PRIZES: [
        { label: '50 $SHIT', value: 50, chance: 30 },
        { label: '100 $SHIT', value: 100, chance: 25 },
        { label: '250 $SHIT', value: 250, chance: 18 },
        { label: '500 $SHIT', value: 500, chance: 12 },
        { label: '1K $SHIT', value: 1000, chance: 8 },
        { label: '2x JUICE', value: 0, chance: 4 },
        { label: '5K $SHIT', value: 5000, chance: 2 },
        { label: 'MOON BAG', value: 10000, chance: 1 },
      ],
    },
    SCRATCH_CARDS: {
      COST_PER_CARD: Number(process.env.NEXT_PUBLIC_SCRATCH_COST) || 50,
      MAX_CARDS_PER_DAY: 20,
      REVEAL_THRESHOLD_PERCENT: 70,
    },
    COIN_FLIP: {
      MIN_BET: 10,
      MAX_BET: Number(process.env.NEXT_PUBLIC_COINFLIP_MAX_BET) || 5000,
      HOUSE_EDGE_PERCENT: Number(process.env.NEXT_PUBLIC_HOUSE_EDGE) || 2,
    },
    DICE: {
      MIN_BET: 10,
      MAX_BET: Number(process.env.NEXT_PUBLIC_DICE_MAX_BET) || 5000,
    },
    PUMP_OR_DUMP: {
      MIN_BET: 10,
      MAX_BET: Number(process.env.NEXT_PUBLIC_POD_MAX_BET) || 5000,
      ROUND_DURATION_SEC: 10,
    },
    RATE_LIMIT_PER_HOUR: Number(process.env.NEXT_PUBLIC_GAME_RATE_LIMIT) || 30,
  },

  // Platform Stats (landing page, updated periodically from DB or admin panel)
  PLATFORM_STATS: {
    TOTAL_EARNED: 2400000,
    TOTAL_SOLDIERS: 47000,
    OFFERS_COMPLETED: 1200000,
    SHIT_STAKED: 420000,
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
