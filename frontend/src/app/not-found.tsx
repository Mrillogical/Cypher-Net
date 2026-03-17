import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-discord-bg flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="text-8xl font-black text-discord-blurple opacity-20 select-none">404</div>
        <h1 className="text-2xl font-bold text-discord-text-primary">Page not found</h1>
        <p className="text-discord-text-secondary text-sm max-w-xs">
          Wumpus looked everywhere but couldn&apos;t find this page.
        </p>
        <Link
          href="/app"
          className="inline-block mt-4 btn-primary"
        >
          Take me home
        </Link>
      </div>
    </div>
  );
}
