import type { Metadata } from 'next';
import BlogPageClient from './BlogPageClient';
import { getAllPosts, getAllCategories, CATEGORY_META } from '@/lib/blog/posts';

export const metadata: Metadata = {
  title: 'Blog — SHIT.ARMY | Earn Guides, Crypto Tips & More',
  description: 'Learn how to maximize your earnings on SHIT.ARMY. Guides, tutorials, offer comparisons, and crypto tips from top earners.',
  openGraph: {
    title: 'Blog — SHIT.ARMY | Earn Guides & Crypto Tips',
    description: 'Guides, tutorials, and tips to help you earn more $SHIT.',
    url: 'https://shit.army/blog',
    type: 'website',
  },
  alternates: {
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const categories = getAllCategories();
  const categoryMeta = CATEGORY_META;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'SHIT.ARMY Blog',
            url: 'https://shit.army/blog',
            description: 'Earn guides, crypto tips, and platform news from SHIT.ARMY',
            publisher: {
              '@type': 'Organization',
              name: 'SHIT.ARMY',
              url: 'https://shit.army',
            },
            blogPost: posts.map(p => ({
              '@type': 'BlogPosting',
              headline: p.title,
              url: `https://shit.army/blog/${p.slug}`,
              datePublished: p.publishedAt,
              dateModified: p.updatedAt || p.publishedAt,
              author: { '@type': 'Person', name: p.author },
              description: p.description,
            })),
          }),
        }}
      />
      <BlogPageClient
        posts={posts}
        categories={categories}
        categoryMeta={categoryMeta}
      />
    </>
  );
}
