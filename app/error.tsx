'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="text-8xl mb-6">💀</div>
        <h1 className="text-4xl font-black mb-4">
          <span className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
            Something broke
          </span>
        </h1>
        <p className="text-zinc-400 mb-2">
          The toilet exploded. Our engineers are plunging it.
        </p>
        <p className="text-xs text-zinc-600 mb-8 font-mono">
          {error.digest && `Error: ${error.digest}`}
        </p>
        <button
          onClick={reset}
          className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl font-black text-lg text-black shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
