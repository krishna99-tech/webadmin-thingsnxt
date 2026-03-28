"use client";

import { HeroUIProvider } from "@heroui/react";
import { AuthProvider } from "@/contexts/auth-context";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <HeroUIProvider>
      <AuthProvider>
        <div className="min-h-screen">{children}</div>
      </AuthProvider>
    </HeroUIProvider>
  );
}
