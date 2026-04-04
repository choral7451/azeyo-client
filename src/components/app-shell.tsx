"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { PageHeader } from "@/components/page-header";
import { HeaderExtraProvider } from "@/components/header-context";
import { NotificationListener } from "@/components/notification-listener";
import { AuthProvider } from "@/components/auth-context";
import { ToastProvider } from "@/components/toast";

const AUTH_ROUTES = ["/login", "/signup", "/auth", "/terms", "/privacy"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  if (isAuth) {
    return (
      <AuthProvider>
        <div className="mx-auto max-w-[480px] min-h-dvh relative">
          {children}
        </div>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <ToastProvider>
        <HeaderExtraProvider>
          <div className="mx-auto max-w-[480px] min-h-dvh relative pb-20">
            <PageHeader />
            {children}
          </div>
          <BottomNav />
          <NotificationListener />
        </HeaderExtraProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
