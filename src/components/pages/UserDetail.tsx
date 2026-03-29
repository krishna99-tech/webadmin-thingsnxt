"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminApi } from "@/lib/api";
import {
  Button,
  Chip,
  Skeleton,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Divider,
} from "@heroui/react";
import {
  ArrowLeft,
  Shield,
  Ban,
  Cpu,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  User as UserIcon,
  Activity,
  Calendar,
  Hash,
  Lock,
  ShieldCheck,
  Fingerprint,
  ShieldAlert,
  Signal,
  Key,
  PlugZap,
  History,
  Mail,
  Clock,
  RefreshCw,
  Edit2,
  Copy,
  ExternalLink,
  BadgeCheck,
  Zap,
  Settings,
  Radio,
} from "lucide-react";

/* ─────────────────────────── helpers ─────────────────────────── */

function safeText(val: unknown): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  return String(val);
}

function fmtDate(val: string | null | undefined) {
  if (!val) return "—";
  return new Date(val).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function fmtTime(val: string | null | undefined) {
  if (!val) return "—";
  return new Date(val).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

/* ─────────────────────────── avatar ─────────────────────────── */

function UserAvatar({
  name,
  email,
  isActive,
  size = "lg",
}: {
  name: string;
  email?: string;
  isActive?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  // Deterministic hue from name
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;

  const sizes = {
    sm: { outer: "h-10 w-10", text: "text-sm", ring: "ring-2" },
    md: { outer: "h-16 w-16", text: "text-xl", ring: "ring-2" },
    lg: { outer: "h-24 w-24", text: "text-3xl", ring: "ring-4" },
  };
  const s = sizes[size];

  return (
    <div className="relative shrink-0">
      <div
        className={`${s.outer} rounded-2xl flex items-center justify-center font-semibold text-white ${s.ring} ring-white dark:ring-content1 select-none`}
        style={{ background: `hsl(${hue},55%,52%)` }}
      >
        {initials || <UserIcon size={size === "lg" ? 32 : 18} strokeWidth={2} />}
      </div>
      {isActive !== undefined && (
        <span
          className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-content1 ${
            isActive ? "bg-success" : "bg-danger"
          }`}
        />
      )}
    </div>
  );
}

/* ─────────────────────────── info row ─────────────────────────── */

function InfoRow({
  icon: Icon,
  label,
  value,
  mono = false,
  copyable = false,
  muted = false,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
  copyable?: boolean;
  muted?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="group flex flex-col gap-1.5 border-b border-default-100/60 py-2.5 last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
      <div className="flex min-w-0 items-center gap-2.5 shrink-0 sm:max-w-[45%]">
        <Icon size={14} strokeWidth={2} className="shrink-0 text-default-400" />
        <span className="shrink-0 text-xs text-default-500">{label}</span>
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:justify-end">
        <span
          className={`min-w-0 text-xs break-words sm:text-right ${
            mono ? "font-mono" : ""
          } ${muted ? "text-default-400" : "text-default-800 dark:text-default-200"}`}
        >
          {value}
        </span>
        {copyable && (
          <button
            onClick={() => {
              copyToClipboard(value);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-default-400 hover:text-default-700"
          >
            {copied ? (
              <CheckCircle2 size={12} className="text-success" />
            ) : (
              <Copy size={12} />
            )}
          </button>
        )}
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
  className = "",
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  iconClass: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-default-200/80 dark:border-default-100/12 bg-content1 overflow-hidden shadow-sm flex flex-col ${className}`}
    >
      <div className="flex items-center gap-3 px-5 py-4 border-b border-default-100/60 dark:border-default-100/8 shrink-0">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClass}`}
        >
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
      <div className="flex-1 p-5">{children}</div>
    </div>
  );
}

/* ─────────────────────────── tab button ─────────────────────────── */

function TabButton({
  active,
  icon: Icon,
  label,
  badge,
  onClick,
}: {
  active: boolean;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-default-500 hover:text-default-800 dark:hover:text-default-200"
      }`}
    >
      <Icon size={14} strokeWidth={2} />
      {label}
      {badge !== undefined && badge > 0 && (
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
            active
              ? "bg-primary/15 text-primary"
              : "bg-default-200 text-default-500"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

/* ─────────────────────────── security check row ─────────────────────────── */

function SecurityCheck({
  icon: Icon,
  label,
  value,
  status,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  value: string;
  status: "success" | "warning" | "danger" | "primary" | "default";
}) {
  return (
    <div className="flex items-center justify-between p-3.5 rounded-xl border border-default-200/70 dark:border-default-100/10 bg-default-50/40 dark:bg-default-100/[0.03]">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-default-100 dark:bg-default-100/10">
          <Icon size={14} strokeWidth={2} className="text-default-500" />
        </div>
        <span className="text-sm text-default-700 dark:text-default-300">{label}</span>
      </div>
      <Chip size="sm" color={status} variant="flat" className="text-[11px]">
        {value}
      </Chip>
    </div>
  );
}

/* ─────────────────────────── main ─────────────────────────── */

type TabId = "devices" | "activity" | "security";

const UserDetail = () => {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("devices");

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [editData, setEditData] = useState({ full_name: "", email: "" });

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.getUser(id);
      setUserData(response.data);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }, [id]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleUpdateField = async (field: string, value: unknown) => {
    setUpdating(true);
    try {
      await adminApi.updateUser(id, { [field]: value });
      await fetchUserData();
    } catch (error) {
      console.error(`${field} update failed:`, error);
    } finally {
      setUpdating(false);
    }
  };

  /* ── loading state ── */
  if (loading) {
    return (
      <div className="admin-page w-full min-w-0 max-w-7xl space-y-6 pb-12">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-8 w-48 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="min-w-0 space-y-4 lg:col-span-4">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
          <div className="lg:col-span-8">
            <Skeleton className="h-[540px] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  /* ── not found ── */
  if (!userData) {
    return (
      <div className="admin-page flex w-full min-w-0 max-w-7xl items-center justify-center py-24">
        <div className="text-center max-w-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-danger/10 text-danger mx-auto mb-5">
            <AlertCircle size={28} strokeWidth={2} />
          </div>
          <h2 className="text-xl font-semibold text-default-900 dark:text-default-100 mb-2">
            User not found
          </h2>
          <p className="text-sm text-default-500 mb-6">
            This user record does not exist or has been removed.
          </p>
          <Button
            color="primary"
            radius="lg"
            onPress={() => router.push("/users")}
            startContent={<ArrowLeft size={15} />}
          >
            Back to users
          </Button>
        </div>
      </div>
    );
  }

  const roleString = safeText(userData.role);
  const accessRight = safeText(userData.access_right || "Standard");
  const isActive = userData.is_active !== false;
  const displayName = safeText(userData.full_name || userData.username);
  const devices: any[] = userData.devices || [];
  const activity: any[] = userData.recent_activity || [];

  const accessColor: Record<string, "default" | "primary" | "secondary" | "warning"> = {
    Standard: "default",
    Elevated: "primary",
    Supreme: "secondary",
  };

  return (
    <div className="admin-page w-full min-w-0 max-w-7xl space-y-6 pb-12 animate-in fade-in duration-500">

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            variant="bordered"
            radius="lg"
            className="border-default-300/80 h-9 w-9 min-w-9"
            onPress={() => router.push("/users")}
          >
            <ArrowLeft size={15} strokeWidth={2} />
          </Button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-0.5">
              Users
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold font-heading text-default-900 dark:text-default-50 tracking-tight leading-none">
              User profile
            </h1>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            variant="bordered"
            radius="lg"
            size="sm"
            className="border-default-300/80 font-medium"
            startContent={<RefreshCw size={13} strokeWidth={2} className={updating ? "animate-spin" : ""} />}
            onPress={fetchUserData}
            isDisabled={loading || updating}
          >
            Refresh
          </Button>
          <Button
            variant="bordered"
            radius="lg"
            size="sm"
            className="border-danger/40 font-medium text-danger"
            startContent={<Key size={13} strokeWidth={2} />}
          >
            Reset password
          </Button>
          <Button
            color="primary"
            radius="lg"
            size="sm"
            className="font-medium shadow-md shadow-primary/25"
            startContent={<Edit2 size={13} strokeWidth={2} />}
            onPress={() => {
              setEditData({
                full_name: userData.full_name || "",
                email: userData.email || "",
              });
              onOpen();
            }}
          >
            Edit profile
          </Button>
        </div>
      </div>

      {/* Related admin areas */}
      <div
        className="flex flex-wrap items-center gap-2 rounded-2xl border border-default-200/70 bg-content1/90 px-4 py-3 dark:border-default-100/10"
        role="navigation"
        aria-label="Related admin areas"
      >
        <span className="w-full text-[11px] font-semibold uppercase tracking-wider text-default-400 sm:mr-1 sm:w-auto">
          Console
        </span>
        <Button
          size="sm"
          variant="flat"
          radius="lg"
          className="font-medium"
          startContent={<History size={14} strokeWidth={2} />}
          onPress={() => router.push("/logs")}
        >
          Audit log
        </Button>
        <Button
          size="sm"
          variant="flat"
          radius="lg"
          className="font-medium"
          startContent={<ShieldAlert size={14} strokeWidth={2} />}
          onPress={() => router.push("/security")}
        >
          Security
        </Button>
        <Button
          size="sm"
          variant="flat"
          radius="lg"
          className="font-medium"
          startContent={<Radio size={14} strokeWidth={2} />}
          onPress={() => router.push("/broadcast")}
        >
          Broadcast
        </Button>
        <Button
          size="sm"
          variant="flat"
          radius="lg"
          className="font-medium"
          startContent={<Mail size={14} strokeWidth={2} />}
          onPress={() => router.push("/email")}
        >
          Email
        </Button>
        <Button
          size="sm"
          variant="flat"
          radius="lg"
          className="font-medium"
          startContent={<Settings size={14} strokeWidth={2} />}
          onPress={() => router.push("/settings")}
        >
          Platform
        </Button>
      </div>

      {/* ── Body ── */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">

        {/* ── LEFT SIDEBAR ── */}
        <div className="min-w-0 space-y-4 lg:col-span-4">

          {/* Identity card */}
          <div className="rounded-2xl border border-default-200/80 dark:border-default-100/12 bg-content1 shadow-sm overflow-hidden">
            {/* Banner strip */}
            <div
              className="h-20 w-full"
              style={{
                background: `hsl(${
                  Math.abs(
                    [...displayName].reduce(
                      (h, c) => c.charCodeAt(0) + ((h << 5) - h),
                      0
                    )
                  ) % 360
                },40%,88%)`,
              }}
            />
            <div className="px-5 pb-5">
              {/* Avatar overlapping banner */}
              <div className="-mt-12 mb-4 flex items-end justify-between">
                <UserAvatar
                  name={displayName}
                  email={userData.email}
                  isActive={isActive}
                  size="lg"
                />
                <div className="flex gap-1.5 mb-1">
                  <Chip
                    size="sm"
                    color={isActive ? "success" : "danger"}
                    variant="flat"
                    className="text-[11px]"
                  >
                    {isActive ? "Active" : "Suspended"}
                  </Chip>
                </div>
              </div>

              <div className="mb-1 flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-semibold text-default-900 dark:text-default-100 tracking-tight leading-tight">
                  {displayName}
                </h2>
                {roleString === "Admin" && (
                  <BadgeCheck size={16} className="text-primary shrink-0" strokeWidth={2} />
                )}
              </div>
              <p className="text-sm text-default-500 mb-4 break-all">{safeText(userData.email)}</p>

              <div className="flex flex-wrap gap-1.5 mb-5">
                <Chip
                  size="sm"
                  color={roleString === "Admin" ? "secondary" : "default"}
                  variant="flat"
                  startContent={<Shield size={11} className="ml-1" strokeWidth={2} />}
                  className="text-[11px]"
                >
                  {roleString}
                </Chip>
                <Chip
                  size="sm"
                  color={accessColor[accessRight] ?? "default"}
                  variant="flat"
                  startContent={<Zap size={11} className="ml-1" strokeWidth={2} />}
                  className="text-[11px]"
                >
                  {accessRight}
                </Chip>
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="flat"
                  radius="lg"
                  className="font-medium text-xs"
                  startContent={<Mail size={13} strokeWidth={2} />}
                  onPress={() => window.open(`mailto:${safeText(userData.email)}`)}
                >
                  Send email
                </Button>
                <Button
                  size="sm"
                  variant="flat"
                  radius="lg"
                  className="font-medium text-xs"
                  startContent={<ExternalLink size={13} strokeWidth={2} />}
                  onPress={() => router.push(`/devices?user=${id}`)}
                >
                  View devices
                </Button>
              </div>
            </div>
          </div>

          {/* Account info */}
          <SectionCard
            icon={UserIcon}
            iconClass="bg-primary/10 text-primary"
            title="Account info"
          >
            <InfoRow icon={Mail} label="Email" value={safeText(userData.email)} copyable />
            <InfoRow
              icon={Hash}
              label="User ID"
              value={safeText(userData.id)}
              mono
              copyable
              muted
            />
            <InfoRow icon={Calendar} label="Joined" value={fmtDate(userData.created_at)} />
            <InfoRow
              icon={Clock}
              label="Last login"
              value={fmtTime(userData.last_login)}
              muted={!userData.last_login}
            />
            <InfoRow
              icon={Activity}
              label="Events"
              value={activity.length > 0 ? `${activity.length} recorded` : "None"}
              muted={activity.length === 0}
            />
            <InfoRow
              icon={Cpu}
              label="Devices"
              value={devices.length > 0 ? `${devices.length} linked` : "None"}
              muted={devices.length === 0}
            />
          </SectionCard>

          {/* Access control */}
          <SectionCard
            icon={ShieldCheck}
            iconClass="bg-secondary/10 text-secondary"
            title="Access control"
            subtitle="Changes are applied immediately"
          >
            <div className="space-y-4">
              <Select
                label="Role"
                variant="bordered"
                radius="lg"
                size="sm"
                selectedKeys={[roleString]}
                isDisabled={updating}
                onSelectionChange={(keys) =>
                  handleUpdateField("role", Array.from(keys)[0])
                }
                classNames={{
                  trigger:
                    "bg-default-50 dark:bg-default-100/10 border-default-200 dark:border-default-100/15",
                  label: "text-xs text-default-500",
                }}
              >
                <SelectItem key="User" startContent={<UserIcon size={14} strokeWidth={2} />}>
                  User
                </SelectItem>
                <SelectItem key="Admin" startContent={<ShieldCheck size={14} strokeWidth={2} />}>
                  Admin
                </SelectItem>
              </Select>

              <Select
                label="Access level"
                variant="bordered"
                radius="lg"
                size="sm"
                selectedKeys={[accessRight]}
                isDisabled={updating}
                onSelectionChange={(keys) =>
                  handleUpdateField("access_right", Array.from(keys)[0])
                }
                classNames={{
                  trigger:
                    "bg-default-50 dark:bg-default-100/10 border-default-200 dark:border-default-100/15",
                  label: "text-xs text-default-500",
                }}
              >
                <SelectItem key="Standard" startContent={<Zap size={14} strokeWidth={2} />}>
                  Standard
                </SelectItem>
                <SelectItem
                  key="Elevated"
                  startContent={<Fingerprint size={14} strokeWidth={2} />}
                >
                  Elevated
                </SelectItem>
                <SelectItem
                  key="Supreme"
                  startContent={<ShieldAlert size={14} strokeWidth={2} />}
                >
                  Supreme
                </SelectItem>
              </Select>

              <Select
                label="Status"
                variant="bordered"
                radius="lg"
                size="sm"
                selectedKeys={[isActive ? "active" : "suspended"]}
                isDisabled={updating}
                onSelectionChange={(keys) =>
                  handleUpdateField("is_active", Array.from(keys)[0] === "active")
                }
                classNames={{
                  trigger:
                    "bg-default-50 dark:bg-default-100/10 border-default-200 dark:border-default-100/15",
                  label: "text-xs text-default-500",
                }}
              >
                <SelectItem
                  key="active"
                  startContent={<CheckCircle2 size={14} strokeWidth={2} className="text-success" />}
                >
                  Active
                </SelectItem>
                <SelectItem
                  key="suspended"
                  startContent={<Ban size={14} strokeWidth={2} className="text-danger" />}
                >
                  Suspended
                </SelectItem>
              </Select>

              {/* Escalate shortcut */}
              {accessRight !== "Supreme" && (
                <Button
                  size="sm"
                  variant="flat"
                  color="secondary"
                  radius="lg"
                  className="w-full font-medium text-xs"
                  startContent={<ShieldAlert size={13} strokeWidth={2} />}
                  isLoading={updating}
                  onPress={() => handleUpdateField("access_right", "Supreme")}
                >
                  Escalate to Supreme
                </Button>
              )}
            </div>
          </SectionCard>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="min-w-0 lg:col-span-8">
          <div className="overflow-hidden rounded-2xl border border-default-200/80 bg-content1 shadow-sm dark:border-default-100/12">

            {/* Tab nav */}
            <div className="flex gap-1 overflow-x-auto border-b border-default-200/60 px-5 dark:border-default-100/10 scrollbar-hide">
              <TabButton
                active={activeTab === "devices"}
                icon={Cpu}
                label="Devices"
                badge={devices.length}
                onClick={() => setActiveTab("devices")}
              />
              <TabButton
                active={activeTab === "activity"}
                icon={History}
                label="Activity"
                badge={activity.length}
                onClick={() => setActiveTab("activity")}
              />
              <TabButton
                active={activeTab === "security"}
                icon={Lock}
                label="Security"
                onClick={() => setActiveTab("security")}
              />
            </div>

            {/* ── DEVICES TAB ── */}
            {activeTab === "devices" && (
              <div className="p-5">
                <Table
                  aria-label="User devices"
                  shadow="none"
                  removeWrapper
                  classNames={{
                    th: "bg-transparent text-xs font-semibold text-default-500 border-b border-default-100/60 dark:border-default-100/8 pb-3",
                    td: "py-3.5 text-sm border-b border-default-100/40 dark:border-default-100/6 last:border-0",
                  }}
                >
                  <TableHeader>
                    <TableColumn>Device</TableColumn>
                    <TableColumn>Type</TableColumn>
                    <TableColumn>Status</TableColumn>
                    <TableColumn>Last seen</TableColumn>
                    <TableColumn className="text-right">Action</TableColumn>
                  </TableHeader>
                  <TableBody
                    emptyContent={
                      <div className="py-16 flex flex-col items-center gap-3 text-default-400">
                        <PlugZap size={32} strokeWidth={1.5} />
                        <p className="text-sm">No devices linked to this account.</p>
                      </div>
                    }
                  >
                    {devices.map((device) => (
                      <TableRow key={device.id} className="group hover:bg-default-50/60 dark:hover:bg-default-100/[0.04] transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-default-100 dark:bg-default-100/10 text-default-500 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                              <HardDrive size={15} strokeWidth={2} />
                            </div>
                            <span className="font-medium text-default-800 dark:text-default-200">
                              {safeText(device.name)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-default-500 capitalize text-xs">
                            {safeText(device.type || "IoT node")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="sm"
                            color={device.status === "online" ? "success" : "danger"}
                            variant="dot"
                            className="text-xs capitalize"
                          >
                            {safeText(device.status)}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-default-400 font-mono">
                            {fmtTime(device.last_seen)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            radius="lg"
                            className="text-default-500 hover:text-primary"
                            onPress={() => router.push("/devices")}
                          >
                            <Signal size={13} strokeWidth={2} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* ── ACTIVITY TAB ── */}
            {activeTab === "activity" && (
              <div className="p-5">
                {activity.length === 0 ? (
                  <div className="py-16 flex flex-col items-center gap-3 text-default-400">
                    <History size={32} strokeWidth={1.5} />
                    <p className="text-sm">No activity recorded yet.</p>
                  </div>
                ) : (
                  <div>
                    {activity.map((log, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-4 py-3.5 border-b border-default-100/60 dark:border-default-100/8 last:border-0 group"
                      >
                        {/* Timeline dot */}
                        <div className="flex flex-col items-center pt-1 shrink-0">
                          <div className="h-7 w-7 rounded-lg bg-default-100 dark:bg-default-100/10 flex items-center justify-center text-default-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                            <Activity size={13} strokeWidth={2} />
                          </div>
                          {i < activity.length - 1 && (
                            <div className="w-px h-full mt-2 bg-default-100 dark:bg-default-100/8" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pb-0.5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-default-800 dark:text-default-200 capitalize leading-snug">
                                {safeText(log.action?.replace(/_/g, " ")).toLowerCase()}
                              </p>
                              {log.subject && (
                                <p className="text-xs text-default-400 mt-0.5">
                                  {safeText(log.subject)}
                                </p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs text-default-400 font-mono whitespace-nowrap">
                                {fmtTime(log.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── SECURITY TAB ── */}
            {activeTab === "security" && (
              <div className="p-5 space-y-6">
                {/* Security score */}
                <div className="rounded-xl border border-default-200/70 dark:border-default-100/10 bg-default-50/40 dark:bg-default-100/[0.03] p-4 flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-success/10">
                    <ShieldCheck size={24} strokeWidth={2} className="text-success" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-default-900 dark:text-default-100">
                      Security status
                    </p>
                    <p className="text-xs text-default-500 mt-0.5">
                      All compliance checks passed for this account.
                    </p>
                  </div>
                  <Chip size="sm" color="success" variant="flat">
                    Compliant
                  </Chip>
                </div>

                {/* Checks */}
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-3">
                    IAM checks
                  </p>
                  <SecurityCheck icon={Fingerprint} label="Biometric identity" value="Verified" status="success" />
                  <SecurityCheck icon={Lock} label="MFA / 2FA" value="Enabled" status="success" />
                  <SecurityCheck icon={History} label="Session lifecycle" value="Auto-revoke" status="primary" />
                  <SecurityCheck icon={ShieldAlert} label="Hardware lock" value="Active" status="warning" />
                  <SecurityCheck
                    icon={Shield}
                    label="Account status"
                    value={isActive ? "Active" : "Suspended"}
                    status={isActive ? "success" : "danger"}
                  />
                  <SecurityCheck
                    icon={Zap}
                    label="Access level"
                    value={accessRight}
                    status={accessColor[accessRight] ?? "default"}
                  />
                </div>

                <Divider className="my-1" />

                {/* Danger zone */}
                <div>
                  <p className="text-xs font-semibold text-danger uppercase tracking-wider mb-3">
                    Danger zone
                  </p>
                  <div className="rounded-xl border border-danger/20 bg-danger/[0.03] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-default-800 dark:text-default-200">
                        Revoke all sessions
                      </p>
                      <p className="text-xs text-default-500 mt-0.5">
                        Signs the user out from all devices immediately.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      radius="lg"
                      className="font-medium shrink-0"
                      startContent={<Ban size={13} strokeWidth={2} />}
                    >
                      Revoke sessions
                    </Button>
                  </div>

                  <div className="rounded-xl border border-danger/20 bg-danger/[0.03] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
                    <div>
                      <p className="text-sm font-medium text-default-800 dark:text-default-200">
                        Suspend account
                      </p>
                      <p className="text-xs text-default-500 mt-0.5">
                        Immediately blocks login. Data is retained.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      radius="lg"
                      className="font-medium shrink-0"
                      isLoading={updating}
                      isDisabled={!isActive}
                      startContent={<Shield size={13} strokeWidth={2} />}
                      onPress={() => handleUpdateField("is_active", false)}
                    >
                      Suspend
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        radius="2xl"
        classNames={{
          backdrop: "bg-default-900/50 backdrop-blur-sm",
          base: "border border-default-100 bg-content1",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-bold tracking-tight">Edit user identity</h3>
                <p className="text-xs text-default-500 font-normal">Update records for this node.</p>
              </ModalHeader>
              <ModalBody className="space-y-4 py-6">
                <Input
                  isRequired
                  label="Full identity name"
                  labelPlacement="outside"
                  placeholder="John Doe"
                  variant="bordered"
                  value={editData.full_name}
                  onValueChange={(v) => setEditData(prev => ({ ...prev, full_name: v }))}
                  description="The display name for all workspace interactions."
                  classNames={{
                    label: "text-sm font-semibold mb-1.5 block",
                    inputWrapper: "h-12 border-default-200 focus-within:!border-primary rounded-xl",
                  }}
                />

                <Input
                  isRequired
                  type="email"
                  label="Authorization email"
                  labelPlacement="outside"
                  placeholder="admin@thingsnxt.com"
                  variant="bordered"
                  value={editData.email}
                  onValueChange={(v) => setEditData(prev => ({ ...prev, email: v }))}
                  description="Used for session recovery and terminal alerts."
                  classNames={{
                    label: "text-sm font-semibold mb-1.5 block",
                    inputWrapper: "h-12 border-default-200 focus-within:!border-primary rounded-xl",
                  }}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" radius="lg" onPress={onClose}>
                  Cancel
                </Button>
                <Button 
                  color="primary" 
                  radius="lg" 
                  className="font-semibold"
                  isLoading={updating}
                  onPress={async () => {
                    setUpdating(true);
                    try {
                      await adminApi.updateUser(id, editData);
                      await fetchUserData();
                      onClose();
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setUpdating(false);
                    }
                  }}
                >
                  Save changes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default UserDetail;