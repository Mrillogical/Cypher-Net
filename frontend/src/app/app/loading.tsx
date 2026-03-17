export default function AppLoading() {
  return (
    <div className="flex h-screen overflow-hidden bg-discord-bg animate-pulse">
      {/* Server sidebar skeleton */}
      <div className="w-[72px] bg-discord-bg flex flex-col items-center py-3 gap-3">
        <div className="w-12 h-12 rounded-full bg-discord-bg-secondary" />
        <div className="w-8 h-px bg-discord-separator" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-12 h-12 rounded-full bg-discord-bg-secondary" />
        ))}
      </div>

      {/* Channel sidebar skeleton */}
      <div className="w-60 bg-discord-bg-secondary flex flex-col">
        <div className="h-12 border-b border-discord-bg px-4 flex items-center">
          <div className="h-4 w-32 rounded bg-discord-bg-hover" />
        </div>
        <div className="flex-1 p-3 space-y-2">
          <div className="h-3 w-24 rounded bg-discord-bg-hover mb-4" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 rounded bg-discord-bg-hover" />
          ))}
        </div>
        <div className="h-14 bg-discord-bg" />
      </div>

      {/* Chat area skeleton */}
      <div className="flex-1 bg-discord-bg-tertiary flex flex-col">
        <div className="h-12 border-b border-discord-separator px-4 flex items-center">
          <div className="h-4 w-40 rounded bg-discord-bg-hover" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3, 5, 6].map((i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-discord-bg-secondary flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-24 rounded bg-discord-bg-secondary" />
                <div className={`h-4 rounded bg-discord-bg-secondary`} style={{ width: `${30 + (i * 17) % 50}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="p-4">
          <div className="h-12 rounded-lg bg-discord-bg-secondary" />
        </div>
      </div>
    </div>
  );
}
