// @ts-nocheck
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { adminApi, systemApi } from "@/lib/api";
import {
  Button,
  Input,
  Switch,
  Card,
  CardHeader,
  CardBody,
  Textarea,
  Divider,
  Chip,
  Skeleton,
} from "@heroui/react";
import { toast } from "sonner";
import { Power, Check, Moon, Sun, BellSlash, BellFill, Microphone, MicrophoneSlash, VolumeFill, VolumeSlashFill } from "@gravity-ui/icons";
import {
  Settings2,
  Save,
  RefreshCw,
  Smartphone,
  Palette,
  Mail,
  Code2,
  AlertTriangle,
  Flag,
  Globe,
  Eye,
  Search,
  Copy,
  CheckCircle2,
  Link2,
} from "lucide-react";
import { inputComfortableClasses } from "@/lib/ui-presets";

/* ─────────────────────────── helpers ─────────────────────────── */

function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function isValidEmail(v: string) {
  return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function isValidUrl(v: string) {
  try {
    if (!v) return true;
    new URL(v);
    return true;
  } catch {
    return false;
  }
}

function CharCount({ value, max }: { value: string; max: number }) {
  const len = value?.length ?? 0;
  const warn = len > max * 0.9;
  return (
    <p className={`text-right text-[11px] mt-1 ${warn ? "text-warning-500" : "text-default-400"}`}>
      {len} / {max}
    </p>
  );
}

/* ─────────────────────────── tab nav ─────────────────────────── */

const TABS = [
  { id: "branding", label: "Branding", icon: Palette },
  { id: "mobile", label: "Mobile app", icon: Smartphone },
  { id: "email", label: "Email", icon: Mail },
  { id: "preview", label: "Config preview", icon: Code2 },
] as const;

type TabId = (typeof TABS)[number]["id"];

function TabNav({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (id: TabId) => void;
}) {
  return (
    <div className="flex gap-1 border-b border-default-200/60 dark:border-default-100/10 mb-8">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            active === id
              ? "border-primary text-primary"
              : "border-transparent text-default-500 hover:text-default-800 dark:hover:text-default-200"
          }`}
        >
          <Icon size={14} strokeWidth={2} />
          {label}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────── section card ─────────────────────── */

function SectionCard({
  icon: Icon,
  iconClass,
  title,
  subtitle,
  children,
  className = "",
}: {
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  iconClass: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={`rounded-2xl border border-default-200/80 dark:border-default-100/12 shadow-sm bg-content1 overflow-hidden ${className}`}
      shadow="none"
    >
      <CardHeader className="flex gap-4 pb-4 pt-6 px-6 sm:px-8 border-b border-default-200/50 dark:border-default-100/10">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
          <Icon size={20} strokeWidth={2} />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <h2 className="text-base font-semibold font-heading text-default-900 dark:text-default-100 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-default-500 leading-snug">{subtitle}</p>
          )}
        </div>
      </CardHeader>
      <CardBody className="gap-5 pt-5 px-6 sm:px-8 pb-7">{children}</CardBody>
    </Card>
  );
}

/* ─────────────────────────── flag rows ─────────────────────────── */

const ALL_FLAGS = [
  {
    key: "connected_apps",
    title: "Connected apps UI",
    desc: "Show integrations hub and third-party connections in the mobile app.",
  },
  {
    key: "webhooks",
    title: "Webhooks",
    desc: "Expose webhook-related surfaces where the client supports them.",
  },
  {
    key: "kafka_pipeline_card",
    title: "Kafka pipeline card",
    desc: "Show pipeline status inside Connected apps when enabled.",
  },
  {
    key: "push_notifications",
    title: "Push notifications",
    desc: "Allow the app to register and receive push notification tokens.",
  },
  {
    key: "biometric_auth",
    title: "Biometric auth",
    desc: "Enable Face ID / fingerprint login on supported devices.",
  },
  {
    key: "offline_mode",
    title: "Offline mode",
    desc: "Cache data locally so the app is usable without a network connection.",
  },
];

/* ─────────────────────────── sidebar ─────────────────────────── */

function BrandingPreviewCard({ branding }: { branding: Record<string, string> }) {
  return (
    <Card
      className="rounded-2xl border border-default-200/80 dark:border-default-100/12 bg-content1 overflow-hidden"
      shadow="none"
    >
      <CardHeader className="flex gap-3 pb-3 pt-5 px-5 border-b border-default-200/50 dark:border-default-100/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-default-100 dark:bg-default-100/10">
          <Eye size={15} className="text-default-500" strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-sm font-semibold font-heading text-default-900 dark:text-default-100">
            Live preview
          </h3>
          <p className="text-xs text-default-500 mt-0.5">Updates as you type</p>
        </div>
      </CardHeader>
      <CardBody className="p-5 gap-4">
        <div className="border-b border-default-100 dark:border-default-100/10 pb-4">
          <p className="text-lg font-semibold text-default-900 dark:text-default-50">
            {branding.app_display_name || "ThingsNXT"}
          </p>
          <p className="text-sm text-default-500">{branding.company_name || "Your company"}</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          {[
            { label: "Support", value: branding.support_email },
            { label: "URL", value: branding.frontend_url },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-default-500 text-xs">{label}</span>
              <span className="text-primary text-xs truncate max-w-[180px]">
                {value || "—"}
              </span>
            </div>
          ))}
        </div>
        {branding.copyright_text && (
          <p className="text-[11px] text-default-400 border-t border-default-100 dark:border-default-100/10 pt-3">
            {branding.copyright_text}
          </p>
        )}
      </CardBody>
    </Card>
  );
}

function MobileStatusCard({
  mobileApp,
  flags,
}: {
  mobileApp: Record<string, any>;
  flags: Record<string, boolean>;
}) {
  const activeFlags = ALL_FLAGS.filter((f) => flags[f.key] !== false);
  return (
    <Card
      className="rounded-2xl border border-default-200/80 dark:border-default-100/12 bg-content1 overflow-hidden"
      shadow="none"
    >
      <CardHeader className="flex gap-3 pb-3 pt-5 px-5 border-b border-default-200/50 dark:border-default-100/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-default-100 dark:bg-default-100/10">
          <Smartphone size={15} className="text-default-500" strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-sm font-semibold font-heading text-default-900 dark:text-default-100">
            Status summary
          </h3>
          <p className="text-xs text-default-500 mt-0.5">Current mobile config</p>
        </div>
      </CardHeader>
      <CardBody className="p-5 gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-default-500">Maintenance</span>
            <Chip
              size="sm"
              color={mobileApp.maintenance_mode ? "warning" : "default"}
              variant="flat"
            >
              {mobileApp.maintenance_mode ? "On" : "Off"}
            </Chip>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-default-500">Full-screen block</span>
            <Chip
              size="sm"
              color={mobileApp.maintenance_blocking ? "danger" : "default"}
              variant="flat"
            >
              {mobileApp.maintenance_blocking ? "On" : "Off"}
            </Chip>
          </div>
          {mobileApp.min_app_version && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-default-500">Min version</span>
              <Chip size="sm" variant="flat" className="font-mono text-[11px]">
                {mobileApp.min_app_version}
              </Chip>
            </div>
          )}
        </div>
        <Divider />
        <div>
          <p className="text-xs font-semibold text-default-500 mb-2">
            Active flags ({activeFlags.length}/{ALL_FLAGS.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {activeFlags.map((f) => (
              <Chip key={f.key} size="sm" color="success" variant="flat">
                {f.title}
              </Chip>
            ))}
            {activeFlags.length === 0 && (
              <p className="text-xs text-default-400">All flags off</p>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function EmailPreviewCard({
  emailCopy,
  branding,
}: {
  emailCopy: Record<string, string>;
  branding: Record<string, string>;
}) {
  return (
    <Card
      className="rounded-2xl border border-default-200/80 dark:border-default-100/12 bg-content1 overflow-hidden"
      shadow="none"
    >
      <CardHeader className="flex gap-3 pb-3 pt-5 px-5 border-b border-default-200/50 dark:border-default-100/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-default-100 dark:bg-default-100/10">
          <Eye size={15} className="text-default-500" strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-sm font-semibold font-heading text-default-900 dark:text-default-100">
            Email preview
          </h3>
          <p className="text-xs text-default-500 mt-0.5">Sample welcome email</p>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        <div className="px-5 py-3 border-b border-default-100 dark:border-default-100/10 text-xs text-default-500 flex flex-col gap-1.5">
          <div className="flex gap-2">
            <span>From:</span>
            <span className="text-default-700 dark:text-default-300">
              {branding.app_display_name || "ThingsNXT"}{" "}
              &lt;{branding.support_email || "support@example.com"}&gt;
            </span>
          </div>
          <div className="flex gap-2">
            <span>Subject:</span>
            <span className="text-default-700 dark:text-default-300">
              Welcome to {branding.app_display_name || "ThingsNXT"}
            </span>
          </div>
        </div>
        <div className="px-5 py-4 text-sm text-default-700 dark:text-default-300 leading-relaxed flex flex-col gap-3">
          <p>Hi there,</p>
          <p>Your account is ready. Sign in at any time.</p>
          {emailCopy.welcome_footer_note && (
            <p className="text-default-500 text-xs">{emailCopy.welcome_footer_note}</p>
          )}
          {emailCopy.alert_signature && (
            <p className="text-xs text-default-400">{emailCopy.alert_signature}</p>
          )}
        </div>
        {emailCopy.unsubscribe_note && (
          <div className="px-5 py-2.5 border-t border-default-100 dark:border-default-100/10 text-[11px] text-default-400">
            {emailCopy.unsubscribe_note}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

/* ─────────────────────────── main component ─────────────────────── */

const PlatformSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("branding");
  const [dirty, setDirty] = useState(false);
  const [copied, setCopied] = useState(false);
  const [flagSearch, setFlagSearch] = useState("");

  const [branding, setBranding] = useState<Record<string, string>>({});
  const [mobileApp, setMobileApp] = useState<Record<string, any>>({});
  const [emailCopy, setEmailCopy] = useState<Record<string, string>>({});
  const [publicPreview, setPublicPreview] = useState<any>(null);

  /* validation */
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    if (!branding.app_display_name?.trim()) e.app_display_name = "App name is required.";
    if (!isValidEmail(branding.support_email)) e.support_email = "Enter a valid email.";
    if (!isValidUrl(branding.frontend_url)) e.frontend_url = "Enter a valid URL (https://…).";
    if (!isValidUrl(branding.privacy_url)) e.privacy_url = "Enter a valid URL.";
    if (!isValidUrl(branding.terms_url)) e.terms_url = "Enter a valid URL.";
    if (!isValidUrl(branding.status_url)) e.status_url = "Enter a valid URL.";
    if (!isValidUrl(branding.docs_url)) e.docs_url = "Enter a valid URL.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [branding]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [adminRes, pubRes] = await Promise.all([
        adminApi.getPlatformSettings(),
        systemApi.getPublicAppConfig(),
      ]);
      const doc = adminRes.data;
      setBranding(doc.branding || {});
      setMobileApp(doc.mobile_app || {});
      setEmailCopy(doc.email_copy || {});
      setPublicPreview(pubRes.data);
      setDirty(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!validate()) {
      setActiveTab("branding");
      toast.error('Identity validation failure: Branding parameters must be correct.');
      return;
    }

    const savePromise = (async () => {
      await adminApi.updatePlatformSettings({
        branding,
        mobile_app: mobileApp,
        email_copy: emailCopy,
      });
      const pubRes = await systemApi.getPublicAppConfig();
      setPublicPreview(pubRes.data);
      setDirty(false);
    })();

    toast.promise(savePromise, {
      loading: "Committing platform configuration to secure vault...",
      success: "Platform parameters successfully synchronized.",
      error: (err: any) => err.response?.data?.detail || "Commit failure: System busy.",
    });
  };

  const flags = mobileApp.feature_flags || {};

  const setFlag = (key: string, value: boolean) => {
    setMobileApp((prev: any) => ({
      ...prev,
      feature_flags: { ...(prev.feature_flags || {}), [key]: value },
    }));
    setDirty(true);
  };

  const setBrandingField = (key: string, value: string) => {
    setBranding((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const setMobileField = (key: string, value: any) => {
    setMobileApp((prev: any) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const setEmailField = (key: string, value: string) => {
    setEmailCopy((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(publicPreview, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const inputProps = {
    variant: "bordered" as const,
    radius: "lg" as const,
    size: "lg" as const,
    labelPlacement: "outside" as const,
    classNames: inputComfortableClasses,
  };

  const filteredFlags = ALL_FLAGS.filter(
    (f) =>
      !flagSearch ||
      f.title.toLowerCase().includes(flagSearch.toLowerCase()) ||
      f.desc.toLowerCase().includes(flagSearch.toLowerCase())
  );

  /* ── render ── */
  return (
    <div className="admin-page max-w-7xl space-y-6 pb-12">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-default-200/70 dark:border-default-100/12 bg-gradient-to-br from-primary/[0.07] via-content1 to-secondary/[0.05] px-6 py-7 sm:px-10 sm:py-9">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 min-w-0">
            <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/25">
              <Settings2 size={26} strokeWidth={2} />
            </div>
            <div className="min-w-0 space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Platform</p>
              <h1 className="text-2xl sm:text-3xl font-semibold font-heading text-default-900 dark:text-default-50 tracking-tight">
                Configuration
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-default-600 dark:text-default-400">
                <span>Published to clients via</span>
                <Chip size="sm" variant="flat" className="font-mono text-[11px]">
                  GET /app/config
                </Chip>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button
              variant="bordered"
              radius="lg"
              className="font-medium border-default-300/80"
              startContent={<RefreshCw size={16} />}
              onPress={load}
              isDisabled={loading}
            >
              Reload
            </Button>
            <Button
              color="primary"
              radius="lg"
              className="font-semibold px-6 shadow-md shadow-primary/25"
              startContent={<Save size={16} />}
              onPress={save}
              isLoading={saving}
              isDisabled={loading}
            >
              Save changes
            </Button>
          </div>
        </div>
      </div>

      {/* Unsaved banner */}
      {dirty && !loading && (
        <div className="flex items-center gap-3 rounded-xl border border-warning-300/60 bg-warning-50/80 dark:bg-warning-500/10 dark:border-warning-500/30 px-4 py-3">
          <AlertTriangle size={16} className="text-warning-600 dark:text-warning-400 shrink-0" strokeWidth={2} />
          <p className="flex-1 text-sm text-warning-700 dark:text-warning-300">
            You have unsaved changes.
          </p>
          <Button
            size="sm"
            variant="flat"
            color="warning"
            radius="md"
            onPress={save}
            isLoading={saving}
          >
            Save now
          </Button>
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-6">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
          <div className="lg:col-span-5">
            <Skeleton className="h-72 rounded-2xl" />
          </div>
        </div>
      ) : (
        <>
          <TabNav active={activeTab} onChange={setActiveTab} />

          {/* ── BRANDING TAB ── */}
          {activeTab === "branding" && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
              <div className="space-y-6 xl:col-span-7">
                <SectionCard
                  icon={Palette}
                  iconClass="bg-violet-500/15 text-violet-600 dark:text-violet-400"
                  title="Identity"
                  subtitle="Names and contact info displayed in the app and public config."
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input
                      {...inputProps}
                      isRequired
                      label="App display name"
                      placeholder="ThingsNXT"
                      value={branding.app_display_name || ""}
                      onValueChange={(v) => setBrandingField("app_display_name", v)}
                      isInvalid={!!errors.app_display_name}
                      errorMessage={errors.app_display_name}
                    />

                    <Input
                      {...inputProps}
                      label="Company name"
                      placeholder="Acme Corp"
                      value={branding.company_name || ""}
                      onValueChange={(v) => setBrandingField("company_name", v)}
                    />

                    <Input
                      {...inputProps}
                      label="Support email"
                      placeholder="support@example.com"
                      type="email"
                      value={branding.support_email || ""}
                      onValueChange={(v) => setBrandingField("support_email", v)}
                      isInvalid={!!errors.support_email}
                      errorMessage={errors.support_email}
                    />

                    <Input
                      {...inputProps}
                      label="Frontend URL"
                      placeholder="https://app.example.com"
                      value={branding.frontend_url || ""}
                      onValueChange={(v) => setBrandingField("frontend_url", v)}
                      isInvalid={!!errors.frontend_url}
                      errorMessage={errors.frontend_url}
                    />
                  </div>
                  <div>
                    <Textarea
                      variant="bordered"
                      radius="lg"
                      label="Copyright / legal line"
                      labelPlacement="outside"
                      placeholder="© 2026 Acme Corp. All rights reserved."
                      value={branding.copyright_text || ""}
                      onValueChange={(v) => setBrandingField("copyright_text", v)}
                      minRows={2}
                      classNames={{
                        label: inputComfortableClasses.label,
                        inputWrapper:
                          "bg-default-50 dark:bg-default-100/10 border-default-200 dark:border-default-100/15 rounded-xl",
                      }}
                    />
                    <CharCount value={branding.copyright_text || ""} max={160} />
                  </div>
                </SectionCard>

                <SectionCard
                  icon={Link2}
                  iconClass="bg-sky-500/15 text-sky-600 dark:text-sky-400"
                  title="Legal &amp; help links"
                  subtitle="External URLs shown to users in the app footer and settings."
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    {[
                      { key: "privacy_url", label: "Privacy policy URL", ph: "https://…/privacy" },
                      { key: "terms_url", label: "Terms of service URL", ph: "https://…/terms" },
                      { key: "status_url", label: "Status page URL", ph: "https://status.example.com" },
                      { key: "docs_url", label: "Docs / help center URL", ph: "https://docs.example.com" },
                    ].map(({ key, label, ph }) => (
                      <Input
                        key={key}
                        {...inputProps}
                        label={label}
                        placeholder={ph}
                        value={(branding as any)[key] || ""}
                        onValueChange={(v) => setBrandingField(key, v)}
                        isInvalid={!!(errors as any)[key]}
                        errorMessage={(errors as any)[key]}
                      />
                    ))}
                  </div>
                </SectionCard>
              </div>

              <aside className="space-y-5 xl:col-span-5 xl:sticky xl:top-4">
                <BrandingPreviewCard branding={branding} />
              </aside>
            </div>
          )}

          {/* ── MOBILE TAB ── */}
          {activeTab === "mobile" && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
              <div className="space-y-6 xl:col-span-7">
                <SectionCard
                  icon={AlertTriangle}
                  iconClass="bg-warning-500/15 text-warning-600 dark:text-warning-400"
                  title="Maintenance mode"
                  subtitle="Show a banner or block the entire app during incidents."
                >
                  <div
                    className={`rounded-xl border-2 p-4 sm:p-5 transition-colors ${
                      mobileApp.maintenance_mode
                        ? "border-warning-400/60 bg-warning-50/80 dark:bg-warning-500/10 dark:border-warning-500/40"
                        : "border-default-200/80 dark:border-default-100/10 bg-default-50/40 dark:bg-default-100/5"
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-default-800 dark:text-default-100">
                            Enable maintenance mode
                          </p>
                          <p className="text-xs text-default-500 mt-0.5 leading-relaxed">
                            Shows a banner on the login screen and all authenticated screens.
                          </p>
                        </div>
                        <Switch
                          size="lg"
                          color="primary"
                          isSelected={!!mobileApp.maintenance_mode}
                          onValueChange={(v) => setMobileField("maintenance_mode", v)}
                          aria-label="Toggle maintenance mode"
                          classNames={{ 
                            base: "opacity-100 visible",
                            wrapper: "group-data-[selected=true]:bg-primary",
                          }}
                          thumbIcon={({ isSelected, className }) =>
                            isSelected ? (
                              <Check className={className} size={16} />
                            ) : (
                              <Power className={className} size={16} />
                            )
                          }
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest mr-2">
                            {mobileApp.maintenance_mode ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </Switch>
                      </div>

                      <Divider />

                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className={`text-sm font-medium ${mobileApp.maintenance_mode ? "text-default-800 dark:text-default-100" : "text-default-400"}`}>
                            Full-screen block
                          </p>
                          <p className="text-xs text-default-500 mt-0.5 leading-relaxed">
                            Requires maintenance mode. Shows a modal — users can only sign out.
                          </p>
                        </div>
                        <Switch
                          size="lg"
                          color="danger"
                          isSelected={!!mobileApp.maintenance_blocking}
                          isDisabled={!mobileApp.maintenance_mode}
                          onValueChange={(v) => setMobileField("maintenance_blocking", v)}
                          aria-label="Toggle maintenance blocking"
                          classNames={{ 
                            base: "opacity-100 visible",
                            wrapper: "group-data-[selected=true]:bg-danger",
                          }}
                          thumbIcon={({ isSelected, className }) =>
                            isSelected ? (
                              <Check className={className} size={16} />
                            ) : (
                              <Power className={className} size={16} />
                            )
                          }
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest mr-2">
                            {mobileApp.maintenance_blocking ? 'BLOCKING' : 'OPEN'}
                          </span>
                        </Switch>
                      </div>

                      <div>
                        <Textarea
                          variant="bordered"
                          radius="lg"
                          label="Maintenance message"
                          labelPlacement="outside"
                          placeholder="We are updating the service, back shortly…"
                          value={mobileApp.maintenance_message || ""}
                          onValueChange={(v) => setMobileField("maintenance_message", v)}
                          minRows={2}
                          classNames={{
                            label: inputComfortableClasses.label,
                            inputWrapper:
                              "bg-content1 dark:bg-content1 border-default-200 dark:border-default-100/15 rounded-xl",
                          }}
                        />
                        <CharCount value={mobileApp.maintenance_message || ""} max={200} />
                      </div>
                    </div>
                  </div>

                  <Input
                    {...inputProps}
                    label="Minimum app version"
                    placeholder="e.g. 1.4.0"
                    description="Sent as a hint to the client. Enforcement is done client-side."
                    value={mobileApp.min_app_version || ""}
                    onValueChange={(v) => setMobileField("min_app_version", v)}
                  />
                </SectionCard>

                <SectionCard
                  icon={Flag}
                  iconClass="bg-primary/15 text-primary"
                  title="Feature flags"
                  subtitle="Toggle mobile client capabilities without a deployment."
                >
                  {/* Search */}
                  <Input
                    variant="bordered"
                    radius="lg"
                    size="sm"
                    placeholder="Search flags…"
                    startContent={<Search size={14} className="text-default-400" />}
                    value={flagSearch}
                    onValueChange={setFlagSearch}
                    classNames={{
                      inputWrapper:
                        "bg-default-50 dark:bg-default-100/10 border-default-200 dark:border-default-100/15",
                    }}
                  />

                  <div className="flex flex-col gap-2.5">
                    {filteredFlags.length === 0 && (
                      <p className="text-sm text-default-400 py-2">No flags match your search.</p>
                    )}
                    {filteredFlags.map(({ key, title, desc }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between gap-3 rounded-xl border border-default-200/70 dark:border-default-100/10 bg-default-50/30 dark:bg-default-100/[0.04] px-4 py-3.5"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-default-900 dark:text-default-100">
                              {title}
                            </p>
                            <Chip
                              size="sm"
                              color={flags[key] !== false ? "success" : "default"}
                              variant="flat"
                              className="text-[10px] font-mono h-4 px-1.5"
                            >
                              {flags[key] !== false ? "on" : "off"}
                            </Chip>
                          </div>
                          <p className="text-xs text-default-500 mt-0.5 leading-relaxed">{desc}</p>
                        </div>
                        <Switch
                          size="lg"
                          color="success"
                          isSelected={flags[key] !== false}
                          onValueChange={(v) => setFlag(key, v)}
                          aria-label={`Toggle flag ${title}`}
                          classNames={{ 
                            base: "opacity-100 visible",
                            wrapper: "group-data-[selected=true]:bg-success",
                          }}
                          thumbIcon={({ isSelected, className }) =>
                            isSelected ? (
                              <Check className={className} size={16} />
                            ) : (
                              <Power className={className} size={16} />
                            )
                          }
                        >
                          <span className="text-[9px] font-black uppercase tracking-widest">
                            {flags[key] !== false ? 'ON' : 'OFF'}
                          </span>
                        </Switch>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>

              <aside className="space-y-5 xl:col-span-5 xl:sticky xl:top-4">
                <MobileStatusCard mobileApp={mobileApp} flags={flags} />
              </aside>
            </div>
          )}

          {/* ── EMAIL TAB ── */}
          {activeTab === "email" && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
              <div className="space-y-6 xl:col-span-7">
                <SectionCard
                  icon={Mail}
                  iconClass="bg-success/15 text-success"
                  title="Email copy"
                  subtitle="Reference strings for transactional email templates. SMTP is configured on the API server."
                >
                  <div>
                    <Textarea
                      variant="bordered"
                      radius="lg"
                      label="Welcome footer note"
                      labelPlacement="outside"
                      placeholder="Thanks for joining. If you need help, reply to this email…"
                      value={emailCopy.welcome_footer_note || ""}
                      onValueChange={(v) => setEmailField("welcome_footer_note", v)}
                      minRows={3}
                      classNames={{
                        label: inputComfortableClasses.label,
                        inputWrapper:
                          "bg-default-50 dark:bg-default-100/10 border-default-200 dark:border-default-100/15 rounded-xl",
                      }}
                    />
                    <CharCount value={emailCopy.welcome_footer_note || ""} max={400} />
                  </div>

                  <Input
                    {...inputProps}
                    label="Alert signature line"
                    placeholder="— ThingsNXT Team"
                    value={emailCopy.alert_signature || ""}
                    onValueChange={(v) => setEmailField("alert_signature", v)}
                  />

                  <div>
                    <Textarea
                      variant="bordered"
                      radius="lg"
                      label="Password reset note"
                      labelPlacement="outside"
                      placeholder="If you did not request a password reset, please ignore this email."
                      value={emailCopy.pw_reset_note || ""}
                      onValueChange={(v) => setEmailField("pw_reset_note", v)}
                      minRows={2}
                      classNames={{
                        label: inputComfortableClasses.label,
                        inputWrapper:
                          "bg-default-50 dark:bg-default-100/10 border-default-200 dark:border-default-100/15 rounded-xl",
                      }}
                    />
                    <CharCount value={emailCopy.pw_reset_note || ""} max={200} />
                  </div>

                  <Input
                    {...inputProps}
                    label="Unsubscribe footer"
                    placeholder="You're receiving this because you have an account at …"
                    value={emailCopy.unsubscribe_note || ""}
                    onValueChange={(v) => setEmailField("unsubscribe_note", v)}
                  />
                </SectionCard>
              </div>

              <aside className="space-y-5 xl:col-span-5 xl:sticky xl:top-4">
                <EmailPreviewCard emailCopy={emailCopy} branding={branding} />
              </aside>
            </div>
          )}

          {/* ── CONFIG PREVIEW TAB ── */}
          {activeTab === "preview" && (
            <Card
              className="rounded-2xl border border-default-200/80 dark:border-default-100/12 bg-content1 overflow-hidden"
              shadow="none"
            >
              <CardHeader className="flex gap-3 pb-3 pt-5 px-6 border-b border-default-200/50 dark:border-default-100/10">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-default-100 dark:bg-default-100/10">
                  <Code2 size={15} className="text-default-500" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold font-heading text-default-900 dark:text-default-100">
                    Public config
                    <Chip size="sm" variant="flat" className="font-mono text-[11px] ml-2">
                      GET /app/config
                    </Chip>
                  </h3>
                  <p className="text-xs text-default-500 mt-0.5">Exact JSON clients receive after save.</p>
                </div>
                <Button
                  size="sm"
                  variant="flat"
                  radius="md"
                  startContent={
                    copied ? (
                      <CheckCircle2 size={13} className="text-success" />
                    ) : (
                      <Copy size={13} />
                    )
                  }
                  onPress={copyJson}
                  color={copied ? "success" : "default"}
                >
                  {copied ? "Copied" : "Copy JSON"}
                </Button>
              </CardHeader>
              <CardBody className="p-0">
                <pre className="text-[11.5px] leading-relaxed font-mono overflow-auto max-h-[min(70vh,600px)] p-6 m-0 bg-[hsl(222,47%,8%)] text-emerald-400/95 dark:bg-[hsl(222,47%,6%)]">
                  {JSON.stringify(publicPreview, null, 2)}
                </pre>
              </CardBody>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default PlatformSettings;