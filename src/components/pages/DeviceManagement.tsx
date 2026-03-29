// @ts-nocheck
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/lib/api';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Pagination,
  Chip,
  Tooltip,
  Tabs,
  Tab,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  useDisclosure,
  Avatar,
  Progress,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  toast,
} from '@heroui/react';
import {
  Search,
  Cpu,
  Trash2,
  RefreshCw,
  UserCheck,
  Activity,
  Zap,
  Unplug,
  Box,
  Hash,
  Signal,
  ShieldCheck,
  Globe,
  Download,
  MoreVertical,
  Eye,
  WifiOff,
  Wifi,
  Clock,
  Tag,
  CheckCircle2,
  XCircle,
  MonitorDot,
} from 'lucide-react';
import { EliteCard } from '@/components/ui/elite-card';

/* ─────────────────────── types ─────────────────────── */
interface DeviceRecord {
  id: string;
  name: string;
  type?: string;
  status: 'online' | 'offline' | string;
  owner_name?: string;
  owner_email?: string;
  owner_id?: string;
  last_active?: string;
  firmware?: string;
  ip_address?: string;
  signal_strength?: number;
}

type StatusFilter = 'all' | 'online' | 'offline';

/* ─────────────────────── helpers ─────────────────────── */
const safeText = (val: unknown): string =>
  val === null || val === undefined ? '' : String(val);

const formatTime = (iso?: string) => {
  if (!iso) return null;
  const d = new Date(iso);
  return {
    time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: d.toLocaleDateString(),
  };
};

const shortId = (id: string) => `ID_${id.slice(-8).toUpperCase()}`;

/* ─────────────────────── stat card ─────────────────────── */
interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent?: string;
  sub?: string;
}

function StatCard({ label, value, icon, accent = 'text-primary', sub }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 p-5 rounded-2xl bg-muted/30 border border-border/40 hover:border-primary/30 hover:bg-primary/[0.03] transition-all duration-300">
      <div className={`p-3 rounded-xl bg-background border border-border/50 ${accent} shadow-sm shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
          {label}
        </p>
        <p className="text-2xl font-black tracking-tighter text-foreground leading-none mt-0.5">
          {value}
        </p>
        {sub && (
          <p className="text-[10px] font-bold text-muted-foreground mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────── status badge ─────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const online = status === 'online';
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${
          online
            ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse'
            : 'bg-danger shadow-[0_0_6px_rgba(239,68,68,0.4)]'
        }`}
      />
      <Chip
        color={online ? 'success' : 'danger'}
        variant="flat"
        size="sm"
        className="font-black uppercase tracking-widest text-[10px] h-7 px-3"
      >
        {online ? 'Online' : 'Offline'}
      </Chip>
    </div>
  );
}

/* ─────────────────────── signal bar ─────────────────────── */
function SignalBar({ strength }: { strength?: number }) {
  if (strength === undefined) {
    return <span className="text-[10px] text-muted-foreground font-bold">—</span>;
  }
  const color = strength >= 70 ? 'success' : strength >= 40 ? 'warning' : 'danger';
  return (
    <div className="flex flex-col gap-1 min-w-[80px]">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Signal
        </span>
        <span className="text-[10px] font-black text-foreground">{strength}%</span>
      </div>
      <Progress value={strength} color={color} size="sm" radius="full" className="max-w-[80px]" />
    </div>
  );
}

/* ─────────────────────── device node cell ─────────────────────── */
function DeviceNodeCell({ device }: { device: DeviceRecord }) {
  return (
    <div className="flex items-center gap-4 min-w-0">
      <div className="relative shrink-0 group/icon">
        <div className="absolute -inset-1.5 bg-primary/15 blur-md rounded-xl opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300" />
        <div className="relative p-3 rounded-xl bg-muted/50 text-primary border border-border hover:border-primary/40 transition-all duration-300 shadow-sm">
          <Box size={20} strokeWidth={2} />
        </div>
      </div>
      <div className="flex flex-col min-w-0">
        <span className="font-black text-sm tracking-tight uppercase italic text-foreground leading-none mb-1 truncate">
          {safeText(device.name)}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">
            {safeText(device.type || 'Generic_IoT')}
          </span>
          <span className="w-1 h-1 rounded-full bg-border shrink-0" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {safeText(device.firmware || 'HW_REV.v2.4')}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── owner cell ─────────────────────── */
function OwnerCell({ device }: { device: DeviceRecord }) {
  if (!device.owner_name && !device.owner_email) {
    return (
      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 italic">
        Unassigned
      </span>
    );
  }
  return (
    <div className="flex items-center gap-3 min-w-0">
      <Avatar
        size="sm"
        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(device.owner_name || '')}`}
        radius="md"
        className="shrink-0 border border-border/50"
      />
      <div className="min-w-0">
        <p className="text-sm font-black tracking-tight text-foreground truncate">
          {safeText(device.owner_name)}
        </p>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">
          {safeText(device.owner_email)}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────── credentials cell ─────────────────────── */
function CredentialsCell({ device }: { device: DeviceRecord }) {
  return (
    <div className="flex flex-col gap-1.5 min-w-[160px]">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-lg border border-border/40">
        <Hash size={11} className="text-muted-foreground shrink-0" />
        <span className="text-[10px] font-black text-foreground truncate uppercase tracking-wider">
          {shortId(device.id)}
        </span>
      </div>
      {device.ip_address && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/20 rounded-lg border border-border/30">
          <Globe size={11} className="text-muted-foreground shrink-0" />
          <span className="text-[10px] font-mono font-bold text-muted-foreground truncate">
            {device.ip_address}
          </span>
        </div>
      )}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-lg border border-primary/15">
        <ShieldCheck size={11} className="text-primary shrink-0" />
        <span className="text-[10px] font-black text-primary uppercase tracking-wider">
          Secure_Sync
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────── provision modal ─────────────────────── */
interface ProvisionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProvision: (data: Partial<DeviceRecord>) => Promise<void>;
  loading: boolean;
}

function ProvisionModal({ isOpen, onOpenChange, onProvision, loading }: ProvisionModalProps) {
  const [form, setForm] = useState({
    name: '',
    type: 'sensor',
    firmware: '',
    ip_address: '',
  });
  const set = (field: string) => (val: string) =>
    setForm((f) => ({ ...f, [field]: val }));

  const handleSubmit = async () => {
    await onProvision(form);
    setForm({ name: '', type: 'sensor', firmware: '', ip_address: '' });
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      backdrop="blur"
      size="2xl"
      classNames={{
        base: 'glass-card border-border/50 rounded-3xl',
        header: 'px-8 pt-8 pb-0',
        body: 'px-8 py-6',
        footer: 'px-8 pb-8 pt-4',
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary rounded-xl text-white shadow-lg shadow-primary/30">
                  <Cpu size={22} />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter italic">
                    Provision Node
                  </h2>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mt-0.5">
                    Fleet Orchestration Protocol
                  </p>
                </div>
              </div>
            </ModalHeader>

            <ModalBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Device Name"
                  placeholder="Node designator"
                  variant="bordered"
                  value={form.name}
                  onValueChange={set('name')}
                  classNames={{
                    inputWrapper: 'h-14 border-2 rounded-xl bg-muted/20',
                    label: 'font-bold text-[10px] uppercase tracking-widest text-muted-foreground',
                  }}
                />
                <Select
                  label="Device Type"
                  variant="bordered"
                  selectedKeys={[form.type]}
                  onSelectionChange={(keys) =>
                    set('type')(Array.from(keys)[0] as string)
                  }
                  classNames={{
                    trigger: 'h-14 border-2 rounded-xl bg-muted/20',
                    label: 'font-bold text-[10px] uppercase tracking-widest text-muted-foreground',
                  }}
                >
                  <SelectItem key="sensor" startContent={<Signal size={16} />}>
                    Sensor Node
                  </SelectItem>
                  <SelectItem key="gateway" startContent={<Globe size={16} />}>
                    Gateway Unit
                  </SelectItem>
                  <SelectItem key="controller" startContent={<Cpu size={16} />}>
                    Controller Hub
                  </SelectItem>
                  <SelectItem key="monitor" startContent={<MonitorDot size={16} />}>
                    Monitor Station
                  </SelectItem>
                </Select>
                <Input
                  label="Firmware Version"
                  placeholder="e.g. v2.4.1"
                  variant="bordered"
                  value={form.firmware}
                  onValueChange={set('firmware')}
                  classNames={{
                    inputWrapper: 'h-14 border-2 rounded-xl bg-muted/20',
                    label: 'font-bold text-[10px] uppercase tracking-widest text-muted-foreground',
                  }}
                />
                <Input
                  label="IP Address"
                  placeholder="e.g. 192.168.1.100"
                  variant="bordered"
                  value={form.ip_address}
                  onValueChange={set('ip_address')}
                  classNames={{
                    inputWrapper: 'h-14 border-2 rounded-xl bg-muted/20',
                    label: 'font-bold text-[10px] uppercase tracking-widest text-muted-foreground',
                  }}
                />
              </div>
            </ModalBody>

            <ModalFooter>
              <Button
                variant="light"
                color="danger"
                className="font-black uppercase text-[10px] tracking-widest"
                onPress={onClose}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                className="font-black uppercase tracking-widest text-[10px] px-10 h-12 shadow-xl shadow-primary/25 rounded-xl hover:scale-105 transition-all"
                onPress={handleSubmit}
                isLoading={loading}
              >
                Finalize Provision
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

/* ─────────────────────── detail modal ─────────────────────── */
interface DetailModalProps {
  device: DeviceRecord | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailModal({ device, isOpen, onOpenChange }: DetailModalProps) {
  if (!device) return null;
  const ts = formatTime(device.last_active);
  const online = device.status === 'online';

  const rows = [
    { label: 'Device ID', value: shortId(device.id), icon: <Hash size={14} /> },
    { label: 'Type', value: safeText(device.type || 'Generic_IoT'), icon: <Tag size={14} /> },
    { label: 'Firmware', value: safeText(device.firmware || 'HW_REV.v2.4'), icon: <Zap size={14} /> },
    { label: 'IP Address', value: safeText(device.ip_address || '—'), icon: <Globe size={14} /> },
    {
      label: 'Last Active',
      value: ts ? `${ts.time} · ${ts.date}` : 'Signal Lost',
      icon: <Clock size={14} />,
    },
    {
      label: 'Owner',
      value: safeText(device.owner_name || 'Unassigned'),
      icon: <UserCheck size={14} />,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      backdrop="blur"
      size="md"
      classNames={{
        base: 'glass-card border-border/50 rounded-3xl',
        header: 'px-8 pt-8 pb-0',
        body: 'px-8 py-6',
        footer: 'px-8 pb-8 pt-4',
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-xl border ${
                    online
                      ? 'bg-success/10 text-success border-success/20'
                      : 'bg-danger/10 text-danger border-danger/20'
                  }`}
                >
                  {online ? <Wifi size={20} /> : <WifiOff size={20} />}
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter italic">
                    {safeText(device.name)}
                  </h2>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mt-0.5">
                    Node Telemetry Overview
                  </p>
                </div>
              </div>
            </ModalHeader>

            <ModalBody>
              <div className="space-y-3">
                {/* Status banner */}
                <div
                  className={`flex items-center gap-3 p-4 rounded-2xl border ${
                    online
                      ? 'bg-success/5 border-success/20'
                      : 'bg-danger/5 border-danger/20'
                  }`}
                >
                  {online ? (
                    <CheckCircle2 size={18} className="text-success shrink-0" />
                  ) : (
                    <XCircle size={18} className="text-danger shrink-0" />
                  )}
                  <span
                    className={`text-sm font-black uppercase tracking-widest ${
                      online ? 'text-success' : 'text-danger'
                    }`}
                  >
                    {online
                      ? 'Node is online and transmitting'
                      : 'Node is offline — no signal detected'}
                  </span>
                </div>

                {/* Signal strength */}
                {device.signal_strength !== undefined && (
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/40">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                      Signal Strength
                    </p>
                    <div className="flex items-center gap-4">
                      <Progress
                        value={device.signal_strength}
                        color={
                          device.signal_strength >= 70
                            ? 'success'
                            : device.signal_strength >= 40
                            ? 'warning'
                            : 'danger'
                        }
                        size="md"
                        radius="full"
                        className="flex-1"
                      />
                      <span className="text-sm font-black text-foreground shrink-0">
                        {device.signal_strength}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Info rows */}
                <div className="grid grid-cols-1 gap-2">
                  {rows.map(({ label, value, icon }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between px-4 py-3 rounded-xl bg-muted/20 border border-border/30"
                    >
                      <div className="flex items-center gap-2.5 text-muted-foreground">
                        {icon}
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {label}
                        </span>
                      </div>
                      <span className="text-xs font-black text-foreground uppercase tracking-wide">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button
                variant="light"
                className="font-black uppercase text-[10px] tracking-widest"
                onPress={onClose}
              >
                Close
              </Button>
              <Button
                color="primary"
                className="font-black uppercase tracking-widest text-[10px] px-8 h-12 rounded-xl"
                startContent={<RefreshCw size={14} />}
              >
                Re-Sync Node
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

/* ─────────────────────── main component ─────────────────────── */
const DeviceManagement = () => {
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceRecord | null>(null);
  const [globalStats, setGlobalStats] = useState<any>(null);

  const {
    isOpen: isProvisionOpen,
    onOpen: onProvisionOpen,
    onOpenChange: onProvisionOpenChange,
  } = useDisclosure();
  const {
    isOpen: isDetailOpen,
    onOpen: onDetailOpen,
    onOpenChange: onDetailOpenChange,
  } = useDisclosure();

  // Prefer global stats when available, fall back to page-level counts
  const onlineCount =
    globalStats?.current_stats?.online_devices ??
    devices.filter((d) => d.status === 'online').length;
  const offlineCount =
    globalStats?.current_stats?.offline_devices ??
    devices.filter((d) => d.status !== 'online').length;
  const fleetTotal = globalStats?.current_stats?.total_devices ?? total;

  useEffect(() => {
    fetchDevices();
    fetchGlobalStats();
  }, [page, search, statusFilter]);

  const fetchGlobalStats = async () => {
    try {
      const res = await adminApi.getAnalytics();
      setGlobalStats(res.data);
    } catch (e) {
      console.error('Error fetching global stats:', e);
    }
  };

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: search || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
      };
      const response = await adminApi.getDevices(params);
      const deviceData =
        response.data?.data ||
        response.data?.devices ||
        (Array.isArray(response.data) ? response.data : []);
      const deviceTotal =
        response.data?.total ??
        (Array.isArray(response.data) ? response.data.length : 0);
      setDevices(deviceData);
      setTotal(deviceTotal);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleProvision = async (data: Partial<DeviceRecord>) => {
    const provisionPromise = (async () => {
      await adminApi.createDevice(data);
      await fetchDevices();
      onProvisionOpenChange(false);
    })();

    toast.promise(provisionPromise, {
      loading: "Initiating hardware provisioning protocol...",
      success: "Tactical node successfully added to fleet.",
      error: (err) => err.response?.data?.detail || "Provisioning protocol failure.",
    });
  };

  const handleDelete = async (deviceId: string) => {
    // Note: confirm() removed in favor of toast.promise feedback patterns, 
    // though for dangerous actions a custom Modal component would be safer than window.confirm
    const deletePromise = (async () => {
      await adminApi.deleteDevice(deviceId);
      await fetchDevices();
    })();

    toast.promise(deletePromise, {
      loading: "Executing cryptographic node purge...",
      success: "Node successfully expunged from local fleet.",
      error: (err) => err.response?.data?.detail || "Purge protocol failure.",
    });
  };

  const handleResync = async (device: DeviceRecord) => {
    const resyncPromise = (async () => {
      await adminApi.resyncDevice(device.id);
      await fetchDevices();
    })();

    toast.promise(resyncPromise, {
      loading: "Recalibrating node telemetry alignment...",
      success: "Node successfully re-synchronized.",
      error: (err) => err.response?.data?.detail || "Recalibration failure.",
    });
  };

  /* ── columns ── */
  const columns = [
    { name: 'TACTICAL NODE', uid: 'name' },
    { name: 'ALLOCATED OPERATOR', uid: 'owner' },
    { name: 'PROTOCOL STATE', uid: 'status' },
    { name: 'SIGNAL', uid: 'signal' },
    { name: 'LAST PULSE', uid: 'last_active' },
    { name: 'CREDENTIALS', uid: 'credentials' },
    { name: 'OPERATIONS', uid: 'actions' },
  ];

  const renderCell = (device: DeviceRecord, columnKey: string) => {
    switch (columnKey) {
      case 'name':
        return <DeviceNodeCell device={device} />;

      case 'owner':
        return <OwnerCell device={device} />;

      case 'status':
        return <StatusBadge status={device.status} />;

      case 'signal':
        return <SignalBar strength={device.signal_strength} />;

      case 'last_active': {
        const ts = formatTime(device.last_active);
        return (
          <div className="flex flex-col">
            <span className="text-sm font-black text-foreground tracking-tight italic">
              {ts?.time ?? 'Signal Lost'}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
              {ts?.date ?? 'Inert Node'}
            </span>
          </div>
        );
      }

      case 'credentials':
        return <CredentialsCell device={device} />;

      case 'actions':
        return (
          <div className="flex justify-end items-center gap-2">
            <Tooltip content="View Telemetry" closeDelay={0}>
              <Button
                isIconOnly
                variant="flat"
                size="sm"
                className="bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary hover:text-white transition-all duration-300"
                onPress={() => {
                  setSelectedDevice(device);
                  onDetailOpen();
                }}
              >
                <Eye size={16} />
              </Button>
            </Tooltip>

            <Dropdown className="glass-card rounded-2xl border-border/50">
              <DropdownTrigger>
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground rounded-xl transition-colors"
                >
                  <MoreVertical size={18} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Device Actions" className="p-2 gap-1">
                <DropdownItem
                  key="resync"
                  startContent={<RefreshCw size={16} className="text-primary" />}
                  className="rounded-lg h-10 font-bold text-xs"
                  onPress={() => handleResync(device)}
                >
                  Re-Sync Node
                </DropdownItem>
                <DropdownItem
                  key="transfer"
                  startContent={<UserCheck size={16} className="text-muted-foreground" />}
                  className="rounded-lg h-10 font-bold text-xs"
                >
                  Transfer Ownership
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  startContent={<Trash2 size={16} />}
                  color="danger"
                  className="rounded-lg h-10 font-bold text-xs text-danger"
                  onPress={() => handleDelete(device.id)}
                >
                  Purge Node
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );

      default:
        return safeText((device as Record<string, unknown>)[columnKey]);
    }
  };

  /* ── render ── */
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">

      {/* ── Page Header ── */}
      <div className="relative p-10 rounded-[2.5rem] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-blue-500/4 to-transparent" />
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-primary/8 rounded-full blur-[80px] animate-pulse" />

        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <Signal size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                Fleet_Ordnance_Console.v4
              </span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-foreground italic leading-none">
              Fleet<span className="text-gradient not-italic">.Sync_</span>
            </h1>
            <p className="text-muted-foreground font-medium text-base max-w-md">
              Real-time hardware orchestration, mesh telemetry validation, and secure
              cryptographic provisioning.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-background/60 backdrop-blur-xl p-2.5 rounded-2xl border border-border/50 shadow-xl">
            <Button
              variant="flat"
              size="md"
              className="font-black uppercase tracking-widest text-[10px] px-6 bg-muted/50 border border-border rounded-xl hover:bg-muted transition-all"
              startContent={<Download size={16} className="text-primary" />}
            >
              Export
            </Button>
            <Button
              color="primary"
              size="md"
              className="font-black uppercase tracking-widest text-[10px] px-8 shadow-xl shadow-primary/25 rounded-xl hover:scale-[1.03] transition-all"
              startContent={<Cpu size={16} strokeWidth={2.5} />}
              onPress={onProvisionOpen}
            >
              Provision Node
            </Button>
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Fleet"
          value={fleetTotal}
          icon={<Box size={18} />}
          sub="registered nodes"
        />
        <StatCard
          label="Online"
          value={onlineCount}
          icon={<Wifi size={18} />}
          accent="text-success"
          sub="active signal"
        />
        <StatCard
          label="Offline"
          value={offlineCount}
          icon={<WifiOff size={18} />}
          accent="text-danger"
          sub="no signal"
        />
        <StatCard
          label="Coverage"
          value={fleetTotal > 0 ? `${Math.round((onlineCount / fleetTotal) * 100)}%` : '—'}
          icon={<Activity size={18} />}
          accent="text-primary"
          sub="fleet uptime"
        />
      </div>

      {/* ── Table Card ── */}
      <EliteCard variant="glass" padding="none" className="border-border/40 overflow-visible">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-5 p-8 border-b border-border/20">
          <Tabs
            selectedKey={statusFilter}
            onSelectionChange={(key) => {
              setStatusFilter(key as StatusFilter);
              setPage(1);
            }}
            variant="solid"
            radius="lg"
            classNames={{
              tabList: 'bg-muted/30 p-1 border border-border/50 h-12',
              tab: 'h-full px-6',
              tabContent:
                'font-black text-[10px] uppercase tracking-widest group-data-[selected=true]:text-white',
              cursor: 'bg-primary shadow-xl shadow-primary/30',
            }}
          >
            <Tab key="all" title="All Nodes" />
            <Tab
              key="online"
              title={
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  <span>Online</span>
                </div>
              }
            />
            <Tab
              key="offline"
              title={
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-danger" />
                  <span>Offline</span>
                </div>
              }
            />
          </Tabs>

          <Input
            isClearable
            placeholder="Search by name, type, or IP…"
            startContent={<Search size={18} className="text-primary ml-2" />}
            value={search}
            onClear={() => {
              setSearch('');
              setPage(1);
            }}
            onValueChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            variant="bordered"
            classNames={{
              inputWrapper:
                'h-12 px-4 border-2 border-border/50 hover:border-primary/50 focus-within:!border-primary rounded-xl bg-background transition-all duration-300 focus-within:shadow-lg focus-within:shadow-primary/10',
              input: 'text-sm font-semibold',
              base: 'max-w-[360px] w-full',
            }}
          />
        </div>

        {/* Table — overflow wrapper contains only the table, not the toolbar */}
        <div className="overflow-x-auto p-4 lg:p-8">
          <Table
            aria-label="Fleet Device Matrix"
            shadow="none"
            removeWrapper
            bottomContent={
              total > limit ? (
                <div className="flex w-full justify-center pt-10 pb-4">
                  <Pagination
                    isCompact
                    showControls
                    color="primary"
                    page={page}
                    total={Math.ceil(total / limit)}
                    onChange={setPage}
                    radius="lg"
                    className="font-black"
                    classNames={{ cursor: 'bg-primary shadow-lg shadow-primary/30' }}
                  />
                </div>
              ) : null
            }
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn
                  key={column.uid}
                  align={column.uid === 'actions' ? 'end' : 'start'}
                  className="bg-transparent uppercase text-[10px] font-black tracking-[0.35em] text-muted-foreground pb-6 border-b border-border/20"
                >
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody
              items={devices}
              loadingContent={
                <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto my-8" />
              }
              loadingState={loading ? 'loading' : 'idle'}
              emptyContent={
                <div className="py-24 text-center flex flex-col items-center gap-6">
                  <div className="p-8 bg-muted/20 rounded-3xl border-2 border-dashed border-border/40">
                    <Unplug
                      size={56}
                      className="text-muted-foreground/30 animate-pulse"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-black uppercase italic tracking-tighter text-foreground">
                      Sector_Dark
                    </p>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      No signal traces detected in selected sector
                    </p>
                  </div>
                  <Button
                    color="primary"
                    variant="flat"
                    size="sm"
                    className="font-black uppercase tracking-widest text-[10px]"
                    onPress={onProvisionOpen}
                    startContent={<Cpu size={14} />}
                  >
                    Provision First Node
                  </Button>
                </div>
              }
            >
              {(item) => (
                <TableRow
                  key={item.id}
                  className="border-b border-border/10 last:border-0 hover:bg-primary/[0.025] transition-colors duration-300"
                >
                  {(columnKey) => (
                    <TableCell className="py-5">
                      {renderCell(item, columnKey as string)}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </EliteCard>

      {/* ── Modals ── */}
      <ProvisionModal
        isOpen={isProvisionOpen}
        onOpenChange={onProvisionOpenChange}
        onProvision={handleProvision}
        loading={actionLoading}
      />
      <DetailModal
        device={selectedDevice}
        isOpen={isDetailOpen}
        onOpenChange={onDetailOpenChange}
      />
    </div>
  );
};

export default DeviceManagement;