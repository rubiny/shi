import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllPosts, getPostBySlug, getRelatedPosts, CATEGORY_META } from '@/lib/blog/posts';
import BlogPostContent from './BlogPostContent';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Post Not Found' };

  return {
    title: `${post.title} | SHIT.ARMY Blog`,
    description: post.description,
    keywords: post.tags.join(', '),
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://shit.army/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: [post.author],
      tags: post.tags,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
    alternates: {
      canonical: `https://shit.army/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getRelatedPosts(slug, 3);
  const catMeta = CATEGORY_META[post.category];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.description,
            url: `https://shit.army/blog/${post.slug}`,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt || post.publishedAt,
            author: {
              '@type': 'Person',
              name: post.author,
            },
            publisher: {
              '@type': 'Organization',
              name: 'SHIT.ARMY',
              url: 'https://shit.army',
              logo: { '@type': 'ImageObject', url: 'https://shit.army/icons/icon-512x512.png' },
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://shit.army/blog/${post.slug}`,
            },
            keywords: post.tags.join(', '),
            wordCount: post.content.split(/\s+/).length,
            timeRequired: `PT${post.readTime}M`,
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://shit.army' },
                { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://shit.army/blog' },
                { '@type': 'ListItem', position: 3, name: post.title, item: `https://shit.army/blog/${post.slug}` },
              ],
            },
          }),
        }}
      />

      <div className="min-h-screen bg-[#0a0a0a] text-white">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <span className="text-2xl">💩</span>
                <span className="font-black text-xl tracking-tighter">
                  SHIT<span className="text-amber-500">.ARMY</span>
                </span>
              </Link>
              <div className="flex items-center gap-4">
                <Link href="/blog" className="text-zinc-400 hover:text-white text-sm font-bold transition-colors">BLOG</Link>
                <Link href="/offers" className="text-zinc-400 hover:text-white text-sm font-bold transition-colors">OFFERS</Link>
                <Link
                  href="/"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full font-black text-sm hover:scale-105 transition-transform shadow-lg shadow-amber-500/20"
                >
                  💩 APE IN
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-8">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-zinc-400 truncate max-w-[200px]">{post.title}</span>
          </nav>

          {/* Header */}
          <header className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 bg-zinc-800/50 rounded-lg text-xs font-bold ${catMeta?.color || 'text-zinc-400'}`}>
                {catMeta?.emoji} {catMeta?.label}
              </span>
              <span className="text-xs text-zinc-600">{post.readTime} min read</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-6">
              {post.title}
            </h1>
            <p className="text-lg text-zinc-400 mb-6">{post.description}</p>
            <div className="flex items-center gap-4 text-sm text-zinc-500 pb-6 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{post.authorAvatar}</span>
                <span className="font-bold">{post.author}</span>
              </div>
              <span>·</span>
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </time>
              {post.updatedAt && (
                <>
                  <span>·</span>
                  <span className="text-amber-400/60">Updated {new Date(post.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </>
              )}
            </div>
          </header>

          {/* Content */}
          <BlogPostContent content={post.content} />

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="px-3 py-1.5 bg-zinc-900/60 border border-white/5 rounded-lg text-xs text-zinc-400 font-bold">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 p-8 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-orange-500/5 text-center">
            <h3 className="text-2xl font-black mb-2">Ready to start earning?</h3>
            <p className="text-zinc-400 mb-6">Join 47K degens already stacking $SHIT</p>
            <Link
              href="/"
              className="inline-block px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl font-black text-lg shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform"
            >
              💩 APE IN NOW
            </Link>
          </div>

          {/* Related Posts */}
          {related.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-black mb-6">MORE ALPHA</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {related.map((rp) => {
                  const rpCat = CATEGORY_META[rp.category];
                  return (
                    <Link
                      key={rp.slug}
                      href={`/blog/${rp.slug}`}
                      className="group p-5 rounded-2xl border border-white/5 hover:border-amber-500/20 transition-all bg-zinc-900/20 glass-card-shine hover-lift"
                    >
                      <span className={`text-[10px] font-bold ${rpCat?.color || 'text-zinc-400'}`}>
                        {rpCat?.emoji} {rpCat?.label}
                      </span>
                      <h3 className="font-black text-sm mt-2 mb-2 group-hover:text-amber-400 transition-colors leading-snug line-clamp-2">
                        {rp.title}
                      </h3>
                      <span className="text-[10px] text-zinc-600">{rp.readTime} min read</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </article>

        {/* Footer */}
        <footer className="py-8 border-t border-white/10 bg-black mt-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span>💩</span>
              <span className="font-black text-sm">SHIT.ARMY</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-zinc-500">
              <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
              <Link href="/offers" className="hover:text-white transition-colors">Offers</Link>
              <Link href="/legal/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link>
            </div>
            <p className="text-xs text-zinc-600">© 2026 SHIT.ARMY</p>
          </div>
        </footer>
      </div>
    </>
  );
}
