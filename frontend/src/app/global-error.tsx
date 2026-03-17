"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-discord-bg min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="text-6xl mb-4">💥</div>
          <h2 className="text-xl font-bold text-discord-text-primary">
            Something went wrong
          </h2>
          <p className="text-discord-text-secondary text-sm max-w-sm">
            {error.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={reset}
            className="btn-primary mt-4"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
