"use client";

import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "sonner";
import type { ReactNode } from "react";

/**
 * Global providers + single full-viewport shell so every route shares the same
 * background, theme class, and min-height behavior (dashboard + login).
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <HeroUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <div className="app-shell flex min-h-dvh flex-col bg-background text-foreground">
            {children}
            <Toaster richColors position="top-right" closeButton />
          </div>
        </AuthProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
