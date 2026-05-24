// lib/env.example.ts
// Skopiuj te zmienne do .env.local i uzupełnij swoimi wartościami
// NIE COMMITUJ .env.local DO REPO!

export const ENV_EXAMPLE = `
# ==========================================
# SHIT.ARMY - Environment Variables
# ==========================================

# APP CONFIG
# ------------------------------------------
NEXT_PUBLIC_APP_URL=https://shit.army
NEXT_PUBLIC_API_URL=https://api.shit.army/v1

# FEATURE FLAGS (true/false)
# ------------------------------------------
NEXT_PUBLIC_KYC_REQUIRED=false
NEXT_PUBLIC_WITHDRAWAL_2FA=true
NEXT_PUBLIC_PWA_ENABLED=true
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_CAPTCHA_ENABLED=true
NEXT_PUBLIC_2FA_ENABLED=true

# BLOCKCHAIN / WEB3
# ------------------------------------------
NEXT_PUBLIC_SHIT_TOKEN_CONTRACT=0x...
NEXT_PUBLIC_STAKING_CONTRACT=0x...
NEXT_PUBLIC_MARKETPLACE_CONTRACT=0x...
NEXT_PUBLIC_BASE_RPC=https://mainnet.base.org
NEXT_PUBLIC_ETH_RPC=https://ethereum.publicnode.com
NEXT_PUBLIC_POLYGON_RPC=https://polygon-rpc.com

# SECURITY - CAPTCHA
# ------------------------------------------
NEXT_PUBLIC_CAPTCHA_SITE_KEY=your_recaptcha_site_key_here

# ANALYTICS & MONITORING
# ------------------------------------------
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NEXT_PUBLIC_SENTRY_ENV=production

# PUSH NOTIFICATIONS
# ------------------------------------------
NEXT_PUBLIC_ONESIGNAL_APP_ID=your_onesignal_app_id
ONESIGNAL_REST_KEY=your_onesignal_rest_key

# OFFERWALL PROVIDERS (Server-side only!)
# ------------------------------------------
NEXT_PUBLIC_OFFERTORO_ENABLED=true
OFFERTORO_API_URL=https://www.offertoro.com/api
OFFERTORO_API_KEY=your_offertoro_key
OFFERTORO_POSTBACK_KEY=your_postback_secret

NEXT_PUBLIC_ADGEM_ENABLED=true
ADGEM_API_URL=https://api.adgem.com/v1
ADGEM_API_KEY=your_adgem_key

NEXT_PUBLIC_ADSCEND_ENABLED=true
ADSCEND_API_URL=https://adscendmedia.com/api
ADSCEND_PUBLISHER_ID=your_publisher_id

# KYC PROVIDER (Server-side only!)
# ------------------------------------------
KYC_PROVIDER=sumsub
KYC_API_KEY=your_sumsub_key
KYC_SECRET_KEY=your_sumsub_secret

# SUPABASE (Primary Backend)
# ------------------------------------------
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key

# MERCH (Server-side only!)
# ------------------------------------------
PRINTFUL_API_KEY=your_printful_key
PRINTFUL_STORE_ID=your_store_id
`;

// Alternative: Express backend (if you prefer self-hosted)
// Uncomment below and comment out Supabase section above
/*
NEXT_PUBLIC_API_URL=https://api.shit.army/v1
DATABASE_URL=postgresql://user:pass@localhost:5432/shitarmy
REDIS_URL=redis://localhost:6379
JWT_SECRET=generate_random_64_char_string_here
JWT_REFRESH_SECRET=generate_another_random_string
INTERNAL_API_KEY=for_service_to_service_communication
*/

export default ENV_EXAMPLE;
