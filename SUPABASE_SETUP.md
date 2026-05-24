# SHIT.ARMY - Supabase Setup Guide

## 🚀 Why Supabase?

| Feature | Benefit for SHIT.ARMY |
|---------|------------------------|
| **PostgreSQL** | Production-ready database with RLS |
| **Realtime** | WebSocket subscriptions for live offer progress |
| **Auth** | Built-in JWT, OAuth, email providers |
| **Storage** | KYC documents, NFT images |
| **Edge Functions** | Serverless business logic (postbacks, claims) |
| **Mobile SDK** | Ready for React Native / Flutter app |
| **Free Tier** | Start free, scale as needed |

---

## 📋 Setup Steps

### 1. Create Supabase Project

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Initialize project (in repo root)
supabase init

# Link to your project
supabase link --project-ref your-project-ref
```

Or use [Supabase Dashboard](https://app.supabase.com):
1. Create new project
2. Copy `Project URL` and `anon key`
3. Save `service_role_key` (keep secret!)

### 2. Environment Variables

Add to `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Server-side only!

# Offerwall Providers
OFFERTORO_POSTBACK_KEY=your-offertoro-secret
ADGEM_API_KEY=your-adgem-key

# Blockchain
NEXT_PUBLIC_SHIT_TOKEN_CONTRACT=0x...
```

### 3. Deploy Database

```bash
# Deploy migrations
supabase db push

# Or run SQL in Dashboard:
# 1. Go to SQL Editor
# 2. Copy content from supabase/migrations/001_initial_schema.sql
# 3. Run
# 4. Repeat for 002_rpc_functions.sql
```

### 4. Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy claim-offer-reward
supabase functions deploy postback-offertoro

# Set secrets for functions
supabase secrets set OFFERTORO_POSTBACK_KEY=xxx
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=xxx
```

### 5. Configure Auth Providers (Optional)

In Dashboard:
1. **Authentication > Providers**
2. Enable **Email** (with confirmation)
3. Enable **Google** (for Web2 users)
4. **Custom Auth** - we'll use wallet signatures

### 6. Configure Storage

```bash
# Create buckets for KYC documents
supabase storage create kyc-documents --public false

# Set policies (via Dashboard or SQL)
```

---

## 🔐 Row Level Security (RLS)

All tables have RLS enabled. Key policies:

```sql
-- Users can only see own balance
CREATE POLICY "Users can view own balance" ON user_balances
  FOR SELECT USING (auth.uid() = user_id);

-- Active offers visible to everyone
CREATE POLICY "Active offers are viewable" ON offers
  FOR SELECT USING (is_active = TRUE);

-- Users manage own offers
CREATE POLICY "Users can view own offers" ON user_offers
  FOR SELECT USING (auth.uid() = user_id);
```

---

## 📡 Realtime Subscriptions

### Frontend Usage

```typescript
import { subscribeToOffers, subscribeToBalance } from '@/lib/supabase';

// Live offer completion updates
const unsubscribe = subscribeToOffers(userId, (payload) => {
  console.log('Offer completed!', payload);
  // Update UI
});

// Live balance updates
const unsubscribeBalance = subscribeToBalance(userId, (balance) => {
  setShitBalance(balance.shit_balance);
});

// Cleanup
return () => {
  unsubscribe();
  unsubscribeBalance();
};
```

---

## 🎯 Edge Functions API

| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `claim-offer-reward` | POST | `/functions/v1/claim-offer-reward` | Claim completed offer |
| `postback-offertoro` | GET | `/functions/v1/postback-offertoro` | Offertoro webhook |

### Call from Frontend

```typescript
import { callEdgeFunction } from '@/lib/supabase';

const result = await callEdgeFunction('claim-offer-reward', {
  user_offer_id: 'uuid-here',
});
```

---

## 📱 Mobile App Ready

Supabase has SDKs for:
- **React Native** - `supabase-js` works directly
- **Flutter** - `supabase_flutter`
- **iOS/Android** - REST API or native SDKs

Same authentication, database, and realtime works across all platforms.

---

## 💰 Database Functions (RPC)

Call PostgreSQL functions directly:

```typescript
const { data, error } = await supabase.rpc('claim_daily_bonus', {
  p_user_id: userId,
});

// Returns: { shit_earned, new_streak, success }
```

Available RPCs:
- `claim_offer_reward` - Claim with atomic transaction
- `start_offer` - Start with boost calculation
- `claim_daily_bonus` - Daily reward + streak
- `calculate_staking_rewards` - Compute APY
- `get_leaderboard` - Weekly/All-time ranking
- `check_kyc_requirement` - Verify before withdrawal

---

## 🔥 Performance Tips

1. **Enable Caching**
   ```typescript
   const { data } = await supabase
     .from('offers')
     .select('*')
     .eq('is_active', true)
     .cache(300); // 5 minutes
   ```

2. **Use Subscriptions Sparingly**
   - Subscribe to single rows, not entire tables
   - Unsubscribe when component unmounts

3. **Pagination**
   ```typescript
   .range(from, to)
   ```

4. **Select Only Needed Columns**
   ```typescript
   .select('id, title, reward') // Not '*'
   ```

---

## 🚀 Deployment Checklist

- [ ] Supabase project created
- [ ] Database migrations deployed
- [ ] Edge functions deployed
- [ ] Environment variables set
- [ ] RLS policies tested
- [ ] Storage buckets created
- [ ] Auth redirects configured
- [ ] Offerwall postback URLs set:
  - Offertoro: `https://your-project.supabase.co/functions/v1/postback-offertoro`
- [ ] Rate limiting configured (Supabase has built-in)

---

## 📊 Pricing Estimate

| Tier | Database | Storage | Functions | Cost |
|------|----------|---------|-----------|------|
| **Free** | 500MB | 1GB | 500K/mo | $0 |
| **Pro** | 8GB | 100GB | 2M/mo | $25/mo |
| **Team** | Unlimited | 1TB | 10M/mo | $599/mo |

Start free, upgrade when you hit limits.

---

## 🆘 Troubleshooting

### "Row level security violation"
- Check RLS policies in Dashboard
- Verify `auth.uid()` matches `user_id`

### "Edge function timeout"
- Edge Functions have 60s limit
- Move heavy logic to database RPC

### "Realtime not working"
- Enable Realtime in Database > Replication
- Check table is in `supabase_realtime` publication

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Edge Functions](https://supabase.com/docs/guides/functions)

---

Ready? Start with:
```bash
supabase init
supabase db push
```
