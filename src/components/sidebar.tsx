"use client";

import React from "react";
import { AppLink } from "@/components/ui/app-link";
import { usePathname } from "next/navigation";
import {
  Users,
  Cpu,
  ShieldAlert,
  Mail,
  LogOut,
  Terminal,
  Activity,
  Crosshair,
  LayoutGrid,
  Settings,
  HeartPulse,
  Inbox,
  ChevronRight,
  Database,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Button, Tooltip, Avatar, Badge } from "@heroui/react";

interface SidebarItemProps {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  to: string;
  collapsed: boolean;
}

function navActive(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

function SidebarItem({ icon: Icon, label, to, collapsed }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = navActive(pathname, to);

  const inner = (
    <div
      className={`
        relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200
        border-l-[3px] -ml-px
        ${
          isActive
            ? "border-primary bg-primary/12 text-primary font-semibold"
            : "border-transparent text-default-600 hover:bg-default-100/90 dark:text-default-400 dark:hover:bg-default-100/10"
        }
        ${collapsed ? "justify-center px-2" : ""}
      `}
    >
      <Icon size={20} strokeWidth={isActive ? 2.25 : 2} className="shrink-0" />
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 truncate text-sm font-medium tracking-tight">{label}</span>
          {isActive && <ChevronRight size={14} className="shrink-0 opacity-50" />}
        </>
      )}
    </div>
  );

  const link = (
    <AppLink
      href={to}
      className="mb-1 block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      {inner}
    </AppLink>
  );

  if (collapsed) {
    return (
      <Tooltip content={label} placement="right" closeDelay={0} delay={300}>
        {link}
      </Tooltip>
    );
  }

  return link;
}

const MENU_ITEMS = [
  { icon: Crosshair, label: "Mission Control", to: "/" },
  { icon: LayoutGrid, label: "Analytics", to: "/analytics" },
  { icon: Users, label: "Users", to: "/users" },
  { icon: Cpu, label: "Devices", to: "/devices" },
  { icon: ShieldAlert, label: "Security", to: "/security" },
  { icon: Mail, label: "Broadcast", to: "/broadcast" },
  { icon: Inbox, label: "Email", to: "/email" },
  { icon: Database, label: "Storage", to: "/storage" },
  { icon: Settings, label: "Platform", to: "/settings" },
  { icon: HeartPulse, label: "System", to: "/system" },
  { icon: Activity, label: "Audit log", to: "/logs" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { logout, user } = useAuth();

  const displayName =
    (user?.full_name as string | undefined) ||
    (user?.username as string | undefined) ||
    "User";
  const userEmail = (user?.email as string | undefined) || "";
  const access = (user?.access_right as string | undefined) || "Standard";

  return (
    <aside
      className={`
        relative z-50 flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-r border-default-200/80 bg-content1 transition-[width] duration-300 ease-out
        dark:border-default-100/10
        ${collapsed ? "w-[72px]" : "w-[260px]"}
      `}
    >
      <div className={`border-b border-default-200/60 p-5 dark:border-default-100/10 ${collapsed ? "px-3" : ""}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/85 text-white shadow-md shadow-primary/20">
            <Terminal size={22} strokeWidth={2} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-heading text-base font-semibold tracking-tight text-default-900 dark:text-default-100">
                ThingsNXT
              </p>
              <p className="text-[11px] font-medium uppercase tracking-wide text-primary">Admin</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col justify-start space-y-0.5 overflow-hidden px-3 py-3 scrollbar-hide">
        {MENU_ITEMS.map((item) => (
          <SidebarItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </nav>

      <div className={`border-t border-default-200/60 p-4 dark:border-default-100/10 ${collapsed ? "px-2" : ""}`}>
        <div
          className={`rounded-xl border border-default-200/60 bg-default-50/60 p-3 dark:border-default-100/10 dark:bg-default-100/[0.06] ${
            collapsed ? "p-2" : ""
          }`}
        >
          {!collapsed ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar size="sm" className="bg-primary text-primary-foreground" name={displayName} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-default-900 dark:text-default-100">{displayName}</p>
                  {userEmail ? (
                    <p className="truncate text-xs text-default-500">{userEmail}</p>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <Badge size="sm" variant="flat" color="primary" className="font-medium">
                  {access}
                </Badge>
                <Button
                  size="sm"
                  variant="bordered"
                  color="danger"
                  radius="lg"
                  startContent={<LogOut size={14} strokeWidth={2} />}
                  onPress={logout}
                  className="font-semibold"
                >
                  Sign out
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Avatar size="sm" className="bg-primary text-primary-foreground" name={displayName} />
              <Tooltip content="Sign out" placement="right">
                <Button isIconOnly size="sm" variant="bordered" color="danger" radius="lg" onPress={logout} aria-label="Sign out">
                  <LogOut size={16} />
                </Button>
              </Tooltip>
            </div>
          )}
        </div>
      </div>

      {onToggle ? (
        <button
          type="button"
          onClick={onToggle}
          className={`
            absolute -right-3 top-24 z-50 flex h-7 w-7 items-center justify-center rounded-full
            border border-default-200 bg-content1 text-default-500 shadow-sm transition-transform hover:bg-default-100
            dark:border-default-100/15 dark:hover:bg-default-100/10
            ${collapsed ? "rotate-180" : ""}
          `}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronRight size={14} />
        </button>
      ) : null}
    </aside>
  );
}
