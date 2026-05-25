import type { Metadata } from 'next';
import OffersPageClient from './OffersPageClient';
import { getAllOffers, getTotalPotential, OFFER_CATEGORY_META } from '@/lib/blog/offers';

export const metadata: Metadata = {
  title: 'Best Paying Offers — SHIT.ARMY | Earn Free Crypto',
  description: 'Browse the highest-paying offers on SHIT.ARMY. Earn $5-$50 per task — mobile games, signups, surveys, and more. Start earning free crypto today.',
  openGraph: {
    title: 'Best Paying Offers — SHIT.ARMY',
    description: 'Browse 12+ high-paying offers. Earn $5-$50 per task with free crypto withdrawals.',
    url: 'https://shit.army/offers',
    type: 'website',
  },
};

export default function OffersPage() {
  const offers = getAllOffers();
  const totalPotential = getTotalPotential();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Best Paying Offers on SHIT.ARMY',
            url: 'https://shit.army/offers',
            numberOfItems: offers.length,
            itemListElement: offers.map((o, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: o.name,
              description: o.description,
            })),
          }),
        }}
      />
      <OffersPageClient
        offers={offers}
        totalPotential={totalPotential}
        categoryMeta={OFFER_CATEGORY_META}
      />
    </>
  );
}
