# SHIT.ARMY - Production Checklist

## ✅ Recently Implemented (Ready for Production)

### 1. Central Configuration (`lib/config.ts`)
- **All API endpoints** in one place - easy to swap mock ↔ real backend
- **Feature flags** - enable/disable functions without code changes
- **Business logic** - withdrawal limits, staking APY, referral rates
- **External services** - offerwall providers, KYC, analytics

### 2. KYC Flow (`components/KYCModal.tsx`)
- 3-step verification: Personal Info → ID Document → Selfie
- 4 states: `none` | `pending` | `verified` | `rejected`
- **Blocks withdrawals** if balance > $100 and not verified
- Status badge in navigation (red/amber/green)
- Warning banner in dashboard

### 3. Live Offer System
- **Active Offers** section with real-time progress (0% → 100%)
- **Offer Boosts** - 2x/3x rewards with countdown timer
- Progress simulation (updates every 3 seconds)
- "START TRACKING" → "CLAIM REWARD" flow

### 4. Battle Pass + Quests
- 20-tier Battle Pass with XP progression
- Daily/Weekly/Milestone quests
- Auto-progress tracking for offers/staking/marketplace

---

## 🚧 What To Do Next (Priority Order)

### HIGH PRIORITY - Security & Compliance

1. **Real Backend API**
   - Set up `NEXT_PUBLIC_API_URL` in `.env.local`
   - Replace all mock data with API calls
   - JWT token refresh logic
   - Rate limiting (429 error handling)

2. **Web3 Integration**
   ```typescript
   // lib/web3.ts - to create
   - Wallet connection (MetaMask, WalletConnect, Coinbase)
   - Sign message for auth
   - Send transactions
   - Read contract state (balance, staking positions)
   ```

3. **Backend API Structure**
   ```
   POST /auth/verify-wallet      - Connect wallet + sign
   GET  /user/profile             - Get user data
   GET  /user/balance             - $SHIT balance
   POST /offers/start             - Start offer tracking
   GET  /offers/progress/:id      - Poll progress
   POST /offers/claim             - Claim reward
   POST /withdrawal/request       - Initiate withdrawal
   GET  /kyc/status               - Check KYC status
   POST /kyc/submit               - Submit KYC docs
   ```

4. **Postback Security (CRITICAL!)**
   ```typescript
   // pages/api/postback/offertoro.ts
   - Verify offer completion from provider
   - Check signature/IP whitelist
   - Anti-fraud: deduplication, rate limiting
   - Credit user balance
   ```

### MEDIUM PRIORITY - User Experience

5. **Loading States / Skeletons**
   - Every section needs skeleton while loading
   - Don't show "0" while fetching balance

6. **Error Boundaries + Sentry**
   ```typescript
   // components/ErrorBoundary.tsx
   - Catch React errors
   - Report to Sentry
   - Show user-friendly error message
   ```

7. **PWA (Progressive Web App)**
   - `manifest.json`
   - Service Worker for offline mode
   - Push notifications for:
     - Offer completed
     - Withdrawal confirmed
     - Daily bonus available

8. **Real-time Updates**
   - WebSocket for:
     - Offer progress (instead of polling)
     - New offers/boosts
     - Leaderboard updates
   - Or: Server-Sent Events (SSE) - simpler

### LOW PRIORITY - Polish

9. **SEO / Meta Tags**
   - Open Graph image
   - Twitter card
   - Description for Google

10. **Accessibility (a11y)**
    - ARIA labels
    - Keyboard navigation
    - Screen reader support
    - `prefers-reduced-motion`

11. **Analytics**
    - Mixpanel/Amplitude - track user flows
    - Funnel: Visit → Offer Click → Complete → Withdraw

---

## 🎯 Ready to Deploy?

### Required `.env.local` variables:
```bash
# Minimum for production
NEXT_PUBLIC_API_URL=https://api.shit.army/v1
NEXT_PUBLIC_APP_URL=https://shit.army

# Blockchain
NEXT_PUBLIC_BASE_RPC=https://mainnet.base.org
NEXT_PUBLIC_SHIT_TOKEN_CONTRACT=0x...

# Security
JWT_SECRET=your_super_secret_64_char_key
ENCRYPTION_KEY=your_32_char_encryption_key

# Offerwall Postback (server-side only!)
OFFERTORO_POSTBACK_KEY=secret_from_provider
OFFERTORO_API_KEY=your_key
```

### Pre-launch Checklist:
- [ ] Real API endpoints connected
- [ ] Smart contracts deployed & verified
- [ ] Offerwall postback tested (try completing 1 offer)
- [ ] Withdrawal tested on testnet
- [ ] KYC provider integrated (SumSub/Onfido)
- [ ] Sentry configured (error tracking)
- [ ] Google Analytics added
- [ ] Terms of Service + Privacy Policy pages
- [ ] Support email/Discord setup
- [ ] Rate limits configured
- [ ] Database backups automated

---

## 💡 Architecture Recommendation

```
Frontend (Next.js) ──► API Routes ──► Backend Server
     │                      │              │
     │                      │              ├── PostgreSQL (users, offers)
     │                      │              ├── Redis (sessions, rate limits)
     │                      │              └── Blockchain Node
     │                      │
     └── Web3 Provider ─────┘
          (MetaMask, WalletConnect)
```

**Tech Stack Options:**
- **Backend**: Node.js/Express or Next.js API routes
- **Database**: PostgreSQL (users) + Redis (sessions/boosts)
- **Blockchain**: Base (L2) - low fees
- **File Storage**: AWS S3 (KYC documents)
- **Hosting**: Vercel (frontend) + Railway/Render (backend)

---

## 🚀 Next Immediate Steps

1. **Set up backend skeleton** - basic Express app with auth
2. **Deploy test smart contract** - $SHIT token on Base testnet
3. **Connect one offerwall** - Offertoro or AdGem with real postback
4. **Test end-to-end flow** - Complete offer → Get $SHIT → Withdraw

Want me to help with any of these?
