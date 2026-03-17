"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth().then(() => {
      const { isAuthenticated } = useAuthStore.getState();
      router.replace(isAuthenticated ? "/app" : "/auth/login");
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-screen flex items-center justify-center bg-discord-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-discord-blurple flex items-center justify-center animate-pulse">
          <span className="text-white font-bold text-sm tracking-tighter">CN</span>
        </div>
        <p className="text-discord-text-muted text-sm">Loading...</p>
      </div>
    </div>
  );
}
