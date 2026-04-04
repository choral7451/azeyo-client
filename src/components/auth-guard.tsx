"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { useToast } from "@/components/toast";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const { show } = useToast();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      show("로그인이 필요한 기능이에요");
      router.replace("/login");
    }
  }, [isLoading, isLoggedIn, router, show]);

  if (isLoading || !isLoggedIn) return null;

  return <>{children}</>;
}
