// @ts-nocheck
"use client";

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { 
  Skeleton, 
  Chip, 
  Divider, 
  Button, 
  Progress,
  Badge
} from '@heroui/react';
import { 
  Activity,
  Signal,
  Terminal,
  Radio,
  Wifi,
  Wind,
  Layers,
  Search,
  Crosshair,
  Lock,
  ArrowUpRight,
  Cpu as CpuIcon
} from 'lucide-react';
import { EliteCard } from '@/components/ui/elite-card';

/* ─────────────────────── types ─────────────────────── */
interface NodeRecord {
  id: string;
  name: string;
  status: 'online' | 'offline' | string;
  type?: string;
}

interface AnalyticsStats {
  current_stats?: {
    total_devices?: number;
    active_devices?: number;
    total_users?: number;
  };
  mesh_vitals?: {
    latency: string;
    saturation: string;
  };
}

/* ─────────────────────── sub-components ─────────────────────── */

/** Small Pulse Indicator */
const Pulse = ({ color = 'primary' }: { color?: string }) => (
  <div className="relative flex h-2 w-2">
    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-${color}/40 opacity-75`}></span>
    <span className={`relative inline-flex rounded-full h-2 w-2 bg-${color}`}></span>
  </div>
);

/** Registry Row component for the side list */
function NodeRegistryRow({ node }: { node: NodeRecord }) {
  const isOnline = node.status === 'online';
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-divider/10 bg-background/30 hover:bg-primary/[0.04] hover:border-primary/20 transition-all cursor-pointer group hover:translate-x-1">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative h-10 w-10 shrink-0 rounded-lg bg-default-100 flex items-center justify-center text-default-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
          <Wifi size={18} strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase italic tracking-tight text-foreground truncate break-all [overflow-wrap:anywhere]">
            {node.name}
          </p>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
            {node.type || 'Standard_Node'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
         <span className={`text-[8px] font-black uppercase tracking-widest ${isOnline ? 'text-success' : 'text-danger'}`}>
           {isOnline ? 'Live' : 'Dark'}
         </span>
         <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-danger'}`} />
      </div>
    </div>
  );
}

const MissionControl = () => {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeNodes, setActiveNodes] = useState<NodeRecord[]>([]);
  const [signalStrength, setSignalStrength] = useState(85);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      setSignalStrength(prev => Math.min(100, Math.max(70, prev + (Math.random() - 0.5) * 10)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, devicesRes] = await Promise.all([
        adminApi.getAnalytics(),
        adminApi.getDevices({ limit: 12 })
      ]);
      setStats(analyticsRes.data);
      
      const deviceList = devicesRes.data.data || devicesRes.data || [];
      setActiveNodes(Array.isArray(deviceList) ? deviceList : []);
    } catch (error) {
      console.error('Mission Control initialization failed:', error);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  const filteredNodes = activeNodes.filter(node => 
    node.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 8);

  return (
    <div className="admin-page space-y-10">
      {/* 🚀 ELITE MISSION CONTROL HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-default-100/30 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full animate-pulse"></div>
            <div className="relative w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/40 border border-white/20 rotate-3 group-hover:rotate-0 transition-transform duration-700">
              <Crosshair size={32} strokeWidth={2.5} className="animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge content="LIVE" color="danger" size="sm" shape="rectangle" className="font-black text-[8px] animate-pulse">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Sector_Control.v4</span>
              </Badge>
              <div className="h-px w-12 bg-divider/20"></div>
              <span className="text-[9px] font-bold text-default-400 uppercase tracking-widest font-mono">UPLINK_098_BETA</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-default-900 uppercase italic leading-none">
              Mission <span className="text-primary not-italic">Control</span>
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 relative z-10">
          <div className="flex flex-col items-end gap-1 px-6 border-r border-divider/10">
            <span className="text-[9px] font-black text-default-400 uppercase tracking-widest">Signal_Integrity</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-success font-mono tracking-tighter">{signalStrength.toFixed(0)}%</span>
              <Signal size={16} className="text-success" />
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-background/50 p-2 rounded-2xl border border-divider/20 shadow-xl">
             <Button 
               isIconOnly 
               variant="flat" 
               className="h-12 w-12 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:scale-105 transition-all"
               onClick={fetchData}
             >
               <Activity size={20} className={loading ? "animate-spin" : ""} />
             </Button>
             <Divider orientation="vertical" className="h-8 mx-1 opacity-20" />
             <div className="flex flex-col px-2">
                <span className="text-[8px] font-black text-default-400 uppercase tracking-widest leading-none mb-1">Local_Time</span>
                <span className="text-sm font-black text-default-900 font-mono tracking-tighter">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
             </div>
          </div>
        </div>
      </div>

      {/* 📊 TACTICAL GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: NODE REGISTRY & SEARCH */}
        <div className="lg:col-span-4 space-y-6">
          <EliteCard variant="glass" className="p-0 border-divider/10 overflow-hidden">
            <div className="p-6 border-b border-divider/10 bg-default-50/50">
               <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                     <CpuIcon size={16} className="text-primary" />
                     <span className="font-black uppercase tracking-[0.2em] text-[10px] italic">Tactical Node Registry</span>
                  </div>
                  <div className="flex items-center gap-2 bg-primary/10 px-2 py-0.5 rounded-full">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
                    <span className="text-[8px] font-black text-primary uppercase tracking-widest">Live</span>
                  </div>
               </div>
               <div className="relative">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" />
                <input 
                  type="text" 
                  placeholder="ID_SEQUENCE SCAN..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-background/50 border-2 border-divider/30 rounded-xl py-3 pl-11 pr-4 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>
            
            <div className="p-3 max-h-[480px] overflow-y-auto scrollbar-hide space-y-2">
              {loading ? (
                [1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl opacity-20" />)
              ) : filteredNodes.length > 0 ? (
                filteredNodes.map(node => <NodeRegistryRow key={node.id} node={node} />)
              ) : (
                <div className="p-10 text-center space-y-3">
                   <div className="flex justify-center"><Terminal size={24} className="text-muted-foreground/30" /></div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No matches found in Registry</p>
                </div>
              )}
            </div>
          </EliteCard>

          <EliteCard variant="glass" className="bg-secondary/5 border-secondary/10 overflow-hidden relative">
             <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-secondary/10 blur-[80px] rounded-full"></div>
             <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-secondary/10 rounded-xl text-secondary border border-secondary/20">
                   <Lock size={18} strokeWidth={2.5} />
                </div>
                <div>
                   <h4 className="font-black uppercase tracking-widest text-[11px] italic leading-tight">IAM_SENTINEL</h4>
                   <p className="text-[8px] font-bold text-default-400 uppercase tracking-widest">Access Clearance Monitor</p>
                </div>
             </div>
             <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-end">
                   <span className="text-[9px] font-black uppercase text-default-400 tracking-widest">Validation_Rate</span>
                   <span className="text-sm font-black text-secondary font-mono tracking-tighter italic">99.98%</span>
                </div>
                <Progress 
                  value={99.98} 
                  size="sm" 
                  color="secondary" 
                  className="bg-secondary/10" 
                  classNames={{ indicator: "bg-gradient-to-r from-secondary to-secondary/40 shadow-[0_0_8px_rgba(var(--secondary-rgb),0.5)]" }}
                />
             </div>
          </EliteCard>
        </div>

        {/* CENTER: TELEMETRY PULSE & HEATMAP */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EliteCard variant="glass" className="relative group h-[420px] overflow-hidden p-6 border-divider/10">
               <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/20 overflow-hidden">
                  <div className="absolute top-0 left-0 h-full w-24 animate-bar-sweep bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),1)]" />
               </div>
               
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20 shadow-lg">
                       <Radio size={20} className="animate-pulse" strokeWidth={2.5} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black uppercase tracking-tighter italic leading-none">Signal_Spectrum</h3>
                       <p className="text-[9px] font-black text-default-400 uppercase tracking-[0.2em] mt-1">Wideband Spectral Analysis</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                     <span className="text-[8px] font-black text-primary uppercase tracking-widest leading-none mb-1">Carrier_Freq</span>
                     <span className="text-lg font-black text-default-900 font-mono tracking-tighter italic">2.482 GHz</span>
                  </div>
               </div>

               <div className="flex items-end justify-between h-48 gap-2 relative px-2">
                  <div className="absolute inset-0 border-b border-divider/10 flex flex-col justify-between py-1 pointer-events-none">
                     <div className="h-px w-full bg-divider/10 border-dashed border-t"></div>
                     <div className="h-px w-full bg-divider/20"></div>
                     <div className="h-px w-full bg-divider/10 border-dashed border-t"></div>
                  </div>
                  {[40, 70, 45, 90, 65, 30, 85, 55, 40, 75, 45, 60, 95, 20, 50, 70, 40].map((h, i) => (
                    <div 
                      key={i}
                      style={{ height: `${h}%` }}
                      className="flex-1 min-h-[5%] bg-gradient-to-t from-primary/90 via-primary/40 to-transparent rounded-t-sm group-hover:scale-y-105 transition-all duration-700"
                    />
                  ))}
               </div>
               
               <div className="mt-8 grid grid-cols-2 gap-4 pt-6 border-t border-divider/10">
                  <div className="flex flex-col gap-1 p-3 bg-default-100/30 rounded-xl border border-divider/10">
                    <span className="text-[8px] font-black text-default-400 uppercase tracking-widest">Peak_Load</span>
                    <span className="text-sm font-black text-default-800 font-mono tracking-tighter italic">184.2 Mbps</span>
                  </div>
                  <div className="flex flex-col gap-1 p-3 bg-default-100/30 rounded-xl border border-divider/10">
                    <span className="text-[8px] font-black text-default-400 uppercase tracking-widest">Packet_Loss</span>
                    <span className="text-sm font-black text-success font-mono tracking-tighter italic">0.002%</span>
                  </div>
               </div>
            </EliteCard>

            <EliteCard variant="glass" className="relative group h-[420px] p-6 border-divider/10 overflow-hidden">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-secondary/10 rounded-xl text-secondary border border-secondary/20 shadow-lg">
                       <Layers size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black uppercase tracking-tighter italic leading-none">Grid_Fabric</h3>
                       <p className="text-[9px] font-black text-default-400 uppercase tracking-[0.2em] mt-1">Multi-Cell Node Distribution</p>
                    </div>
                  </div>
                  <Chip size="sm" variant="flat" color="secondary" className="font-black uppercase text-[8px] tracking-widest px-3">Stable</Chip>
               </div>

               <div className="grid grid-cols-4 gap-3 flex-1">
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                    <div key={i} className="aspect-square bg-default-100/30 rounded-xl border border-divider/10 flex items-center justify-center relative overflow-hidden group/cell">
                       <div
                         className="absolute inset-2 bg-secondary/15 rounded-lg blur-md opacity-40 animate-pulse"
                         style={{ animationDelay: `${i * 0.12}s` }}
                       />
                       <span className="text-[9px] font-black text-default-400 relative z-10 group-hover/cell:text-secondary group-hover/cell:scale-110 transition-all font-mono">N.{i}</span>
                    </div>
                  ))}
               </div>
               
               <div className="mt-8 flex justify-between items-center pt-6 border-t border-divider/10">
                  <div className="flex items-center gap-2">
                     <Pulse color="secondary" />
                     <span className="text-[8px] font-black uppercase text-secondary tracking-widest animate-pulse italic">Scanning_Nodes...</span>
                  </div>
                  <span className="text-[8px] font-black text-default-400 uppercase tracking-widest italic opacity-60">Sync_OK</span>
               </div>
            </EliteCard>
          </div>

          <EliteCard variant="glass" className="bg-default-900 text-white border-white/10 relative overflow-hidden h-[320px] p-8">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-primary/10 via-transparent to-transparent pointer-events-none"></div>
             
             <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                   <div>
                      <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none mb-3">Platform_Hearth</h2>
                      <div className="flex items-center gap-2 text-primary">
                        <Pulse color="primary" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] italic mb-0.5">Global_Uplink_Saturation</p>
                      </div>
                   </div>
                   <div className="flex gap-6">
                      <div className="flex flex-col items-end">
                         <span className="text-[9px] font-bold text-default-400 uppercase tracking-widest mb-1">Mesh_Latency</span>
                         <span className="text-2xl font-black text-white font-mono leading-none italic tracking-tighter">{stats?.mesh_vitals?.latency || '12ms'}</span>
                      </div>
                      <div className="w-px h-10 bg-white/10" />
                      <div className="flex flex-col items-end">
                         <span className="text-[9px] font-bold text-default-400 uppercase tracking-widest mb-1">Active_Ordnance</span>
                         <span className="text-2xl font-black text-white font-mono leading-none italic tracking-tighter">
                           {stats?.current_stats?.active_devices ?? 0}
                         </span>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col gap-5">
                   <div className="flex justify-between items-center px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl group hover:bg-white/10 transition-all cursor-pointer shadow-lg shadow-black/20">
                      <div className="flex items-center gap-4">
                         <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success/40 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-success shadow-[0_0_8px_rgba(34,197,94,1)]"></span>
                         </span>
                         <span className="text-xs font-black uppercase tracking-[0.25em] italic">Nexus_Uplink_Authorized</span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-black text-default-400 group-hover:text-primary transition-colors uppercase tracking-widest">
                        Access Deep Audit logs <ArrowUpRight size={14} />
                      </div>
                   </div>
                   <div className="flex justify-between items-end">
                      <div className="flex items-center gap-4 opacity-70">
                         <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                            <Terminal size={14} className="text-primary" />
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[7px] font-black text-default-500 uppercase tracking-widest mb-0.5">Protocol_Stack</span>
                            <span className="text-[9px] font-black text-default-300 uppercase tracking-widest">THINGS_NXT_SECURE_v4.2.1-GOLD</span>
                         </div>
                      </div>
                      <div className="flex items-center gap-8">
                         <div className="flex flex-col items-end">
                            <span className="text-[7px] font-black text-default-500 uppercase tracking-widest mb-1">Topology</span>
                            <div className="flex items-center gap-2">
                               <Wifi size={14} className="text-success" />
                               <span className="text-[11px] font-black text-success uppercase italic">Mesh_Opt</span>
                            </div>
                         </div>
                         <div className="flex flex-col items-end">
                            <span className="text-[7px] font-black text-default-500 uppercase tracking-widest mb-1">Thermal</span>
                            <div className="flex items-center gap-2">
                               <Wind size={14} className="text-primary" />
                               <span className="text-[11px] font-black text-primary uppercase italic">Cool_72F</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </EliteCard>
        </div>
      </div>
    </div>
  );
};

export default MissionControl;
