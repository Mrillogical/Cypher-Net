"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import AppShell from "@/components/layout/AppShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth().then(() => {
      if (!useAuthStore.getState().isAuthenticated) {
        router.replace("/auth/login");
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-discord-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-discord-blurple animate-pulse" />
          <p className="text-discord-text-muted text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <AppShell>{children}</AppShell>;
}
