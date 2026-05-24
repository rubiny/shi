export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-6 animate-bounce">💩</div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <span className="text-zinc-400 font-bold text-sm tracking-wider uppercase">
            Loading the toilet...
          </span>
        </div>
      </div>
    </div>
  );
}
