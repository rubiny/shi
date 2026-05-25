import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="text-[10rem] leading-none mb-4 animate-bounce">
          🚽
        </div>
        <h1 className="text-6xl font-black mb-4">
          <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            404
          </span>
        </h1>
        <h2 className="text-2xl font-black mb-4 text-zinc-300">
          This page went down the toilet
        </h2>
        <p className="text-zinc-500 mb-8">
          Looks like someone flushed it. The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl font-black text-lg text-black shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform"
        >
          Back to Base
        </Link>
        <p className="mt-6 text-xs text-zinc-600">
          SHIT.ARMY &mdash; even our 404 page is full of shit
        </p>
      </div>
    </div>
  );
}
