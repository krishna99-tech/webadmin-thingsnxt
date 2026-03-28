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
import {
  Settings2,
  Save,
  RefreshCw,
  Smartphone,
  Palette,
  Mail,
  Code2,
  Sparkles,
  AlertTriangle,
  Flag,
} from "lucide-react";
import { inputComfortableClasses } from "@/lib/ui-presets";

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
      <CardHeader className="flex gap-4 pb-0 pt-6 px-6 sm:px-8 border-b border-default-200/50 dark:border-default-100/10">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={22} strokeWidth={2} />
        </div>
        <div className="flex flex-col gap-1 min-w-0 py-0.5">
          <h2 className="text-lg font-semibold font-heading text-default-900 dark:text-default-100 tracking-tight">
            {title}
          </h2>
          {subtitle ? (
            <p className="text-sm text-default-500 leading-snug">{subtitle}</p>
          ) : null}
        </div>
      </CardHeader>
      <CardBody className="gap-6 pt-6 px-6 sm:px-8 pb-8">{children}</CardBody>
    </Card>
  );
}

const PlatformSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [branding, setBranding] = useState({});
  const [mobileApp, setMobileApp] = useState({});
  const [emailCopy, setEmailCopy] = useState({});
  const [publicPreview, setPublicPreview] = useState(null);

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
    setSaving(true);
    try {
      await adminApi.updatePlatformSettings({
        branding,
        mobile_app: mobileApp,
        email_copy: emailCopy,
      });
      const pubRes = await systemApi.getPublicAppConfig();
      setPublicPreview(pubRes.data);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.detail || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const flags = mobileApp.feature_flags || {};

  const setFlag = (key, value) => {
    setMobileApp({
      ...mobileApp,
      feature_flags: { ...flags, [key]: value },
    });
  };

  const inputProps = {
    variant: "bordered",
    radius: "lg",
    size: "lg",
    labelPlacement: "outside",
    classNames: inputComfortableClasses,
  };

  const flagRows = [
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
  ];

  return (
    <div className="admin-page max-w-6xl space-y-8 pb-12">
      {/* Page hero */}
      <div className="relative overflow-hidden rounded-2xl border border-default-200/70 dark:border-default-100/12 bg-gradient-to-br from-primary/[0.08] via-content1 to-secondary/[0.06] dark:from-primary/10 dark:via-content1 dark:to-secondary/5 px-6 py-8 sm:px-10 sm:py-10">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5 min-w-0">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/25">
              <Settings2 size={28} strokeWidth={2} />
            </div>
            <div className="min-w-0 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Platform
              </p>
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
              startContent={<RefreshCw size={18} />}
              onPress={load}
              isDisabled={loading}
            >
              Reload
            </Button>
            <Button
              color="primary"
              radius="lg"
              className="font-semibold px-6 shadow-md shadow-primary/25"
              startContent={<Save size={18} />}
              onPress={save}
              isLoading={saving}
              isDisabled={loading}
            >
              Save changes
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-6">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
          <div className="lg:col-span-5">
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12 xl:items-start">
          <div className="space-y-8 xl:col-span-7">
            <SectionCard
              icon={Palette}
              iconClass="bg-violet-500/15 text-violet-600 dark:text-violet-400"
              title="Branding"
              subtitle="Names and URLs shown in the mobile app and public config."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  {...inputProps}
                  label="App display name"
                  placeholder="ThingsNXT"
                  value={branding.app_display_name || ""}
                  onValueChange={(v) => setBranding({ ...branding, app_display_name: v })}
                />
                <Input
                  {...inputProps}
                  label="Company name"
                  placeholder="Your company"
                  value={branding.company_name || ""}
                  onValueChange={(v) => setBranding({ ...branding, company_name: v })}
                />
                <Input
                  {...inputProps}
                  label="Support email"
                  placeholder="support@example.com"
                  type="email"
                  value={branding.support_email || ""}
                  onValueChange={(v) => setBranding({ ...branding, support_email: v })}
                />
                <Input
                  {...inputProps}
                  label="Frontend URL"
                  placeholder="https://…"
                  value={branding.frontend_url || ""}
                  onValueChange={(v) => setBranding({ ...branding, frontend_url: v })}
                />
              </div>
              <Textarea
                variant="bordered"
                radius="lg"
                label="Copyright / legal line"
                labelPlacement="outside"
                placeholder="© 2026 …"
                value={branding.copyright_text || ""}
                onValueChange={(v) => setBranding({ ...branding, copyright_text: v })}
                minRows={3}
                classNames={{
                  label: inputComfortableClasses.label,
                  inputWrapper:
                    "bg-default-50 dark:bg-default-100/10 border-default-200 dark:border-default-100/15 rounded-xl",
                }}
              />
            </SectionCard>

            <SectionCard
              icon={Smartphone}
              iconClass="bg-primary/15 text-primary"
              title="Mobile app"
              subtitle="Maintenance banner, version hints, and feature flags for the Expo client."
            >
              <div
                className={`rounded-xl border-2 p-4 sm:p-5 transition-colors ${
                  mobileApp.maintenance_mode
                    ? "border-warning-400/60 bg-warning-50/80 dark:bg-warning-500/10 dark:border-warning-500/40"
                    : "border-default-200/80 dark:border-default-100/10 bg-default-50/40 dark:bg-default-100/5"
                }`}
              >
                <div className="flex flex-wrap items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning-500/20 text-warning-700 dark:text-warning-400">
                    <AlertTriangle size={20} strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1 space-y-3">
                    <Switch
                      isSelected={!!mobileApp.maintenance_mode}
                      onValueChange={(v) => setMobileApp({ ...mobileApp, maintenance_mode: v })}
                      classNames={{
                        label: "text-sm font-medium text-default-800 dark:text-default-100",
                      }}
                    >
                      Maintenance mode
                    </Switch>
                    <p className="text-xs text-default-500 leading-relaxed">
                      When on, the login screen and every screen after sign-in show this message in a banner (unless full-screen block is enabled below).
                    </p>
                    <Switch
                      isSelected={!!mobileApp.maintenance_blocking}
                      isDisabled={!mobileApp.maintenance_mode}
                      onValueChange={(v) => setMobileApp({ ...mobileApp, maintenance_blocking: v })}
                      classNames={{
                        label: "text-sm font-medium text-default-800 dark:text-default-100",
                      }}
                    >
                      Full-screen maintenance (block app when signed in)
                    </Switch>
                    <p className="text-xs text-default-500 leading-relaxed">
                      Requires maintenance mode. Shows a modal over the whole app with only Sign out—use for hard cutovers.
                    </p>
                    <Textarea
                      variant="bordered"
                      radius="lg"
                      label="Maintenance message"
                      labelPlacement="outside"
                      placeholder="We are updating the service…"
                      value={mobileApp.maintenance_message || ""}
                      onValueChange={(v) => setMobileApp({ ...mobileApp, maintenance_message: v })}
                      minRows={2}
                      classNames={{
                        label: inputComfortableClasses.label,
                        inputWrapper:
                          "bg-content1 dark:bg-content1 border-default-200 dark:border-default-100/15 rounded-xl",
                      }}
                    />
                  </div>
                </div>
              </div>

              <Input
                {...inputProps}
                label="Minimum app version (hint text)"
                placeholder="e.g. 1.4.0"
                description="Shown or enforced by the client when you add version checks."
                value={mobileApp.min_app_version || ""}
                onValueChange={(v) => setMobileApp({ ...mobileApp, min_app_version: v })}
              />

              <Divider className="my-1" />

              <div className="flex items-center gap-2 text-default-700 dark:text-default-200">
                <Flag size={18} className="text-default-400 shrink-0" strokeWidth={2} />
                <span className="text-sm font-semibold font-heading">Feature flags</span>
              </div>
              <div className="flex flex-col gap-3">
                {flagRows.map(({ key, title, desc }) => (
                  <div
                    key={key}
                    className="flex flex-col gap-3 rounded-xl border border-default-200/70 dark:border-default-100/10 bg-default-50/30 dark:bg-default-100/[0.04] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-sm font-medium text-default-900 dark:text-default-100">{title}</p>
                      <p className="text-xs text-default-500 mt-1 leading-relaxed">{desc}</p>
                    </div>
                    <Switch
                      isSelected={flags[key] !== false}
                      onValueChange={(v) => setFlag(key, v)}
                      classNames={{ base: "flex-row-reverse gap-3" }}
                    />
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              icon={Mail}
              iconClass="bg-success/15 text-success"
              title="Email copy"
              subtitle="Reference strings for templates. SMTP remains configured on the API server."
            >
              <Textarea
                variant="bordered"
                radius="lg"
                label="Welcome footer note"
                labelPlacement="outside"
                value={emailCopy.welcome_footer_note || ""}
                onValueChange={(v) => setEmailCopy({ ...emailCopy, welcome_footer_note: v })}
                minRows={3}
                classNames={{
                  label: inputComfortableClasses.label,
                  inputWrapper:
                    "bg-default-50 dark:bg-default-100/10 border-default-200 dark:border-default-100/15 rounded-xl",
                }}
              />
              <Input
                {...inputProps}
                label="Alert signature line"
                placeholder="— ThingsNXT Team"
                value={emailCopy.alert_signature || ""}
                onValueChange={(v) => setEmailCopy({ ...emailCopy, alert_signature: v })}
              />
            </SectionCard>
          </div>

          <aside className="space-y-6 xl:col-span-5 xl:sticky xl:top-4">
            <Card
              className="rounded-2xl border border-default-200/80 dark:border-default-100/12 bg-content1 shadow-sm overflow-hidden"
              shadow="none"
            >
              <CardHeader className="flex gap-3 pb-0 pt-5 px-5 border-b border-default-200/50 dark:border-default-100/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-default-200/50 dark:bg-default-100/10">
                  <Code2 size={18} className="text-default-600 dark:text-default-300" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold font-heading text-default-900 dark:text-default-100">
                    Public config preview
                  </h3>
                  <p className="text-xs text-default-500 mt-0.5">
                    Exact JSON clients receive after save.
                  </p>
                </div>
              </CardHeader>
              <CardBody className="p-0">
                <div className="relative">
                  <pre className="text-[11px] leading-relaxed font-mono overflow-auto max-h-[min(70vh,520px)] p-5 m-0 bg-[hsl(222_47%_8%)] text-emerald-400/95 dark:bg-[hsl(222_47%_6%)] border-t border-white/5">
                    {JSON.stringify(publicPreview, null, 2)}
                  </pre>
                </div>
              </CardBody>
            </Card>

            <Card
              className="rounded-2xl border border-dashed border-primary/30 bg-primary/[0.04] dark:bg-primary/5"
              shadow="none"
            >
              <CardBody className="flex gap-3 p-5">
                <Sparkles className="text-primary shrink-0 mt-0.5" size={18} strokeWidth={2} />
                <div className="text-sm text-default-600 dark:text-default-400 leading-relaxed">
                  <span className="font-medium text-default-800 dark:text-default-200">Tip:</span>{" "}
                  Reload after save to confirm the preview matches what devices will fetch on next launch.
                </div>
              </CardBody>
            </Card>
          </aside>
        </div>
      )}
    </div>
  );
};

export default PlatformSettings;
