import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;

  return {
    title: `Join SHIT.ARMY — ${code}'s Squad`,
    description: `${code} invited you to SHIT.ARMY. Complete offers, stake $SHIT, recruit soldiers & earn real crypto. APE IN NOW!`,
    openGraph: {
      title: `💩 ${code} invited you to SHIT.ARMY`,
      description: 'Complete offers, stake $SHIT, recruit soldiers & earn real crypto. Join the degen army today!',
      url: `https://shit.army/ref/${code}`,
      siteName: 'SHIT.ARMY',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'SHIT.ARMY — Earn Real Crypto',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `💩 ${code} invited you to SHIT.ARMY`,
      description: 'Complete offers, stake $SHIT, recruit soldiers & earn real crypto. Join the degen army today!',
      images: ['/og-image.png'],
    },
  };
}

export default async function ReferralPage({ params }: Props) {
  const { code } = await params;
  // Store referral code and redirect to main page
  redirect(`/?ref=${code}`);
}
