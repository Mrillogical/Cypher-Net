"use client";

interface TypingUser {
  userId: string;
  username: string;
}

export default function TypingIndicator({ typingUsers }: { typingUsers: TypingUser[] }) {
  if (typingUsers.length === 0) return <div className="h-5" />;

  let label = "";
  if (typingUsers.length === 1) label = `${typingUsers[0].username} is typing`;
  else if (typingUsers.length === 2)
    label = `${typingUsers[0].username} and ${typingUsers[1].username} are typing`;
  else label = `${typingUsers.length} people are typing`;

  return (
    <div className="h-5 flex items-center gap-1.5 px-1 mb-1">
      {/* Animated dots */}
      <div className="flex gap-0.5 items-end">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1 h-1 rounded-full bg-discord-text-muted animate-pulse-dot"
            style={{ animationDelay: `${i * 0.16}s` }}
          />
        ))}
      </div>
      <span className="text-discord-text-muted text-xs">{label}…</span>
    </div>
  );
}
