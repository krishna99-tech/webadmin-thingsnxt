"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@heroui/react";
import { Menu, PanelLeftClose, Bell, Search, User } from "lucide-react";

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
      <div className="flex min-h-dvh w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-default-500">Loading workspace…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="admin-layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
      />

      <div className="content-area">
        <header className="nav-blur z-40 flex h-14 shrink-0 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Button
              isIconOnly
              variant="light"
              radius="md"
              size="sm"
              className="text-default-600 shrink-0"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              onPress={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? <Menu size={20} strokeWidth={2} /> : <PanelLeftClose size={20} strokeWidth={2} />}
            </Button>

            <div className="hidden md:flex max-w-md flex-1 items-center gap-2 rounded-xl border border-default-200/80 bg-default-100/50 px-3 py-2 text-default-500 dark:border-default-100/10 dark:bg-default-100/5">
              <Search size={16} className="shrink-0 opacity-70" />
              <span className="text-xs font-medium truncate">Search workspace…</span>
              <kbd className="ml-auto hidden sm:inline-flex h-5 select-none items-center rounded border border-default-200 bg-content1 px-1.5 font-mono text-[10px] text-default-400 dark:border-default-100/15">
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex flex-col items-end pr-1">
              <span className="text-[10px] font-medium uppercase tracking-wide text-default-400">Environment</span>
              <span className="text-xs font-semibold text-default-700 dark:text-default-200">Production</span>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-1 text-[10px] font-medium text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Live
            </span>
            <Button isIconOnly variant="light" radius="full" size="sm" className="text-default-500" aria-label="Notifications">
              <Bell size={20} />
            </Button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-xs font-bold text-primary-foreground shadow-sm ring-2 ring-background">
              {user.username?.charAt(0).toUpperCase() || <User size={14} strokeWidth={2} />}
            </div>
          </div>
        </header>

        <main className="admin-main flex-1 min-h-0 overflow-y-auto scrollbar-hide">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
