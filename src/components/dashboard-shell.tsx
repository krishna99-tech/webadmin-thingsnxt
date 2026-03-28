"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@heroui/react";
import { Menu, PanelLeftClose } from "lucide-react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[hsl(210_20%_98%)] dark:bg-[hsl(222_47%_6%)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-default-500">Loading workspace…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[hsl(210_20%_98%)]">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[hsl(210_20%_98%)] dark:bg-[hsl(222_47%_6%)] overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <header className="sticky top-0 z-40 h-14 flex items-center justify-between px-4 sm:px-6 border-b border-default-200/80 dark:border-default-100/10 bg-content1/95 dark:bg-content1/90">
          <div className="flex items-center gap-2 min-w-0">
            <Button
              isIconOnly
              variant="light"
              radius="md"
              size="sm"
              className="text-default-600 shrink-0"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              onPress={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? (
                <Menu size={20} strokeWidth={2} />
              ) : (
                <PanelLeftClose size={20} strokeWidth={2} />
              )}
            </Button>
            <div className="hidden sm:flex items-center gap-2 min-w-0 pl-1">
              <span className="h-1.5 w-1.5 rounded-full bg-success shrink-0" />
              <span className="text-xs font-medium text-default-500 truncate">
                Connected
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-right">
            <div>
              <p className="text-[10px] font-medium text-default-400 uppercase tracking-wide">
                Environment
              </p>
              <p className="text-xs font-semibold text-default-700 dark:text-default-300">
                Production
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-hide bg-default-100/50 dark:bg-default-50/[0.03]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
