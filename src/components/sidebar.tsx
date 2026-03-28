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
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Button, Divider } from "@heroui/react";

function navActive(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

function SidebarItem({
  icon: Icon,
  label,
  to,
  collapsed,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
  to: string;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const isActive = navActive(pathname, to);

  return (
    <AppLink href={to} className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
      <div
        className={`
          relative flex items-center gap-3 pl-3 pr-3 py-2.5 rounded-xl transition-colors duration-200
          border-l-[3px] -ml-px
          ${
            isActive
              ? "border-primary bg-primary/12 text-primary font-semibold"
              : "border-transparent text-default-600 hover:bg-default-100/80 dark:hover:bg-default-100/10"
          }
        `}
      >
        <Icon size={20} strokeWidth={isActive ? 2.25 : 2} className="shrink-0 opacity-90" />
        {!collapsed && (
          <span className="text-sm font-medium tracking-tight truncate">{label}</span>
        )}
      </div>
    </AppLink>
  );
}

export function Sidebar({ collapsed }: { collapsed: boolean }) {
  const { logout, user } = useAuth();

  const menuItems = [
    { icon: Crosshair, label: "Mission Control", to: "/" },
    { icon: LayoutGrid, label: "Analytics", to: "/analytics" },
    { icon: Users, label: "Users", to: "/users" },
    { icon: Cpu, label: "Devices", to: "/devices" },
    { icon: ShieldAlert, label: "Security", to: "/security" },
    { icon: Mail, label: "Broadcast", to: "/broadcast" },
    { icon: Settings, label: "Platform", to: "/settings" },
    { icon: Inbox, label: "Email", to: "/email" },
    { icon: HeartPulse, label: "System", to: "/system" },
    { icon: Activity, label: "Audit log", to: "/logs" },
  ];

  const displayName =
    (user?.full_name as string | undefined) ||
    (user?.username as string | undefined) ||
    "User";

  return (
    <aside
      className={`
      h-screen flex flex-col border-r border-default-200/80 dark:border-default-100/10
      bg-content1 transition-[width] duration-300 ease-out z-50
      ${collapsed ? "w-[72px]" : "w-[260px]"}
    `}
    >
      <div className={`p-5 ${collapsed ? "px-3" : "px-5"}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-md shadow-primary/20">
            <Terminal size={22} strokeWidth={2} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-semibold text-default-900 tracking-tight leading-tight truncate">
                ThingsNXT
              </p>
              <p className="text-[11px] text-default-500 font-medium">Admin</p>
            </div>
          )}
        </div>
      </div>

      <div className={`px-4 ${collapsed ? "px-2" : ""}`}>
        <Divider className="bg-default-200/60" />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => (
          <SidebarItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </nav>

      <div className={`p-4 border-t border-default-200/60 dark:border-default-100/10 ${collapsed ? "px-2" : ""}`}>
        <div
          className={`rounded-xl bg-default-100/60 dark:bg-default-100/[0.07] border border-default-200/70 dark:border-default-100/12 p-3.5 ${
            collapsed ? "p-2.5" : ""
          }`}
        >
          {!collapsed && (
            <div className="mb-3.5 px-0.5">
              <p className="text-[11px] font-semibold text-default-400 uppercase tracking-[0.12em] mb-1">
                Signed in as
              </p>
              <p className="text-sm font-semibold text-default-900 dark:text-default-100 truncate font-heading">
                {displayName}
              </p>
            </div>
          )}
          {collapsed ? (
            <Button
              fullWidth
              variant="bordered"
              color="danger"
              radius="lg"
              size="md"
              isIconOnly
              aria-label="Sign out"
              onPress={logout}
              className="min-w-0 w-full h-11 border-2 border-danger-200 dark:border-danger-500/40 text-danger font-semibold"
            >
              <LogOut size={18} strokeWidth={2} />
            </Button>
          ) : (
            <Button
              fullWidth
              variant="bordered"
              color="danger"
              radius="lg"
              size="md"
              startContent={<LogOut size={18} strokeWidth={2} />}
              onPress={logout}
              className="h-11 font-semibold font-heading border-2 border-danger-200 dark:border-danger-500/40 text-danger bg-danger-50/30 dark:bg-danger-500/5 data-[hover=true]:bg-danger-100/50 dark:data-[hover=true]:bg-danger-500/15 justify-center"
            >
              Sign out
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
