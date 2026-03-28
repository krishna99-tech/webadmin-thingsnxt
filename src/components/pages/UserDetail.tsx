// @ts-nocheck
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import { 
  Button, 
  Chip, 
  Divider, 
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tabs,
  Tab,
  Skeleton,
  Select,
  SelectItem,
} from '@heroui/react';
import { 
  ArrowLeft, 
  Shield, 
  Ban, 
  Cpu, 
  History,
  HardDrive,
  CheckCircle,
  AlertCircle,
  User as UserIcon,
  Activity,
  Calendar,
  Hash,
  Zap,
  Lock,
  Edit,
  ShieldCheck,
  Fingerprint,
  ShieldAlert,
  Signal,
  Key,
  Unplug,
  History as HistoryIcon
} from 'lucide-react';
import { EliteCard } from '@/components/ui/elite-card';

const UserDetail = () => {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getUser(id);
      setUserData(response.data);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleUpdateField = async (field, value) => {
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

  const safeText = (val) => {
    if (val === null || val === undefined) return "";
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    if (typeof val === 'boolean') return val ? "TRUE" : "FALSE";
    return String(val);
  };

  if (loading) {
    return (
      <div className="admin-page space-y-10">
        <div className="flex items-center gap-6">
          <Skeleton className="w-16 h-16 rounded-2xl" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-64 rounded-xl" />
            <Skeleton className="h-4 w-40 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <Skeleton className="lg:col-span-4 h-[700px] rounded-[3rem]" />
          <Skeleton className="lg:col-span-8 h-[700px] rounded-[3rem]" />
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-12 sm:p-20 text-center admin-page-muted">
        <EliteCard className="max-w-md mx-auto py-20 border-danger/20">
          <div className="w-20 h-20 bg-danger/10 text-danger rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-danger/20">
            <AlertCircle size={40} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-default-900 leading-none">Identity Null</h2>
          <p className="text-[10px] font-bold text-default-400 uppercase tracking-widest mt-4">Node record not found in the local sector registry</p>
          <Button 
            className="mt-10 font-black uppercase tracking-widest text-[10px] h-14 px-10 rounded-2xl shadow-xl hover:scale-105 transition-all" 
            color="primary" 
            variant="shadow" 
            onClick={() => router.push('/users')}
          >
            Return to Registry
          </Button>
        </EliteCard>
      </div>
    );
  }

  const roleString = safeText(userData.role);
  const accessRight = safeText(userData.access_right || "Standard");
  const isAdmin = roleString === "Admin";

  return (
    <div className="admin-page space-y-10">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div className="flex items-center gap-8">
          <Button 
            isIconOnly 
            variant="flat" 
            radius="2xl" 
            className="w-16 h-16 bg-background border-2 border-divider/40 hover:border-primary hover:text-primary transition-all duration-500 shadow-xl" 
            onClick={() => router.push('/users')}
          >
            <ArrowLeft size={24} strokeWidth={3} />
          </Button>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] leading-none mb-1">Identity_Audit_Registry.v4</span>
            </div>
            <h1 className="text-6xl font-black tracking-tight text-default-900 uppercase italic leading-none">
              Node <span className="text-primary not-italic">Profile</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-default-100/50 backdrop-blur-xl p-3 rounded-2xl border border-divider/20">
          <Button 
            variant="flat" 
            className="font-black uppercase tracking-widest text-[10px] h-14 px-8 bg-background border border-divider shadow-xl hover:translate-y-[-2px] transition-all text-danger"
            startContent={<Key size={18} />}
          >
            Auth Reset
          </Button>
          
          {accessRight !== 'Supreme' && (
            <Button 
              className="font-black uppercase tracking-widest text-[10px] h-14 px-8 bg-secondary/10 text-secondary border border-secondary/20 shadow-xl hover:bg-secondary hover:text-white transition-all duration-500 animate-appearance-in"
              startContent={<ShieldAlert size={18} className="animate-pulse" />}
              isLoading={updating}
              onClick={() => handleUpdateField('access_right', 'Supreme')}
            >
              IAM Escalation
            </Button>
          )}

          <Button 
            className="font-black uppercase tracking-widest text-[10px] h-14 px-10 bg-primary text-white shadow-2xl shadow-primary/30 rounded-2xl hover:scale-105 transition-all"
            startContent={<Edit size={18} />}
          >
            Modify Entry
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Authority & Access Control HUD */}
        <div className="lg:col-span-4 space-y-10">
          <EliteCard className="p-0 overflow-hidden border-divider/30">
            <div className="p-10 text-center flex flex-col items-center bg-default-50/20">
              <div className="relative mb-8 group">
                <div className="absolute -inset-6 bg-gradient-to-tr from-primary/30 to-secondary/30 blur-3xl rounded-full opacity-60 animate-pulse"></div>
                <div className="relative w-40 h-40 rounded-[2.5rem] p-1.5 bg-gradient-to-tr from-primary via-primary/50 to-secondary shadow-[0_24px_50px_-12px_rgba(0,0,0,0.5)] transition-transform duration-700 group-hover:scale-105 group-hover:rotate-2">
                  <div className="w-full h-full rounded-[2.2rem] overflow-hidden border-8 border-background bg-background shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element -- external dicebear SVG */}
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`} 
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-success border-4 border-background flex items-center justify-center text-white shadow-xl">
                  <CheckCircle size={20} strokeWidth={3} />
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase italic text-default-900 leading-tight mb-2 w-full px-4 sm:px-6 text-center break-words [overflow-wrap:anywhere] hyphens-auto">
                {safeText(userData.full_name || userData.username)}
              </h2>
              <p className="text-[11px] font-black text-default-400 font-mono tracking-widest uppercase mb-8 px-4 text-center break-all max-w-full">
                {safeText(userData.email)}
              </p>

              <div className="flex flex-wrap justify-center gap-3">
                <Chip 
                  color={isAdmin ? "secondary" : "primary"} 
                  variant="flat" 
                  className="font-black uppercase text-[10px] h-8 px-4 bg-default-100/50"
                  startContent={<Shield size={14} className="ml-1" />}
                >
                  {roleString} Authority
                </Chip>
                <Chip 
                  color={accessRight === 'Supreme' ? "secondary" : "success"} 
                  variant="flat" 
                  className={`font-black uppercase text-[10px] h-8 px-4 bg-default-100/50 ${accessRight === 'Supreme' ? 'animate-pulse shadow-[0_0_20px_rgba(var(--secondary-rgb),0.3)]' : ''}`}
                  startContent={<Zap size={14} className="ml-1" />}
                >
                  {accessRight}
                </Chip>
              </div>
            </div>

            <Divider className="bg-divider/10" />

            <div className="p-10 space-y-8">
              <div className="space-y-6">
                <Select
                  label="Operational Authority"
                  variant="flat"
                  radius="2xl"
                  selectedKeys={[roleString]}
                  isDisabled={updating}
                  onSelectionChange={(keys) => handleUpdateField('role', Array.from(keys)[0])}
                  classNames={{
                    trigger: "bg-default-100/50 h-16 border-1 border-divider/20",
                    label: "font-black uppercase tracking-widest text-[10px] text-default-400"
                  }}
                >
                  <SelectItem key="User" startContent={<UserIcon size={18}/>}>Standard User</SelectItem>
                  <SelectItem key="Admin" startContent={<ShieldCheck size={18}/>}>System Administrator</SelectItem>
                </Select>

                <Select
                  label="Security Clearance level"
                  variant="flat"
                  radius="2xl"
                  selectedKeys={[accessRight]}
                  isDisabled={updating}
                  onSelectionChange={(keys) => handleUpdateField('access_right', Array.from(keys)[0])}
                  classNames={{
                    trigger: "bg-default-100/50 h-16 border-1 border-divider/20",
                    label: "font-black uppercase tracking-widest text-[10px] text-default-400"
                  }}
                >
                  <SelectItem key="Standard" startContent={<Zap size={18}/>}>Standard Access</SelectItem>
                  <SelectItem key="Elevated" startContent={<Fingerprint size={18} className="text-primary"/>}>Elevated Access</SelectItem>
                  <SelectItem key="Supreme" startContent={<ShieldAlert size={18} className="text-secondary"/>}>Supreme Control</SelectItem>
                </Select>

                <Select
                  label="Operational Status"
                  variant="flat"
                  radius="2xl"
                  selectedKeys={[userData.is_active !== false ? "active" : "suspended"]}
                  isDisabled={updating}
                  onSelectionChange={(keys) => handleUpdateField('is_active', Array.from(keys)[0] === 'active')}
                  classNames={{
                    trigger: "bg-default-100/50 h-16 border-1 border-divider/20",
                    label: "font-black uppercase tracking-widest text-[10px] text-default-400"
                  }}
                >
                  <SelectItem key="active" startContent={<CheckCircle size={18} className="text-success"/>}>Active Identity</SelectItem>
                  <SelectItem key="suspended" startContent={<Ban size={18} className="text-danger"/>}>Revoke Access</SelectItem>
                </Select>
              </div>

              <div className="pt-6 space-y-6">
                {[
                  { icon: Calendar, label: "Entry Date", value: userData.created_at ? new Date(userData.created_at).toLocaleDateString() : 'N/A' },
                  { icon: Activity, label: "Last Pulse", value: userData.last_login ? new Date(userData.last_login).toLocaleTimeString() : 'Inert' },
                  { icon: Hash, label: "Registry ID", value: userData.id, truncate: true },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between px-2 group">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-default-100 rounded-lg text-default-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                        <item.icon size={16} />
                      </div>
                      <span className="text-[11px] font-black uppercase text-default-500 tracking-[0.2em]">{item.label}</span>
                    </div>
                    <span className={`text-xs font-black text-default-900 font-mono tracking-tighter ${item.truncate ? 'truncate max-w-[120px] opacity-60' : ''}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </EliteCard>
        </div>

        {/* Intelligence Stream HUD */}
        <div className="lg:col-span-8">
          <EliteCard className="p-0 overflow-hidden h-full border-divider/30 bg-background/20 backdrop-blur-2xl">
            <Tabs 
              aria-label="User data analysis" 
              variant="underlined"
              color="primary"
              classNames={{
                tabList: "px-10 border-b border-divider/10 w-full pt-8 bg-default-50/20",
                tab: "max-w-fit px-0 h-20 mr-12",
                tabContent: "font-black uppercase tracking-[0.2em] text-xs leading-none group-data-[selected=true]:text-primary transition-all",
                cursor: "w-full bg-primary h-1 rounded-full shadow-lg shadow-primary/40"
              }}
            >
              <Tab 
                key="nodes" 
                title={<div className="flex items-center gap-3"><Cpu size={20} /><span>Tactical Nodes</span></div>}
              >
                <div className="p-10">
                  <Table aria-label="Authenticated nodes" shadow="none" removeWrapper>
                    <TableHeader>
                      <TableColumn className="bg-transparent uppercase text-[11px] font-black tracking-[0.2em] text-default-400 pb-8 border-b border-divider/10">NODE DESIGNATION</TableColumn>
                      <TableColumn className="bg-transparent uppercase text-[11px] font-black tracking-[0.2em] text-default-400 pb-8 border-b border-divider/10">PROTOCOL STATE</TableColumn>
                      <TableColumn className="bg-transparent text-right uppercase text-[11px] font-black tracking-[0.2em] text-default-400 pb-8 border-b border-divider/10">OPERATIONS</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent={
                      <div className="py-32 flex flex-col items-center gap-6 opacity-30">
                        <Unplug size={64} strokeWidth={1} />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Sector Dark: No Hardware Linked</p>
                      </div>
                    }>
                      {(userData.devices || []).map((device) => (
                        <TableRow key={device.id} className="border-b border-divider/5 last:border-0 group hover:bg-primary/[0.03] transition-all duration-500">
                          <TableCell className="py-8">
                             <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-default-100 rounded-2xl flex items-center justify-center text-default-400 border-1 border-divider/20 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all duration-500">
                                   <HardDrive size={24} strokeWidth={2.5} />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-lg font-black tracking-tighter italic uppercase text-default-900 leading-none mb-1">{safeText(device.name)}</span>
                                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">{safeText(device.type || 'IOT_NODE')}</span>
                                </div>
                             </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                               <div className={`w-2.5 h-2.5 rounded-full ${device.status === 'online' ? 'bg-success shadow-[0_0_12px_rgba(34,197,94,0.8)] animate-pulse' : 'bg-danger shadow-[0_0_12px_rgba(239,68,68,0.8)]'}`}></div>
                               <Chip 
                                 size="sm" 
                                 color={device.status === 'online' ? "success" : "danger"} 
                                 variant="flat" 
                                 className="uppercase text-[10px] font-black h-8 px-4 bg-default-100/50 tracking-widest"
                               >
                                 {safeText(device.status)}
                               </Chip>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                             <Button isIconOnly variant="flat" className="h-12 w-12 rounded-2xl bg-primary/10 text-primary border-1 border-primary/20 hover:bg-primary hover:text-white transition-all shadow-xl shadow-primary/20" onClick={() => router.push(`/devices`)}>
                               <Signal size={22} />
                             </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Tab>

              <Tab 
                key="pulse" 
                title={<div className="flex items-center gap-3"><HistoryIcon size={20} /><span>Signal Pulse</span></div>}
              >
                <div className="p-10 space-y-6 overflow-y-auto max-h-[600px] scrollbar-hide">
                    {(userData.recent_activity || []).map((log, i) => (
                      <div 
                        key={i}
                        className="relative p-6 rounded-3xl border border-divider/30 bg-background/50 backdrop-blur-3xl hover:bg-default-100/50 hover:border-primary/30 transition-all duration-500 group overflow-hidden shadow-sm"
                      >
                         <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-500" />
                         <div className="flex justify-between items-center relative z-10">
                            <div className="flex items-center gap-6">
                              <div className="w-14 h-14 rounded-2xl bg-default-100 flex items-center justify-center text-default-500 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500 border-1 border-divider/20 shadow-inner">
                                <Zap size={24} strokeWidth={2.5} />
                              </div>
                              <div className="space-y-1">
                                <p className="text-md font-black text-default-900 tracking-tight uppercase italic leading-none">{safeText(log.action?.replace(/_/g, ' '))}</p>
                                <p className="text-[11px] text-default-400 font-bold uppercase tracking-tight">{safeText(log.subject || 'Nexus Protocol Sync Logged')}</p>
                              </div>
                            </div>
                            <div className="text-right">
                               <p className="text-xs font-black text-default-900 font-mono bg-default-100/50 px-4 py-2 rounded-xl border border-divider/20 shadow-sm leading-none">{new Date(log.timestamp).toLocaleTimeString()}</p>
                               <p className="text-[9px] font-black text-default-400 uppercase tracking-widest mt-2">{new Date(log.timestamp).toLocaleDateString()}</p>
                            </div>
                         </div>
                      </div>
                    ))}
                  
                  {(!userData.recent_activity || userData.recent_activity.length === 0) && (
                    <div className="py-32 text-center flex flex-col items-center gap-6 opacity-30">
                       <History size={64} strokeWidth={1} />
                       <p className="text-[10px] font-black uppercase tracking-[0.4em]">Void Presence: No Signal Recorded</p>
                    </div>
                  )}
                </div>
              </Tab>

              <Tab 
                key="security" 
                title={<div className="flex items-center gap-3"><Lock size={20} /><span>IAM Compliance</span></div>}
              >
                <div className="p-10">
                  <EliteCard className="bg-primary/5 border-primary/20 p-10 overflow-hidden relative">
                     <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
                     <div className="flex items-center gap-6 mb-12 relative z-10">
                        <div className="p-4 bg-primary text-white rounded-[1.5rem] shadow-2xl shadow-primary/30 rotate-2">
                           <ShieldCheck size={32} />
                        </div>
                        <div>
                           <h4 className="text-3xl font-black uppercase italic text-default-900 tracking-tighter leading-none">Security Integrity Audit</h4>
                           <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mt-2">IAM_Sector_Compliance: Sector_Optimal</p>
                        </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        {[
                          { label: "Biometric Identity", value: "VERIFIED", status: "success", icon: Fingerprint },
                          { label: "MFA Authentication", value: "ENCRYPTED", status: "success", icon: Lock },
                          { icon: HistoryIcon, label: "Session Lifecycle", value: "AUTO_REVOKE", status: "primary" },
                          { icon: ShieldAlert, label: "Hardware Lock", value: "ACTIVE_SENTRY", status: "warning" },
                        ].map((item, idx) => (
                           <div key={idx} className="bg-background/40 backdrop-blur-xl p-6 rounded-3xl border border-divider/20 flex justify-between items-center group/item hover:border-primary/40 transition-all duration-500 shadow-sm hover:translate-y-[-2px]">
                              <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-default-100 rounded-xl text-default-400 group-hover/item:text-primary group-hover/item:bg-primary/10 transition-colors">
                                  <item.icon size={18} />
                                </div>
                                <span className="text-[11px] font-black uppercase text-default-500 tracking-[0.2em]">{item.label}</span>
                              </div>
                              <Chip size="sm" color={item.status} variant="flat" className="font-black uppercase text-[10px] h-8 px-4 bg-default-100/30 tracking-widest">{item.value}</Chip>
                           </div>
                        ))}
                     </div>
                  </EliteCard>
                </div>
              </Tab>
            </Tabs>
          </EliteCard>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
