// @ts-nocheck
"use client";

import React, { useEffect, useState, useRef } from 'react';
import { AppLink } from '@/components/ui/app-link';
import { adminApi } from '@/lib/api';
import {
  Button,
  Input,
  Chip,
  Divider,
  Select,
  SelectItem,
  Switch,
  Progress,
  Tooltip,
  Spinner,
  Textarea as TextArea,
  toast,
} from '@heroui/react';

const Label = ({ children, className = "" }) => (
  <label className={`text-sm font-semibold text-gray-700 mb-1 block ${className}`}>
    {children}
  </label>
);
import {
  Mail,
  Send,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Inbox,
  Clock,
  Settings2,
  Zap,
  Users,
  BarChart3,
  Eye,
  Copy,
  Megaphone,
  ShieldCheck,
  Wifi,
  WifiOff,
  FlaskConical,
  ChevronRight,
  ServerCog,
  Activity,
  Database
} from 'lucide-react';

/* ─────────────────────── types ─────────────────────── */
interface SmtpStatus {
  smtp_configured: boolean;
  host?: string;
  port?: number;
  tls?: boolean;
  from_address?: string;
  queue_size?: number;
  sent_today?: number;
  failed_today?: number;
}

interface TestEmailForm {
  to: string;
  subject: string;
  priority: string;
}

/* ─────────────────────── helpers ─────────────────────── */
const safeText = (val: unknown, fallback = '—'): string =>
  val === null || val === undefined ? fallback : String(val);

/* ─────────────────────── stat card ─────────────────────── */
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: string;
}

function StatCard({ label, value, icon, accent = 'text-blue-600' }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`${accent} shrink-0`}>{icon}</div>
        <div>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── config row ─────────────────────── */
function ConfigRow({ label, value, icon, mono = false }: { label: string; value: string; icon: React.ReactNode; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(value).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }).catch(err => {
        console.warn('Clipboard copy failed:', err);
      });
    }
  };
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 group">
      <div className="flex items-center gap-2 text-gray-600">
        <span className="shrink-0">{icon}</span>
        <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium text-gray-900 ${mono ? 'font-mono' : ''}`}>{value}</span>
        <button
          onClick={copy}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-200"
        >
          {copied ? <CheckCircle2 size={12} className="text-green-600" /> : <Copy size={12} className="text-gray-500" />}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────── main component ─────────────────────── */
const EmailCenter = () => {
  const [status, setStatus] = useState<SmtpStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Test email form
  const [testForm, setTestForm] = useState<TestEmailForm>({
    to: '',
    subject: 'SMTP Delivery Validation',
    priority: 'normal',
  });
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<'success' | 'error' | null>(null);
  const [sendMessage, setSendMessage] = useState('');

  // Template preview
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const ok = status?.smtp_configured;

  const EMAIL_TEMPLATES = [
    { key: 'welcome', label: 'Welcome Message', icon: <Users size={14} />, desc: 'New user onboarding' },
    { key: 'reset', label: 'Password Reset', icon: <ShieldCheck size={14} />, desc: 'Secure reset link' },
    { key: 'alert', label: 'System Alert', icon: <AlertTriangle size={14} />, desc: 'Critical notification' },
    { key: 'digest', label: 'Weekly Digest', icon: <BarChart3 size={14} />, desc: 'Summary report' },
  ];

  /* ── fetch ── */
  const fetchStatus = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoadingStatus(true);
    try {
      const res = await adminApi.getEmailStatus();
      setStatus(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStatus(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  /* ── send test ── */
  const sendTest = async () => {
    if (!testForm.to.trim()) {
      toast.error('Recipient identity required.');
      return;
    }

    const testPromise = adminApi.sendTestEmail(testForm.to.trim(), {
      subject: testForm.subject,
      priority: testForm.priority,
    });

    toast.promise(testPromise, {
      loading: "Injecting validation packet into SMTP stream...",
      success: "Validation packet delivered successfully.",
      error: (err) => err.response?.data?.detail || "SMTP stream injection failure.",
    });
  };

  if (loadingStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-gray-600">Loading email configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Mail size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Email Gateway</span>
                <Chip size="sm" variant="flat" color="success" className="text-[10px] font-semibold">
                  v2.0
                </Chip>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1.5">
                  <Activity size={12} className="text-green-600" />
                  <span className="text-xs text-gray-600">SMTP Service</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-600">
                    {ok ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Center</h1>
          <p className="text-gray-600">Configure SMTP settings, test delivery, and manage email communications.</p>
        </div>

        {/* Status Message for errors */}
        {!ok && status && !loadingStatus && (
          <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">SMTP Not Configured</p>
              <p className="text-sm text-amber-700">
                Please configure SMTP settings in your environment variables to enable email functionality.
              </p>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="space-y-6">
          
          {/* SMTP Status Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${ok ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {ok ? <Wifi size={18} className="text-green-600" /> : <WifiOff size={18} className="text-gray-600" />}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">SMTP Server Status</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {ok ? 'Connection established and ready' : 'Configuration required'}
                    </p>
                  </div>
                </div>
                <Tooltip content="Refresh status">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    className="bg-gray-100"
                    onPress={() => fetchStatus(true)}
                    isLoading={refreshing}
                  >
                    <RefreshCw size={14} />
                  </Button>
                </Tooltip>
              </div>
            </div>

            <div className="p-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard
                  label="SMTP Host"
                  value={safeText(status?.host, 'Not set')}
                  icon={<ServerCog size={16} />}
                />
                <StatCard
                  label="Port"
                  value={safeText(status?.port, '—')}
                  icon={<Zap size={16} />}
                />
                <StatCard
                  label="Sent Today"
                  value={status?.sent_today ?? 0}
                  icon={<Send size={16} />}
                  accent="text-green-600"
                />
                <StatCard
                  label="Failed"
                  value={status?.failed_today ?? 0}
                  icon={<XCircle size={16} />}
                  accent="text-red-600"
                />
              </div>

              {/* Configuration Details */}
              {ok && status && (
                <div className="space-y-3">
                  <Divider className="my-4" />
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Active Configuration
                  </p>
                  <ConfigRow 
                    label="SMTP Endpoint" 
                    value={`${status.host}:${status.port}`} 
                    icon={<ServerCog size={14} />} 
                    mono 
                  />
                  {status.from_address && (
                    <ConfigRow 
                      label="From Address" 
                      value={status.from_address} 
                      icon={<Mail size={14} />} 
                      mono 
                    />
                  )}
                  <ConfigRow
                    label="Encryption"
                    value={status.tls ? 'TLS Enabled' : 'No Encryption'}
                    icon={<ShieldCheck size={14} />}
                  />
                </div>
              )}

              {/* Queue Status */}
              {ok && status?.queue_size !== undefined && status.queue_size > 0 && (
                <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-amber-700">
                      <Clock size={14} />
                      <span className="text-[11px] font-semibold uppercase tracking-wider">Queue Status</span>
                    </div>
                    <span className="text-sm font-bold text-amber-700">{status.queue_size} pending</span>
                  </div>
                  <Progress 
                    value={Math.min((status.queue_size / 100) * 100, 100)} 
                    color="warning" 
                    size="sm" 
                    radius="full" 
                  />
                </div>
              )}
            </div>
          </div>

          {/* Test Email Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FlaskConical size={18} className="text-purple-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Test Delivery</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Verify SMTP configuration with a test message</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="email"
                  label="Recipient Email"
                  placeholder="admin@example.com"
                  value={testForm.to}
                  onValueChange={(v) => setTestForm({ ...testForm, to: v })}
                  startContent={<Inbox size={14} className="text-gray-400" />}
                  classNames={{
                    inputWrapper: "h-12 bg-gray-50 border border-gray-200 rounded-lg focus-within:border-blue-400",
                    label: "text-sm font-medium text-gray-700",
                    input: "text-sm",
                  }}
                  isDisabled={!ok}
                />
                <Select
                  label="Priority"
                  selectedKeys={[testForm.priority]}
                  onSelectionChange={(keys) =>
                    setTestForm({ ...testForm, priority: Array.from(keys)[0] as string })
                  }
                  classNames={{
                    trigger: "h-12 bg-gray-50 border border-gray-200 rounded-lg",
                    label: "text-sm font-medium text-gray-700",
                    value: "text-sm",
                  }}
                  isDisabled={!ok}
                >
                  <SelectItem key="low">Low</SelectItem>
                  <SelectItem key="normal">Normal</SelectItem>
                  <SelectItem key="high">High</SelectItem>
                  <SelectItem key="critical">Critical</SelectItem>
                </Select>
              </div>

              <div className="flex w-full flex-col gap-4">
                <div key="flat" className="flex w-full flex-wrap md:flex-nowrap gap-4">
                  <Input
                    label="Subject"
                    placeholder="Email subject line"
                    variant="flat"
                    value={testForm.subject}
                    onValueChange={(v) => setTestForm({ ...testForm, subject: v })}
                    classNames={{
                      inputWrapper: "h-12 bg-gray-100/50 border-none rounded-xl focus-within:ring-2 ring-blue-400/20",
                      label: "text-sm font-semibold text-gray-700",
                      input: "text-sm",
                    }}
                    isDisabled={!ok}
                  />
                </div>
              </div>

              {/* Action feedback handled by toast.promise() */}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="bordered"
                  className="border-gray-300 text-gray-700 rounded-lg"
                  onPress={() => setTestForm({ ...testForm, to: '', subject: 'SMTP Delivery Validation' })}
                  isDisabled={!ok}
                >
                  Clear
                </Button>
                <Button 
                  color="primary"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6"
                  startContent={!sending && <Send size={14} />}
                  onClick={sendTest}
                  isLoading={sending}
                  isDisabled={!ok || !testForm.to.trim()}
                >
                  {sending ? 'Sending...' : 'Send Test'}
                </Button>
              </div>
            </div>
          </div>

          {/* Templates Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye size={18} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Email Templates</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Pre-configured templates for common communications</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {EMAIL_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.key}
                    onClick={() => setSelectedTemplate(tpl.key === selectedTemplate ? '' : tpl.key)}
                    className={`text-left p-4 rounded-lg border transition-all ${
                      selectedTemplate === tpl.key
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          selectedTemplate === tpl.key ? 'bg-blue-200' : 'bg-gray-100'
                        }`}>
                          {tpl.icon}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{tpl.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{tpl.desc}</p>
                        </div>
                      </div>
                      <ChevronRight 
                        size={16} 
                        className={`text-gray-400 transition-transform ${
                          selectedTemplate === tpl.key ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </button>
                ))}
              </div>

              {selectedTemplate && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-blue-700">
                    <CheckCircle2 size={14} />
                    <span className="text-xs font-medium">
                      {EMAIL_TEMPLATES.find(t => t.key === selectedTemplate)?.label} ready
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      className="bg-white border border-gray-200 text-gray-700 rounded-lg"
                    >
                      <Eye size={12} />
                      <span className="ml-1 text-xs">Preview</span>
                    </Button>
                    <Button
                      size="sm"
                      color="primary"
                      className="bg-blue-600 text-white rounded-lg"
                      isDisabled={!ok}
                    >
                      <Send size={12} />
                      <span className="ml-1 text-xs">Use Template</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Broadcast CTA */}
          <AppLink href="/broadcast" className="block">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-xl">
                    <Megaphone size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-1">
                      Bulk Communications
                    </p>
                    <h3 className="text-lg font-bold text-gray-900">Broadcast Messages</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Send high-priority alerts to all users at once
                    </p>
                  </div>
                </div>
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <ArrowRight size={18} className="text-blue-600" />
                </div>
              </div>
            </div>
          </AppLink>
        </div>
      </div>
    </div>
  );
};

export default EmailCenter;