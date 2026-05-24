import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | SHIT.ARMY',
  description: 'How SHIT.ARMY uses cookies and local storage.',
};

export default function CookiePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-black mb-2">COOKIE POLICY</h1>
        <p className="text-zinc-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="space-y-8 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">1. What Are Cookies</h2>
            <p>Cookies are small text files stored on your device when you visit a website. We also use localStorage and sessionStorage for similar purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">2. Cookies We Use</h2>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-2 text-amber-400">Name</th>
                    <th className="text-left py-3 px-2 text-amber-400">Type</th>
                    <th className="text-left py-3 px-2 text-amber-400">Purpose</th>
                    <th className="text-left py-3 px-2 text-amber-400">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="py-3 px-2 font-mono text-xs">sb-access-token</td>
                    <td className="py-3 px-2">Essential</td>
                    <td className="py-3 px-2">Authentication session</td>
                    <td className="py-3 px-2">1 hour</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-2 font-mono text-xs">sb-refresh-token</td>
                    <td className="py-3 px-2">Essential</td>
                    <td className="py-3 px-2">Session refresh</td>
                    <td className="py-3 px-2">7 days</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-2 font-mono text-xs">onboarding_complete</td>
                    <td className="py-3 px-2">Functional</td>
                    <td className="py-3 px-2">Track onboarding status</td>
                    <td className="py-3 px-2">Persistent</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-2 font-mono text-xs">preferred_language</td>
                    <td className="py-3 px-2">Functional</td>
                    <td className="py-3 px-2">Language preference</td>
                    <td className="py-3 px-2">Persistent</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-2 font-mono text-xs">_ga / _gid</td>
                    <td className="py-3 px-2">Analytics</td>
                    <td className="py-3 px-2">Google Analytics tracking</td>
                    <td className="py-3 px-2">2 years / 24h</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-2 font-mono text-xs">ph_*</td>
                    <td className="py-3 px-2">Analytics</td>
                    <td className="py-3 px-2">PostHog analytics</td>
                    <td className="py-3 px-2">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">3. Cookie Categories</h2>
            <ul className="space-y-4">
              <li>
                <strong className="text-white">Essential cookies</strong> — Required for the Platform to function. Cannot be disabled. Include authentication and security cookies.
              </li>
              <li>
                <strong className="text-white">Functional cookies</strong> — Remember your preferences (language, theme, onboarding status). Improve your experience but not strictly necessary.
              </li>
              <li>
                <strong className="text-white">Analytics cookies</strong> — Help us understand how users interact with the Platform. Data is aggregated and anonymized where possible.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">4. Managing Cookies</h2>
            <p className="mb-3">You can control cookies through:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Browser settings:</strong> Most browsers allow you to block or delete cookies</li>
              <li><strong>Platform settings:</strong> Toggle analytics in Settings &gt; Privacy</li>
              <li><strong>Do Not Track:</strong> We respect DNT headers for analytics cookies</li>
            </ul>
            <p className="mt-3 text-zinc-400">Note: Blocking essential cookies will prevent you from using the Platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">5. Third-Party Cookies</h2>
            <p>Our offerwall partners (OfferToro, AdGem, AdScend) may set their own cookies when you interact with offers. These are governed by their respective privacy policies. We have no control over third-party cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">6. Updates</h2>
            <p>We may update this Cookie Policy as our use of cookies evolves. Check back periodically for changes.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">7. Contact</h2>
            <p>Questions about cookies? <span className="text-amber-400">privacy@shit.army</span></p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <a href="/" className="text-amber-400 hover:text-amber-300 font-bold">&larr; BACK TO SHIT.ARMY</a>
        </div>
      </div>
    </div>
  );
}
