import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | SHIT.ARMY',
  description: 'Terms and conditions for using the SHIT.ARMY platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-black mb-2">TERMS OF SERVICE</h1>
        <p className="text-zinc-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="space-y-8 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using SHIT.ARMY (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform. You must be at least 18 years of age to use this service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">2. Description of Service</h2>
            <p>SHIT.ARMY is a gamified rewards platform where users earn points (&quot;$SHIT&quot;) by completing offers, participating in games, staking, recruiting referrals, and engaging with the community. $SHIT is an in-platform currency and has no inherent monetary value outside the Platform unless explicitly stated.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">3. User Accounts</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You may create only one account. Multiple accounts will result in permanent ban and forfeiture of all balances.</li>
              <li>You are responsible for maintaining the security of your wallet and login credentials.</li>
              <li>You must provide accurate information during registration and KYC verification.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">4. Earning &amp; Rewards</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Rewards are credited after verified completion of offers through our offerwall partners.</li>
              <li>We reserve the right to adjust reward amounts, conversion rates, and staking APY at any time.</li>
              <li>Fraudulent activity (VPN usage, bots, fake completions, multi-accounting) will result in account termination and balance forfeiture.</li>
              <li>Mini-game outcomes are determined by random number generation. Past results do not guarantee future outcomes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">5. Withdrawals</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Withdrawals are subject to minimum thresholds, processing fees, and KYC verification requirements.</li>
              <li>Processing times vary by network and volume. We aim to process within 48 hours but do not guarantee specific timeframes.</li>
              <li>We reserve the right to delay or deny withdrawals pending fraud investigation.</li>
              <li>Withdrawal to incorrect wallet addresses cannot be reversed.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">6. Staking</h2>
            <p>Staking locks your $SHIT for a specified period. APY rates are variable and subject to change. Early unstaking may result in penalties or forfeiture of accrued rewards. Staking does not constitute a financial investment or security.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">7. Army &amp; Market</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Virtual soldiers and items have no real-world value outside the Platform.</li>
              <li>Market transactions are final. All sales subject to platform fees.</li>
              <li>We may modify game mechanics, soldier stats, mission rewards, and market fees at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">8. Prohibited Conduct</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Using automated tools, bots, or scripts to interact with the Platform</li>
              <li>Exploiting bugs or vulnerabilities (report them instead for a bounty)</li>
              <li>Harassing, threatening, or abusing other users</li>
              <li>Posting illegal, obscene, or harmful content in community features</li>
              <li>Attempting to manipulate the referral system or leaderboard</li>
              <li>Using VPN or proxy to circumvent geographic restrictions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">9. Intellectual Property</h2>
            <p>All content, branding, code, and assets on SHIT.ARMY are owned by us or our licensors. User-generated content (memes, posts) grants us a non-exclusive license to display and distribute within the Platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">10. Disclaimer of Warranties</h2>
            <p>THE PLATFORM IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE UPTIME, ACCURACY OF REWARDS, OR AVAILABILITY OF SERVICES. USE AT YOUR OWN RISK.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">11. Limitation of Liability</h2>
            <p>In no event shall SHIT.ARMY be liable for indirect, incidental, special, or consequential damages arising from your use of the Platform. Our total liability shall not exceed the amount of $SHIT you have earned in the preceding 30 days.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">12. Changes to Terms</h2>
            <p>We may update these Terms at any time. Continued use after changes constitutes acceptance. Material changes will be communicated via the Platform or email.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">13. Contact</h2>
            <p>Questions about these Terms? Contact us at <span className="text-amber-400">legal@shit.army</span></p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <a href="/" className="text-amber-400 hover:text-amber-300 font-bold">&larr; BACK TO SHIT.ARMY</a>
        </div>
      </div>
    </div>
  );
}
