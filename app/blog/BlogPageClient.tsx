'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { BlogPost, BlogCategory } from '@/lib/blog/posts';

interface Props {
  posts: BlogPost[];
  categories: BlogCategory[];
  categoryMeta: Record<string, { label: string; emoji: string; color: string }>;
}

export default function BlogPageClient({ posts, categories, categoryMeta }: Props) {
  const [activeCategory, setActiveCategory] = useState<BlogCategory | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = posts;
    if (activeCategory !== 'all') {
      result = result.filter(p => p.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [posts, activeCategory, search]);

  const featured = posts.filter(p => p.featured).slice(0, 2);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-2xl">💩</span>
              <span className="font-black text-xl tracking-tighter">
                SHIT<span className="text-amber-500">.ARMY</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/blog" className="text-amber-400 text-sm font-bold">BLOG</Link>
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-amber-500 text-sm font-bold tracking-[3px] mb-2">THE DEGEN KNOWLEDGE BASE</div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4">
            EARN <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">SMARTER</span>
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Guides, tutorials, and strategies from top earners. Learn how to maximize your $SHIT and stack like a pro.
          </p>
        </div>

        {/* Featured Posts */}
        {activeCategory === 'all' && !search && featured.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {featured.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group relative rounded-2xl border border-white/10 overflow-hidden hover:border-amber-500/30 transition-all glass-card-shine hover-lift"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-bold text-amber-400">
                      ⭐ FEATURED
                    </span>
                    <span className={`px-3 py-1 bg-zinc-800/50 rounded-full text-xs font-bold ${categoryMeta[post.category]?.color || 'text-zinc-400'}`}>
                      {categoryMeta[post.category]?.emoji} {categoryMeta[post.category]?.label}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black mb-3 group-hover:text-amber-400 transition-colors leading-tight">
                    {post.title}
                  </h2>
                  <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{post.description}</p>
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span>{post.authorAvatar} {post.author}</span>
                    <span>·</span>
                    <span>{post.readTime} min read</span>
                    <span>·</span>
                    <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full px-5 py-3 bg-zinc-900/60 border border-white/10 rounded-2xl text-sm placeholder:text-zinc-600 focus:border-amber-500/30 focus:outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600">🔍</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === 'all'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-zinc-900/60 text-zinc-500 border border-white/5 hover:text-zinc-300'
              }`}
            >
              ALL
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-zinc-900/60 text-zinc-500 border border-white/5 hover:text-zinc-300'
                }`}
              >
                {categoryMeta[cat]?.emoji} {categoryMeta[cat]?.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">💩</div>
            <p className="text-zinc-500 font-bold">No posts found. Try a different search.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group rounded-2xl border border-white/5 overflow-hidden hover:border-amber-500/20 transition-all glass-card-shine hover-lift bg-zinc-900/20"
              >
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2.5 py-1 bg-zinc-800/50 rounded-lg text-[10px] font-bold ${categoryMeta[post.category]?.color || 'text-zinc-400'}`}>
                      {categoryMeta[post.category]?.emoji} {categoryMeta[post.category]?.label}
                    </span>
                    <span className="text-[10px] text-zinc-600">{post.readTime} min</span>
                  </div>
                  <h3 className="font-black text-sm mb-2 group-hover:text-amber-400 transition-colors leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-zinc-500 mb-4 line-clamp-2">{post.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-zinc-600">
                    <span>{post.authorAvatar} {post.author}</span>
                    <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* RSS + Newsletter CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-8 rounded-2xl border border-white/10 bg-zinc-900/30">
            <div className="text-left">
              <h3 className="font-black text-lg mb-1">Never miss alpha</h3>
              <p className="text-sm text-zinc-500">New guides and offers every week</p>
            </div>
            <a
              href="/feed.xml"
              className="px-6 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 font-bold text-sm hover:bg-amber-500/20 transition-colors"
            >
              📡 RSS Feed
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10 bg-black mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
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
  );
}
