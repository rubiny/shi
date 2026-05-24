import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | SHIT.ARMY',
  description: 'How SHIT.ARMY collects, uses, and protects your data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-black mb-2">PRIVACY POLICY</h1>
        <p className="text-zinc-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="space-y-8 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">1. Information We Collect</h2>
            <p className="mb-3">We collect information you provide directly and information collected automatically:</p>
            <h3 className="font-bold text-white mb-2">Provided by You:</h3>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Wallet address (for authentication and withdrawals)</li>
              <li>Email address (if using Google OAuth)</li>
              <li>KYC documents (name, date of birth, ID documents, selfie)</li>
              <li>Username and profile information</li>
              <li>Referral codes and social media handles</li>
            </ul>
            <h3 className="font-bold text-white mb-2">Collected Automatically:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>IP address and approximate geolocation</li>
              <li>Device type, browser, and operating system</li>
              <li>Device fingerprint (for fraud prevention)</li>
              <li>Usage data (pages visited, features used, time spent)</li>
              <li>Transaction history and earning patterns</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Platform operation:</strong> Process transactions, verify offers, manage your account</li>
              <li><strong>Security:</strong> Detect fraud, prevent multi-accounting, protect against abuse</li>
              <li><strong>KYC compliance:</strong> Verify identity for withdrawals as required by law</li>
              <li><strong>Analytics:</strong> Improve the platform, understand usage patterns</li>
              <li><strong>Communication:</strong> Send notifications about your account, withdrawals, and platform updates</li>
              <li><strong>Legal compliance:</strong> Respond to legal requests and prevent illegal activity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">3. Information Sharing</h2>
            <p className="mb-3">We do not sell your personal data. We may share information with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Offerwall partners</strong> (OfferToro, AdGem, AdScend) — user ID and completion data for reward verification</li>
              <li><strong>KYC providers</strong> — identity documents for verification processing</li>
              <li><strong>Analytics services</strong> (PostHog, Mixpanel) — anonymized usage data</li>
              <li><strong>Payment processors</strong> — wallet addresses for withdrawal processing</li>
              <li><strong>Law enforcement</strong> — when required by law or to protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">4. Data Security</h2>
            <p>We implement industry-standard security measures including encryption in transit (TLS), encrypted storage for sensitive data, row-level security policies, and regular security audits. However, no system is 100% secure. You are responsible for protecting your wallet credentials.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">5. Data Retention</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account data: retained while your account is active + 2 years after deletion</li>
              <li>Transaction records: retained for 5 years (financial compliance)</li>
              <li>KYC documents: retained for 5 years after verification</li>
              <li>Usage logs: retained for 12 months</li>
              <li>IP/device data: retained for 6 months</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">6. Your Rights</h2>
            <p className="mb-3">Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and associated data</li>
              <li>Export your data in a portable format</li>
              <li>Opt out of analytics tracking</li>
              <li>Withdraw consent for data processing</li>
            </ul>
            <p className="mt-3">To exercise these rights, contact us at <span className="text-amber-400">privacy@shit.army</span></p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">7. Cookies &amp; Local Storage</h2>
            <p>We use cookies and local storage for authentication, preferences, and analytics. See our <a href="/legal/cookies" className="text-amber-400 hover:text-amber-300 underline">Cookie Policy</a> for details.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">8. Children&apos;s Privacy</h2>
            <p>SHIT.ARMY is not intended for users under 18. We do not knowingly collect data from minors. If you believe a minor has created an account, contact us immediately.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">9. International Data Transfers</h2>
            <p>Your data may be processed in countries outside your jurisdiction. We ensure appropriate safeguards are in place for international transfers in compliance with applicable data protection laws.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy periodically. Material changes will be communicated through the Platform. Continued use constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">11. Contact</h2>
            <p>For privacy-related inquiries: <span className="text-amber-400">privacy@shit.army</span></p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <Link href="/" className="text-amber-400 hover:text-amber-300 font-bold">&larr; BACK TO SHIT.ARMY</Link>
        </div>
      </div>
    </div>
  );
}
