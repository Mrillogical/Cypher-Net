"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useServerStore } from "@/lib/stores/serverStore";
import { useAuthStore } from "@/lib/stores/authStore";
import { Crown } from "lucide-react";

interface Member {
  id: string;
  userId: string;
  joinedAt: string;
  user: { id: string; username: string };
}

export default function MembersSidebar() {
  const { activeServer } = useServerStore();
  const { user } = useAuthStore();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeServer) return;
    setLoading(true);
    api
      .get(`/api/servers/${activeServer.id}/members`)
      .then(({ data }) => setMembers(data.data.members))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeServer?.id]);

  if (!activeServer) return null;

  const online = members; // In MVP, treat all as online
  const ownerIds = new Set([activeServer.ownerId]);

  return (
    <div className="w-60 bg-discord-bg-secondary flex flex-col flex-shrink-0">
      <div className="py-4 px-3">
        {/* Online section */}
        <p className="text-xs font-bold uppercase tracking-wide text-discord-text-muted px-2 mb-2">
          Members — {members.length}
        </p>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-discord-bg-hover" />
                <div className="h-3 flex-1 rounded bg-discord-bg-hover" />
              </div>
            ))}
          </div>
        ) : (
          <ul className="space-y-0.5">
            {members.map((member) => {
              const isOwner = ownerIds.has(member.user.id);
              const isCurrentUser = member.user.id === user?.id;
              return (
                <li
                  key={member.id}
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-discord-bg-hover cursor-pointer group"
                >
                  {/* Avatar with online dot */}
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-discord-blurple flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {member.user.username[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-discord-green border-2 border-discord-bg-secondary" />
                  </div>

                  {/* Username */}
                  <span
                    className={`text-sm truncate flex-1
                    ${isCurrentUser ? "text-discord-text-primary font-medium" : "text-discord-text-secondary"}
                    group-hover:text-discord-text-primary transition-colors`}
                  >
                    {member.user.username}
                    {isCurrentUser && (
                      <span className="text-discord-text-muted text-xs ml-1">(you)</span>
                    )}
                  </span>

                  {/* Owner crown */}
                  {isOwner && (
                    <Crown
                      size={12}
                      className="text-discord-yellow flex-shrink-0"
                      title="Server owner"
                    />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
