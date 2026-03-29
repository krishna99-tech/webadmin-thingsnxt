// @ts-nocheck
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/api";
import { Skeleton, Button, Chip, Divider } from "@heroui/react";
import {
  Users,
  Cpu,
  Wifi,
  WifiOff,
  Activity,
  RefreshCw,
  Zap,
  Globe,
  CheckCircle2,
  XCircle,
  LayoutDashboard,
} from "lucide-react";

/* ─────────────────────────── types ─────────────────────────── */

interface LogEntry {
  id: number;
  action: string;
  node: string;
  timestamp: string;
  status: "SUCCESS" | "INTERCEPTED";
}

/* ─────────────────────────── stat card ─────────────────────────── */

type StatColor = "primary" | "success" | "danger" | "default";

const colorMap: Record<
  StatColor,
  { bg: string; text: string; icon: string }
> = {
  primary: {
    bg: "bg-primary/10 dark:bg-primary/15",
    text: "text-primary",
    icon: "text-primary",
  },
  success: {
    bg: "bg-success/10 dark:bg-success/15",
    text: "text-success",
    icon: "text-success",
  },
  danger: {
    bg: "bg-danger/10 dark:bg-danger/15",
    text: "text-danger",
    icon: "text-danger",
  },
  default: {
    bg: "bg-default-100 dark:bg-default-100/10",
    text: "text-default-600",
    icon: "text-default-500",
  },
};

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "default",
  loading,
}: {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  color?: StatColor;
  loading?: boolean;
}) {
  const c = colorMap[color];
  return (
    <div className="rounded-2xl border border-default-200/80 dark:border-default-100/12 bg-content1 px-5 py-5 flex flex-col gap-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-default-500 font-medium">{title}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${c.bg}`}>
          <Icon size={17} strokeWidth={2} className={c.icon} />
        </div>
      </div>
      {loading ? (
        <>
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-4 w-16 rounded-md" />
        </>
      ) : (
        <>
          <p className={`text-3xl font-semibold font-heading tracking-tight ${c.text}`}>
            {value.toLocaleString()}
          </p>
          {subtitle && (
            <p className="text-xs text-default-400 font-medium">{subtitle}</p>
          )}
        </>
      )}
    </div>
  );
}

/* ─────────────────────────── activity bar ─────────────────────────── */

function ActivityBar({
  label,
  count,
  total,
  index,
}: {
  label: string;
  count: number;
  total: number;
  index: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const barColors = [
    "bg-primary",
    "bg-secondary",
    "bg-success",
    "bg-warning",
    "bg-danger",
  ];
  const bar = barColors[index % barColors.length];

  return (
    <div className="group">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-sm font-medium text-default-700 dark:text-default-300 capitalize">
          {label.replace(/_/g, " ").toLowerCase()}
        </span>
        <span className="text-sm font-semibold text-default-900 dark:text-default-100 tabular-nums">
          {pct}%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-default-100 dark:bg-default-100/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-[width] duration-700 ease-out ${bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-default-400 mt-1 tabular-nums">{count.toLocaleString()} events</p>
    </div>
  );
}

/* ─────────────────────────── log row ─────────────────────────── */

function LogRow({ log }: { log: LogEntry }) {
  const ok = log.status === "SUCCESS";
  return (
    <div className="flex items-center justify-between py-3 border-b border-default-100/60 dark:border-default-100/8 last:border-0 group">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
            ok
              ? "bg-success/10 text-success"
              : "bg-danger/10 text-danger"
          }`}
        >
          {ok ? (
            <CheckCircle2 size={14} strokeWidth={2} />
          ) : (
            <XCircle size={14} strokeWidth={2} />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-default-800 dark:text-default-100 capitalize truncate">
            {log.action.replace(/_/g, " ").toLowerCase()}
          </p>
          <p className="text-xs text-default-400 font-mono">{log.node}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 pl-3">
        <Chip
          size="sm"
          color={ok ? "success" : "danger"}
          variant="flat"
          className="text-[10px] font-medium"
        >
          {ok ? "Success" : "Intercepted"}
        </Chip>
        <span className="text-xs text-default-400 font-mono hidden sm:block">
          {log.timestamp}
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────── section card ─────────────────────────── */

function SectionCard({
  icon: Icon,
  iconClass,
  title,
  subtitle,
  action,
  children,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  iconClass: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-default-200/80 dark:border-default-100/12 bg-content1 overflow-hidden shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-default-100/60 dark:border-default-100/8">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClass}`}>
          <Icon size={16} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-default-900 dark:text-default-100 tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-default-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      <div className="flex-1 px-6 py-5">{children}</div>
    </div>
  );
}

/* ─────────────────────────── live badge ─────────────────────────── */

function LiveBadge() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-success/30 bg-success/10">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
      </span>
      <span className="text-[11px] font-medium text-success">Live</span>
    </div>
  );
}

/* ─────────────────────────── main ─────────────────────────── */

const ACTIONS = [
  "AUTHENTICATION",
  "UPLINK_SYNC",
  "NODE_DISCOVERY",
  "DATA_RELAY",
  "IAM_VALIDATION",
];

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAnalytics();
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => {
      const newLog: LogEntry = {
        id: Date.now(),
        action: ACTIONS[Math.floor(Math.random() * ACTIONS.length)],
        node: `NODE_${Math.floor(Math.random() * 900) + 100}`,
        timestamp: new Date().toLocaleTimeString(),
        status: Math.random() > 0.1 ? "SUCCESS" : "INTERCEPTED",
      };
      setLogs((prev) => [newLog, ...prev].slice(0, 10));
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const activityData = stats?.activity_by_type || {};
  const currentStats = stats?.current_stats || {};
  const totalActivity = Object.values(activityData).reduce(
    (a: number, b: unknown) => a + (b as number),
    0
  ) as number;

  const statCards = [
    {
      title: "Total users",
      value: currentStats.total_users ?? 0,
      subtitle: "+14% this month",
      icon: Users,
      color: "primary" as StatColor,
    },
    {
      title: "Total devices",
      value: currentStats.total_devices ?? 0,
      subtitle: "92% avg load",
      icon: Cpu,
      color: "default" as StatColor,
    },
    {
      title: "Online devices",
      value: currentStats.online_devices ?? 0,
      subtitle: "Stable connection",
      icon: Wifi,
      color: "success" as StatColor,
    },
    {
      title: "Offline devices",
      value: currentStats.offline_devices ?? 0,
      subtitle: "Requires attention",
      icon: WifiOff,
      color: "danger" as StatColor,
    },
  ];

  return (
    <div className="max-w-7xl space-y-6 pb-12 animate-in fade-in duration-500">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/25">
            <LayoutDashboard size={22} strokeWidth={2} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-0.5">
              Admin
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold font-heading text-default-900 dark:text-default-50 tracking-tight">
              Dashboard
            </h1>
          </div>
        </div>
        <Button
          variant="bordered"
          radius="lg"
          className="font-medium border-default-300/80 self-start sm:self-auto"
          startContent={
            <RefreshCw
              size={15}
              strokeWidth={2}
              className={loading ? "animate-spin" : ""}
            />
          }
          onPress={fetchStats}
          isDisabled={loading}
        >
          Refresh
        </Button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} loading={loading} />
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Activity distribution */}
        <div className="lg:col-span-5">
          <SectionCard
            icon={Globe}
            iconClass="bg-primary/10 text-primary"
            title="Activity by type"
            subtitle="Protocol distribution across all nodes"
          >
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-28 rounded" />
                      <Skeleton className="h-4 w-10 rounded" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                    <Skeleton className="h-3 w-20 rounded" />
                  </div>
                ))}
              </div>
            ) : Object.keys(activityData).length === 0 ? (
              <p className="text-sm text-default-400 py-4">No activity data available.</p>
            ) : (
              <div className="space-y-6">
                {Object.entries(activityData).map(([type, count], i) => (
                  <ActivityBar
                    key={type}
                    label={type}
                    count={count as number}
                    total={totalActivity}
                    index={i}
                  />
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Event stream */}
        <div className="lg:col-span-7">
          <SectionCard
            icon={Activity}
            iconClass="bg-sky-500/10 text-sky-600 dark:text-sky-400"
            title="Event stream"
            subtitle="Real-time infrastructure pulse"
            action={<LiveBadge />}
          >
            {logs.length === 0 ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <div>
                {logs.map((log) => (
                  <LogRow key={log.id} log={log} />
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;